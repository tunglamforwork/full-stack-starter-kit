const pushtoken = require('../model/pushtoken');
const utility = require('../helper/utility');

/*
* push_token.create()
* create/update a new push token
*/

exports.create = async function(req, res){

  // does this token already belong to this user?
  utility.validate(req.body, ['push_token']);
  const token = await pushtoken.get({ user: req.user, token: req.body.push_token });

  if (!token?.length)
    await pushtoken.create({ user: req.user, token: req.body.push_token });

  return res.status(200).send({ message: 'Push token saved' });

}
