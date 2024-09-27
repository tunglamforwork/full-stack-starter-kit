const config = require('config');
const domain = config.get('domain');
const account = require('../model/account');
const mail = require('../helper/mail');
const invite = require('../model/invite');
const utility = require('../helper/utility');

/*
* invite.create()
* invite a new user to join an account
*/

exports.create = async function(req, res){

  let data = req.body, invites = [];
  utility.validate(data, ['email']);

  const accountData = await account.get(req.account);
  utility.assert(accountData, 'Account does not exist');

  if (data.permission === 'owner')
    throw { message: 'Permission can be only owner or admin' }

  // split emails
  const emails = data.email.replace(' ', '').split(',');
  const permission = data.permission;

  // check length
  if (emails.length > 10)
    res.status(500).send({ inputError: 'email', message: 'Max 10 emails per invite' });

  // invite each user
  for (email of emails){

    // has user been invited?
    data = await invite.get({ email: email, account: req.account });

    if (data) await invite.update({ id: data.id, data: { date_sent: new Date() }})
    else data = await invite.create({ email: email, permission: permission, account: req.account });

    invites.push(data);
              
    await mail.send({
      to: email,
      template: 'invite',
      content: {

        friend: accountData.owner_name,
        id: data.id,
        email: data.email,
        domain: utility.validateNativeURL(req.body.url) || `${domain}/signup/user`

      }
    });
  }

  const msg = emails.length > 1 ? 'Invites sent' : 'Invite sent';
  return res.status(200).send({ message: msg, data: invites });

};

/*
* invite.get()
* return a list of, or a single invite
*/

exports.get = async function(req, res){

  const data = await invite.get({ id: req.params.id, account: req.account, returnArray: true });
  return res.status(200).send({ data: data });

}

/*
* invite.delete()
* delete a user invite
*/

exports.delete = async function(req, res){

  utility.assert(req.params.id, 'Please provide an invite ID');
  await invite.delete({ id: req.params.id, account: req.account });
  return res.status(200).send({ message: 'Invite deleted', data: req.params.id });

}
