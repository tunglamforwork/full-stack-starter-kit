const feedback = require('../model/feedback');

/*
* feedback.get()
* get all the user feedback items
*/

exports.get = async function(req, res){

  const data = await feedback.get();
  res.status(200).send({ data: data });

}

/*
* feedback.metrics()
* get the feedback metrics for all items
*/

exports.metrics = async function(req, res){

  const data = await feedback.metrics();
  res.status(200).send({ data: data });

}

/*
* feedback.delete()
* delete a feedback item
*/

exports.delete = async function(req, res){

  await feedback.delete(req.params.id);
  res.status(200).send({ message: 'Feedback item deleted' });

}
