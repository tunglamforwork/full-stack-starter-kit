const config = require('config');
const domain = config.get('domain');
const settings = config.get('stripe');
const auth = require('../model/auth');
const account = require('../model/mongo/account');
const user = require('../model/mongo/user');
const stripe = require('../model/stripe');
const mail = require('../helper/mail');
const log = require('../model/log');
const token = require('../model/token');
const invite = require('../model/invite');
const utility = require('../helper/utility');
const authController = require('../controller/authController');

/*
 * account.create()
 * create a new account part 1: email/pass or social
 */

exports.create = async function (req, res) {
	const data = req.body;
	utility.validate(data, ['email', 'name', 'password']);

	// confirm_password field is a dummy field to prevent bot signups
	if (data.hasOwnProperty('confirm_password') && data.confirm_password)
		throw { message: 'Registration denied' };

	// check if user has already registered an account
	let userData = await user.get({ email: data.email });

	if (userData) {
		// check if user already owns an account
		const userAccounts = await user.account({ id: userData.id });
		const ownerAccount = userAccounts.find((x) => x.permission === 'owner');
		utility.assert(!ownerAccount, 'You have already registered an account');

		// user already owns a child account, verify password
		const verified = await user.password.verify({
			id: userData.id,
			account: userData.account_id,
			password: data.password,
		});
		utility.assert(
			verified,
			'You already have an account registered with this email address. Please enter your original password to continue.'
		);

		// flag for authController to notify onboarding ui
		// that the user's existing account was used
		req.body.duplicate_user = true;
		req.body.has_password = userData.has_password;

		// save the new password if it exists and user doesn't have one
		if (!req.body.has_password && req.body.password)
			await user.password.save({
				id: userData.id,
				password: req.body.password,
			});
	}

	console.log(`⏱️  Creating account for: ${data.email}`);

	// create the account
	const accountData = await account.create(data.plan);
	req.body.account_id = accountData.id; // pass to auth controller to select new account
	// create the user and assign to account
	data.verified =
		process.env.ENABLE_EMAIL_VERIFICATION === 'true' ? false : true;
	userData = !userData
		? await user.create({ user: data, account: accountData.id })
		: userData;
	await user.account.add({
		id: userData.id,
		account: accountData.id,
		permission: 'owner',
	});

	console.log(`✅ Account created for: ${data.email}`);

	const verificationToken = auth.token({
		data: { timestamp: Date.now(), user_id: userData.id },
		duration: 3600,
	});

	// send verification email
	// await mail.send({

	//   to: userData.email,
	//   template: (req.body.duplicate_user && req.body.has_password) ? 'duplicate-user' : 'new-account',
	//   content: {

	//     name: userData.name,
	//     verification_token: verificationToken,
	//     domain: utility.validateNativeURL(data.verify_view_url) || `${domain}/signup/verify`

	//   }
	// });

	// authenticate the user
	return await authController.signup(req, res);
};

/*
 * account.plan()
 * create a new account part 2: plan
 */

exports.plan = async function (req, res) {
	const data = req.body;
	const stripeData = {};

	utility.validate(data, ['plan']);

	// check the plan exists
	const plan = settings.plans.find((x) => x.id === data.plan);
	utility.assert(plan, `Plan doesn't exist`);

	const accountData = await account.get(req.account);
	utility.assert(accountData, 'No account with that ID');

	// process stripe subscription for non-free accounts
	// if a 2-factor payment hasn't occurred, create the stripe subscription
	if (data.plan !== 'free') {
		if (data.stripe === undefined) {
			utility.assert(
				data.token?.id,
				'Please enter your credit card details'
			);

			// create a stripe customer and subscribe them to a plan
			stripeData.customer = await stripe.customer.create({
				email: accountData.owner_email,
				token: data.token.id,
			});
			stripeData.subscription = await stripe.customer.subscribe({
				id: stripeData.customer.id,
				plan: data.plan,
			});

			// check for an incomplete payment that requires 2-factor authentication
			if (
				stripeData.subscription?.latest_invoice?.payment_intent
					?.status === 'requires_action'
			) {
				console.log('⚠️  Stripe payment requires further action');

				return res.status(200).send({
					requires_payment_action: true,
					customer: { id: stripeData.customer.id },
					subscription: {
						id: stripeData.subscription.id,
						price: stripeData.subscription.price,
					},
					client_secret:
						stripeData.subscription.latest_invoice.payment_intent
							.client_secret,
				});
			}
		}

		// stripe info hasn't been passed back as part of 2-factor
		if (!data.stripe) data.stripe = stripeData;
	} else {
		// nullify stripe data on free accounts
		data.stripe = {
			customer: { id: null },
			subscription: { id: null },
		};
	}

	// update the account with plan details
	await account.update({
		id: req.account,
		data: {
			plan: data.plan,
			stripe_customer_id: data.stripe?.customer?.id,
			stripe_subscription_id: data.stripe?.subscription?.id,
		},
	});

	// send email
	if (data.plan !== 'free') {
		await mail.send({
			to: accountData.owner_email,
			template: 'new_plan',
			content: {
				name: accountData.owner_name,
				plan: plan.name,
				price: `${plan.currency.symbol}${plan.price}`,
			},
		});
	}

	console.log('✅ Customer added to plan');
	log.create({
		message: 'Customer added to plan',
		body: { plan: plan },
		req: req,
	});
	res.status(200).send({
		plan: data.plan,
		subscription: 'active',
		onboarded: false,
	});
};

/*
 * account.plan.update()
 * upgrade or downgrade the billing plan
 */

exports.plan.update = async function (req, res) {
	const data = req.body;
	utility.validate(data, ['plan']);

	const accountID = req.permission === 'master' ? data.id : req.account;
	const plan = settings.plans.find((x) => x.id === data.plan);
	utility.assert(plan, 'No plan with that ID');

	const accountData = await account.get(accountID);
	utility.assert(accountData, 'Account does not exist');

	// user is upgrading from paid to free,
	// direct them to the upgrade view
	if (accountData.plan === 'free' && plan.id !== 'free') {
		if (req.permission === 'master') {
			throw {
				message:
					'The account holder will need to enter their card details and upgrade to a paid plan.',
			};
		} else {
			return res
				.status(402)
				.send({
					message: 'Please upgrade your account',
					plan: plan.id,
				});
		}
	}

	if (plan.id === 'free') {
		// user is downgrading - cancel the stripe subscription
		if (accountData.stripe_subscription_id) {
			const subscription = await stripe.subscription(
				accountData.stripe_subscription_id
			);
			await account.update({
				id: req.account,
				data: { stripe_subscription_id: null, plan: plan.id },
			});

			if (subscription.status !== 'canceled')
				await stripe.subscription.delete(
					accountData.stripe_subscription_id
				);
		}
	} else {
		// user is switching to a different paid plan
		if (accountData.stripe_subscription_id) {
			// check for active subscription
			let subscription = await stripe.subscription(
				accountData.stripe_subscription_id
			);

			if (
				subscription.status === 'trialing' ||
				subscription.status === 'active'
			) {
				subscription = await stripe.subscription.update({
					subscription: subscription,
					plan: plan.id,
				});
				await account.update({
					id: accountData.id,
					data: { plan: plan.id },
				});
			} else if (subscription.status === 'canceled') {
				// user previously had a subscription, but is now cancelled - create a new one
				await account.update({
					id: req.account,
					data: { stripe_subscription_id: null, plan: 'free' },
				});

				return req.permission === 'master'
					? res
							.status(500)
							.send({
								message:
									'The account holder will need to enter their card details and upgrade to a paid plan.',
							})
					: res
							.status(402)
							.send({
								message:
									'Your subscription was cancelled, please upgrade your account',
							});
			}
		}
	}

	// notify the user
	await mail.send({
		to: accountData.owner_email,
		template: 'plan-updated',
		content: {
			name: accountData.owner_name,
			plan: plan.name,
		},
	});

	// done
	return res.status(200).send({
		message: `Your account has been updated to the ${plan.name} plan`,
		data: { plan: plan.id },
	});
};

/*
 * account.get()
 * get the account
 */

exports.get = async function (req, res) {
	const data = await account.get(req.account);
	return res.status(200).send({ data: data });
};

/*
 * account.subscription()
 * get the account subscription state
 */

exports.subscription = async function (req, res) {
	const subscription = await account.subscription(req.account);

	// format the data
	if (subscription?.data) {
		const start = new Date(subscription.data.current_period_start * 1000)
			.toISOString()
			.split('T')[0]
			.split('-');
		const end = new Date(subscription.data.current_period_end * 1000)
			.toISOString()
			.split('T')[0]
			.split('-');

		subscription.data = {
			current_period_start: `${start[2]} ${utility.convertToMonthName(
				start[1]
			)} ${start[0]}`,
			current_period_end: `${end[2]} ${utility.convertToMonthName(
				end[1]
			)} ${end[0]}`,
		};
	}

	return res.status(200).send({
		data: {
			status: subscription.status,
			object: subscription.data,
		},
	});
};

/*
 * account.upgrade()
 * upgrade a free account to paid subscription plan
 */

exports.upgrade = async function (req, res) {
	const data = req.body;
	const stripeData = {};

	utility.validate(data, ['plan']);

	const newPlanName = settings.plans.find((x) => x.id === data.plan).name;
	const accountData = await account.get(req.account);
	utility.assert(accountData, 'Account does not exist');

	if (accountData.stripe_customer_id && accountData.stripe_subscription_id) {
		// check if customer & subscription already exists
		stripeData.customer = await stripe.customer(
			accountData.stripe_customer_id
		);
		stripeData.subscription = await stripe.subscription(
			accountData.stripe_subscription_id
		);

		if (stripeData.customer || stripeData.stripe_subscription_id) {
			res.status(500).send({
				message: `Your already on the ${accountData.plan} plan.`,
			});
			return false;
		}
	}

	// if a 2-factor payment isn't required, create the stripe subscription
	if (data.stripe === undefined) {
		utility.assert(data.token?.id, 'Please enter your credit card details');

		// create a stripe customer if it doesnt exist
		stripeData.customer = accountData.stripe_customer_id
			? await stripe.customer(accountData.stripe_customer_id)
			: await stripe.customer.create({
					email: accountData.email,
					token: data.token.id,
			  });

		// subscriber customer to a plan
		stripeData.subscription = await stripe.customer.subscribe({
			id: stripeData.customer.id,
			plan: data.plan,
		});

		// check for an incomplete payment that requires 2-factor authentication
		if (
			stripeData.subscription?.latest_invoice?.payment_intent?.status ===
			'requires_action'
		) {
			console.log('⚠️  Stripe payment requires further action');

			res.status(200).send({
				requires_payment_action: true,
				customer: { id: stripeData.customer.id },
				subscription: {
					id: stripeData.subscription.id,
					price: stripeData.subscription.price,
				},
				client_secret:
					stripeData.subscription.latest_invoice.payment_intent
						.client_secret,
			});

			return false;
		}
	}

	// stripe info hasn't been passed back as part of 2-factor
	if (!data.stripe) data.stripe = stripeData;

	// update account plan
	await account.update({
		id: req.account,
		data: {
			plan: data.plan,
			stripe_customer_id: data.stripe?.customer?.id,
			stripe_subscription_id: data.stripe?.subscription?.id,
		},
	});

	// notify the user
	await mail.send({
		to: accountData.owner_email,
		template: 'plan-updated',
		content: {
			name: accountData.owner_name,
			plan: newPlanName,
		},
	});

	// done
	return res.status(200).send({
		message: `Your account has been successfully updated to the ${newPlanName} plan.`,
		data: { plan: data.plan },
	});
};

/*
 * account.card()
 * get the card details for this account
 */

exports.card = async function (req, res) {
	const accountData = await account.get(req.account);
	utility.assert(accountData, 'Account does not exist');

	if (accountData.stripe_customer_id) {
		const customer = await stripe.customer(accountData.stripe_customer_id);
		card = customer.sources?.data?.[0];

		if (card) {
			return res.status(200).send({
				data: {
					brand: card.brand,
					last4: card.last4,
					exp_month: card.exp_month,
					exp_year: card.exp_year,
				},
			});
		} else {
			return res.status(200).send({ data: null });
		}
	}

	return res.status(200).send({ data: null });
};

/*
 * account.card.update()
 * update credit card details
 */

exports.card.update = async function (req, res) {
	utility.assert(req.body.token, 'Please enter a valid credit card', 'token');
	utility.validate(req.body);

	const accountData = await account.get(req.account);
	utility.assert(accountData, 'Account does not exist');

	const customer = await stripe.customer.update({
		id: accountData.stripe_customer_id,
		token: req.body.token.id,
	});

	// notify the user
	await mail.send({
		to: accountData.owner_email,
		template: 'card-updated',
		content: { name: accountData.owner_name },
	});

	return res.status(200).send({
		data: customer?.sources?.data?.[0],
		message: 'Your card details have been updated',
	});
};

/*
 * account.invoice()
 * return the past invoices for this customer
 */

exports.invoice = async function (req, res) {
	let invoices = null;

	const accountData = await account.get(req.account);
	utility.assert(accountData, 'Account does not exist');

	// get the invoices
	if (accountData.stripe_customer_id) {
		invoices = await stripe.customer.invoices({
			id: accountData.stripe_customer_id,
		});

		// format the invoices
		if (invoices?.data?.length) {
			invoices.data = invoices.data.map((invoice) => {
				const total = invoice.total;

				return {
					number: invoice.number,
					date: new Date(invoice.created * 1000),
					status: invoice.status,
					invoice_pdf: invoice.invoice_pdf,
					total: `${utility.currencySymbol[invoice.currency]}${(
						total / 100
					).toFixed(2)}`,
				};
			});
		}
	}

	return res.status(200).send({ data: invoices?.data });
};

/*
 * account.users()
 * return the users and invites on this account
 */

exports.users = async function (req, res) {
	return res.status(200).send({
		data: {
			users: await user.get({ account: req.account }),
			invites: await invite.get({
				account: req.account,
				returnArray: true,
			}),
		},
	});
};

/*
 * account.close()
 * close the account and delete all users associated with it
 */

/*
 * account.close()
 * close the account and delete all users associated with it
 */

exports.close = async function (req, res) {
	// allow master to close account
	const accountId = req.permission === 'master' ? req.params.id : req.account;
	const accountData = await account.get(accountId);
	utility.assert(accountData, 'Account does not exist');

	if (accountData?.plan !== 'free' && accountData?.stripe_customer_id)
		await stripe.customer.delete(accountData?.stripe_customer_id);

	// get a list of users on this account
	const accountUsers = await user.get({ account: accountData.id });

	if (accountUsers.length) {
		for (u of accountUsers) {
			// get the other accounts this user is attached to
			const userAccounts = await user.account({ id: u.id });
			await token.delete({ user: u.id });

			// user is on multiple accounts
			if (userAccounts.length > 1) {
				// un-assign user from this account
				await user.account.delete({
					id: u.id,
					account: accountData.id,
				});

				// if this account is the user's default account
				// update to prevent a redundant default
				if (u.default_account === accountData.id) {
					userAccounts.splice(
						userAccounts.findIndex((x) => x.id === accountId),
						1
					);
					await user.update({
						id: u.id,
						account: accountId,
						data: { default_account: userAccounts[0].id },
					});
				}
			} else {
				// delete the user entirely
				await user.delete({ id: u.id, account: accountData.id });
			}
		}
	}

	// delete the account
	await account.delete(accountData.id);

	await mail.send({
		to: accountData?.owner_email,
		template: 'account-closed',
		content: { name: accountData?.owner_name },
	});

	console.log(`🗑️  Account closed: ${accountData.owner_email}`);
	log.create({ message: 'Account closed', req: req });
	return res.status(200).send({ message: 'Account closed' });
};

/*
 * account.plans()
 * return available billing plans
 */

exports.plans = async function (req, res) {
	const accountData = req.account ? await account.get(req.account) : null;

	return res.status(200).send({
		data: {
			plans: settings.plans,
			active: accountData ? accountData.plan : null,
		},
	});
};
