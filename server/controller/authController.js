const config = require('config');
const domain = config.get('domain');
const passport = require('passport');
const auth = require('../model/auth');
const account = require('../model/mongo/account');
const user = require('../model/mongo/user');
const mail = require('../helper/mail');
const login = require('../model/mongo/login');
const token = require('../model/mongo/token');
const speakeasy = require('speakeasy');
const utility = require('../helper/utility');
require('./socialController');

/*
 * auth.signin()
 * authenticate user via email password or social network
 */

exports.signin = async function (req, res, next) {
	const data = req.body;
	let userData,
		useEmail = false; // determine if flow is email or social

	if (data.email) {
		useEmail = true;
		data.provider = 'app';
		utility.validate(data, ['email', 'password']);
	} else {
		// using social, extra fields from jwt
		utility.validate(data, ['token']);
		const decode = auth.token.verify({ token: data.token });
		data.provider = decode.provider;
		data.provider_id = decode.provider_id;
		data.email = decode.email;
	}

	// check user exists
	userData = useEmail
		? await user.get({ email: data.email })
		: await user.get({
				social: { provider: data.provider, id: data.provider_id },
		  });

	utility.assert(userData, 'Please enter the correct login details', 'email');

	// verify password
	if (useEmail) {
		const verified = await user.password.verify({
			id: userData.id,
			account: userData.account_id,
			password: data.password,
		});
		utility.assert(
			verified,
			'Please enter the correct login details',
			'password'
		);
	}

	// get the account
	const accountData = await account.get(userData.account_id);
	utility.assert(
		accountData?.active,
		'Your account has been deactivated. Please contact support.'
	);

	// log the sign in and check if it's suspicious
	const log = await login.create({ user: userData.id, req: req });
	const risk = await login.verify({ user: userData.id, current: log });

	// block the signin & send a magic link if risk level is 3 or user account is disabled
	if (useEmail) {
		if (risk.level === 3 || userData.disabled) {
			await user.update({
				id: userData.id,
				account: userData.account_id,
				data: { disabled: true },
			});
			const token = auth.token({
				data: { id: userData.id },
				duration: 300,
			});

			// await mail.send({
			// 	to: userData.email,
			// 	template: 'blocked_signin',
			// 	content: {
			// 		token: token,
			// 		domain:
			// 			utility.validateNativeURL(data.magic_view_url) ||
			// 			`${domain}/magic`,
			// 	},
			// });

			const msg =
				risk.level === 3
					? 'Your sign in attempt has been blocked due to suspicious activity. '
					: 'Your account has been disabled due to suspicious activity. ';

			return res.status(403).send({
				message:
					msg + 'Please check your email for further instructions.',
			});
		}

		// notify the user of suspicious logins
		// if (risk.level > 0) {
		// 	await mail.send({
		// 		to: userData.email,
		// 		template: 'new_signin',
		// 		content: {
		// 			ip: risk.flag.ip,
		// 			time: risk.time,
		// 			device: risk.flag.device,
		// 			browser: risk.flag.browser,
		// 		},
		// 	});
		// }
	}

	// 2fa is required
	if (userData['2fa_enabled']) {
		// notify the client and use email to identify the user when sending otp
		// send a token so the otp password screen can't be accessed directly without a password
		const jwt = auth.token({
			data: { email: userData.email, provider: data.provider },
			duration: 300,
		});
		return res.status(200).send({ '2fa_required': true, token: jwt });
	}

	// done
	return authenticate(req, res, userData, data);
};

/*
 * auth.signin.otp()
 * confirm a users one time password if 2fa is enabled
 */

exports.signin.otp = async function (req, res, next) {
	let data;
	utility.validate(req.body, ['code', 'jwt']);

	// verify the token
	try {
		data = auth.token.verify({ token: req.body.jwt });
	} catch (err) {
		// tell user to sign in again if token has expired
		if (err.message === 'jwt expired')
			throw { message: 'Token has expired, please try signing in again' };
	}

	// using auth code
	if (req.body.code.length <= 6) {
		// get the users secret
		const secret = await user['2fa'].secret({ email: data.email });
		utility.assert(
			secret,
			'Invalid email address, please try signing in again'
		);

		// verify the otp
		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: req.body.code.replace(/\s+/g, ''),
		});
		utility.assert(verified, 'Invalid verification code. Please try again');
	} else {
		// using backup code
		const verified = await user['2fa'].backup.verify({
			email: data.email,
			code: req.body.code,
		});
		utility.assert(verified, 'Invalid verification code. Please try again');
	}

	// otp ok
	const userData = await user.get({ email: data.email });
	return authenticate(req, res, userData, data);
};

/*
 * auth.signup()
 * authenticate a new account signup (email/pass)
 * this function should only be called internally
 * to generate a token and is not publicly accessible
 */

exports.signup = async function (req, res, next) {
	const data = req.body;
	utility.validate(data, ['email']);

	// check user exists
	const userData = await user.get({
		email: data.email,
		account: data.account_id,
	});
	utility.assert(userData, `You're not registered`);

	// log the sign in and check if it's suspicious
	await login.create({ user: userData.id, req: req });
	return authenticate(req, res, userData, data);
};

/*
 * auth.social()
 * handles passport.js callback after authentication
 * has completed on the external social network
 */

exports.social = async function (req, res, next) {
	const signinURL =
		req.session.deep_signin_url || `${process.env.CLIENT_URL}/signin`;
	const socialURL =
		req.session.deep_social_url ||
		`${process.env.CLIENT_URL}/signin/social`;

	passport.authenticate(
		req.params.provider,
		{ failureRedirect: signinURL },
		async (err, profile) => {
			if (err || !profile.id) {
				console.log(err);
				return res.redirect(
					`${signinURL}?error=${encodeURIComponent(
						err?.message || 'Unauthorized'
					)}`
				);
			}

			// authenticate the user
			const provider = req.params.provider;
			const email = profile.emails[0]?.value;
			const userData = await user.get({
				email: email,
				social: { provider: provider, id: profile.id },
			});

			if (userData) {
				const jwt = auth.token({
					data: {
						provider: provider,
						provider_id: profile.id,
						email: email,
					},
					duration: 300,
				});
				res.redirect(`${socialURL}?provider=${provider}&token=${jwt}`);
			} else {
				res.redirect(
					`${signinURL}?error=${encodeURIComponent(
						`You're not registered`
					)}`
				);
			}
		}
	)(req, res, next);
};

/*
 * auth.magic()
 * generate a magic token
 */

exports.magic = async function (req, res) {
	const userData = await user.get({ email: req.body.email });

	if (userData) {
		// generate a token that expires in 5 mins
		const token = await auth.token({
			data: { id: userData.id },
			duration: 300,
		});

		// send welcome email
		await mail.send({
			to: userData.email,
			template: `magic_signin`,
			content: {
				token: token,
				domain:
					utility.validateNativeURL(req.body.magic_view_url) ||
					`${domain}/magic`,
			},
		});
	}

	// always return a positive response to avoid hinting if user exists
	return res.status(200).send();
};

/*
 * auth.magic.verify()
 * verify a magic token
 */

exports.magic.verify = async function (req, res) {
	const data = req.body;
	utility.validate(data, ['token']);
	const magicToken = auth.token.verify({ token: data.token });

	// check user exists
	const userData = await user.get({ id: magicToken.id });

	// authenticated
	if (userData) {
		// log the sign in and check if it's suspicious
		const log = await login.create({ user: userData.id, req: req });
		const risk = await login.verify({ user: userData.id, current: log });

		// notify the user of suspicious logins
		if (risk.level > 0) {
			await mail.send({
				to: userData.email,
				template: 'new_signin',
				content: {
					ip: risk.flag.ip,
					time: risk.time,
					device: risk.flag.device,
					browser: risk.flag.browser,
				},
			});
		}

		// 2fa is required
		if (userData['2fa_enabled']) {
			// notify the client and use email to identify the user when sending otp
			// send a token so the otp password screen can't be accessed directly without a password
			const jwt = auth.token({
				data: { email: userData.email, provider: 'app' },
				duration: 300,
			});
			return res.status(200).send({ '2fa_required': true, token: jwt });
		}

		return authenticate(req, res, userData, data);
	}

	// error
	return res.status(401).send();
};

/*
 * auth.get()
 * get the auth status of a user
 */

exports.get = async function (req, res) {
	// is there an account/user?
	let hasJWT = false,
		hasSocialToken = false,
		usingSocialSignin;

	// does the user have an active jwt?
	if (req.provider === 'app') {
		usingSocialSignin = false;
		hasJWT = await token.verify({ provider: req.provider, user: req.user });
	}

	// is there an active access_token if the user is
	// signed in via social network or was their account de-authed
	if (req.provider !== 'app') {
		usingSocialSignin = true;
		hasSocialToken = await token.verify({
			provider: req.provider,
			user: req.user,
		});
	}

	// does this user have an active subscription?
	const subscription = await account.subscription(req.account);
	const userAccounts = await user.account({ id: req.user });
	user.update({
		id: req.user,
		account: req.account,
		data: { last_active: new Date() },
	});

	return res.status(200).send({
		data: {
			jwt_token: hasJWT,
			social_token: hasSocialToken,
			subscription: subscription.status,
			accounts: userAccounts,
			account_id: req.account,
			authenticated: usingSocialSignin ? hasSocialToken : hasJWT,
		},
	});
};

/*
 * auth.impersonate()
 * impersonate a user without a password
 * (accessible via master account only - ENSURE STRONG MASTER PASSWORD)
 */

exports.impersonate = async function (req, res, next) {
	utility.assert(req.body.token, 'Authorization token required');
	const data = auth.token.verify({ token: req.body.token });

	utility.assert(
		data.user_id && data.permission === 'master',
		'Invalid token'
	);

	// check user exists
	const userData = await user.get({ id: data.user_id });
	utility.assert(userData, 'User does not exist');

	return authenticate(req, res, userData);
};

/*
 * auth.switch()
 * let the user switch account
 */

exports.switch = async function (req, res) {
	const data = req.body;
	utility.validate(data, ['account']);

	// check user belongs to this account
	const userData = await user.get({ id: req.user, account: data.account });
	utility.assert(userData, `You don't belong to this account.`);

	return authenticate(req, res, userData, data);
};

/*
 * auth.signout()
 * sign the user out
 * destroy any tokens
 */

exports.signout = async function (req, res) {
	// destroy social tokens
	await token.delete({ provider: req.provider, user: req.user });
	return res.status(200).send();
};

/*
 * authenticate()
 * call this function to finalise the auth process
 */

async function authenticate(req, res, userData, data) {
	const provider = data?.provider || 'app';
	const accountData = await account.get(userData.account_id);
	const subscription = await account.subscription(userData.account_id);
	const userAccounts = await user.account({ id: userData.id });

	// create & store the token
	const jwt = auth.token({
		data: {
			accountId: userData.account_id,
			userId: userData.id,
			permission: userData.permission,
			provider: provider,
			...(!userData.verified &&
				provider === 'app' && { unverified: true }),
		},
	});

	// save token
	await token.save({
		provider: provider,
		data: { access: jwt },
		user: userData.id,
	});

	// update user
	user.update({
		id: userData.id,
		account: userData.account_id,
		data: {
			last_active: new Date(),
			disabled: false,
			...(provider !== 'app' && { verified: true }), // verify social accounts
		},
	});

	// return user to server
	return res.status(200).send({
		token: jwt,
		subscription: subscription.status,
		plan: accountData.plan,
		permission: userData.permission,
		name: userData.name,
		accounts: userAccounts,
		account_id: userData.account_id,
		has_password: userData.has_password,
		onboarded: userData.onboarded,
		verified: provider === 'app' ? userData.verified : true, // always true for social
	});
}
