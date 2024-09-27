/*
* EVENT
* log a new client event in the database
*/

import Axios from 'axios';

export function Event(name, metadata){

  Axios.post('/api/event', {

    name: name,
    metadata: metadata

  });
}