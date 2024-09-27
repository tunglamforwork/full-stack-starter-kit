const event = require('../model/event');
const chart = require('../helper/chart');

/*
* event.get()
* get all events or a single event
*/

exports.get = async function(req, res){

  const list = await event.get({ id: req.params.id, filter: req.query });

  if (req.query.name){

    // create a chart
    let chartData;
    const times = await event.times(req.query.name);

    if (times?.length){
      chartData = times.map(x => {
        return {

          label: x.time,
          value: x.total
          
        }
      });
    }
       
    return res.status(200).send({ data: { 

      list: list,
      chart: chartData ? chart.create(chartData) : null

    }});
  }

  res.status(200).send({ data: list });

}

/*
* event.delete()
* delete an event
*/

exports.delete = async function(req, res){

  await event.delete({ id: req.params.id });
  res.status(200).send({ message: 'Event deleted' });

}
