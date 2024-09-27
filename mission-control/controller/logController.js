const log = require('../model/log');

/*
* log.get()
* return log(s)
*/

exports.get = async function(req, res){

  const data = await log.get({ id: req.params.id, filter: req.query });  
  return res.status(200).send({ data: data });

}

/*
* log.delete()
* delete a log
*/

exports.delete = async function(req, res){

  await log.delete(req.params.id);
  return res.status(200).send({ message: 'Log deleted' });

}