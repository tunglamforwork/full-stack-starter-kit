const db = require('./knex')();

/*
* log.get()
* return single or multiple logs
*/

exports.get = async function({ id, filter }){

  const data = await db('log').select('log.id', 'time', 'message', 'body', 'method', 
    'endpoint', 'user_id', 'user.email as email', 'log.account_id')
  .leftJoin('user', 'user.id', 'log.user_id')
  .modify(q => {

    id && q.where('log.id', id);
    filter.offset && q.offset(filter.offset);
    filter.limit && q.limit(filter.limit)

    if (filter.search){

      const s = filter.search;
      q.whereRaw(`time like '%${s}%' or message like '%${s}%' or body like '%${s}%' 
      or method like '%${s}%' or endpoint like '%${s}%' or email like '%${s}%'`);

    }
  });

  // results are paginated
  if (filter.offset){

    const total = await db('log').count('id as total');

    return {

      results: data,
      total: total[0].total,
  
    }
  }

  return data;
  
}

/*
* log.delete()
* delete a log entry
*/

exports.delete = async function(id){

  return await db('log').del().where('id', id);

}