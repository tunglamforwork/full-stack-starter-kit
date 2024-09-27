/* demo purposes only - delete me */
const express = require('express');
const demoController = require('../controller/demoController');
const api = express.Router();
const use = require('../helper/utility').use;

api.get('/api/demo/stats', use(demoController.stats));

api.get('/api/demo/revenue', use(demoController.revenue));

api.get('/api/demo/progress', use(demoController.progress));

api.get('/api/demo/users/list', use(demoController.users));

api.get('/api/demo/users/types', use(demoController.users.types))

api.get('/api/demo/progress', use(demoController.progress));

module.exports = api;
