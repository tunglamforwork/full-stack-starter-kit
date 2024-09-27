const auth = require('../model/auth');
const user = require('../model/user');
const utility = require('../helper/utility');

/*
* user.get()
* get all the users registered on your app
*/

exports.get = async function(req, res){

  const users = await user.get();
  return res.status(200).send({ data: users });

}

/*
* user.update()
* update a user profile
*/

exports.update = async function(req, res){

  const data = req.body;

  const userData = await user.get({ id: req.params.id });
  utility.assert(userData.length, `User doesn't exist`);

  // if changing email - check if it's already used
  if (data.email && data.email !== userData[0].email){

    const exists = await user.get({ email: data.email });
    if (exists.length) throw { message: 'This email address is already registered' };

  }

  await user.update({ id: req.params.id, data: data });
  return res.status(200).send({ message: data.email + ' has been updated' });

}


/*
* user.impersonate()
* generate a token for impersonating a user on the remote app
*/

exports.impersonate = async function(req, res){

  // check user exists
  const userData = await user.get({ id: req.params.id });
  utility.assert(userData.length, 'User does not exist');
  
  // is impersonation enabled?
  utility.assert(userData[0].support_enabled, 'User has disabled impersonation');

  // generate a token that expires in 1 min
  const token = auth.token({ data: { user_id: userData[0].id, permission: 'master' }, duration: 60 });
  return res.status(200).send({ data: { token: token }});

}

/*
* user.delete()
* delete a user and un-attach them from all accounts
* WARNING: use with caution
*/

exports.delete = async function(req, res){

  await user.delete(req.params.id);
  return res.status(200).send({ message: 'User deleted' });

}

