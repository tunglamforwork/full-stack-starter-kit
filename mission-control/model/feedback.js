const db = require('./knex')();

/*
* feedback.get()
* list feedback items
*/

exports.get = async function(id){

  const cols = ['feedback.id', 'rating', 'comment', 'user.email'];

  return await db('feedback').select(cols)
  .join('user', 'user_id', 'user.id')
  .modify(q => {

    id && q.whereIn('feedback.id', id.split(','));

  });
}

/*
* feedback.metrics()
* sum ratings by group
*/

exports.metrics = async function(){

  const data = await db('feedback').select('*').from('feedback');

  return {
    
    positive: data.filter(x => x.rating === 'positive').length,
    neutral: data.filter(x => x.rating === 'neutral').length,
    negative: data.filter(x => x.rating === 'negative').length

  } 
}


/*
* feedback.delete()
* delete a feedback item
*/

exports.delete = async function(id){

  await db('feedback').del().where({ id: id });
  return id;

}
