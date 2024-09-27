const openai = require('../model/openai');
const utility = require('../helper/utility');

exports.text = async function(req, res){

  const data = req.body;
  utility.validate(data, ['prompt']);

  const chatData = await openai.text({ prompt: data.prompt });
  return res.status(200).send({ data: chatData });

}

exports.image = async function(req, res){

  const data = req.body;
  utility.validate(data, ['prompt', 'size']);

  const imageData = await openai.image({ prompt: data.prompt, size: data.size });  
  return res.status(200).send({ data: imageData })

}