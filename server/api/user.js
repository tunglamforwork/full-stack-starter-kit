const express = require('express');
const config = require('config');
const auth = require('../model/auth');
const limiter = require('express-rate-limit');
const userController = require('../controller/userController');
const throttle = config.get('throttle');
const api = express.Router();
const use = require('../helper/utility').use;

/* user */
api.post('/api/user', limiter(throttle.signup), use(userController.create));

api.get('/api/user', auth.verify('user', 'user.read', 'unverified'), use(userController.get));

api.get('/api/user/account', auth.verify('user'), use(userController.account));

api.get('/api/user/permissions', auth.verify('user', 'user.read'), use(userController.permissions));

api.get('/api/user/:id', auth.verify('admin', 'user.read'), use(userController.get));

api.patch('/api/user', auth.verify('user', 'user.update'), use(userController.update));

api.put('/api/user/password', auth.verify('user'), use(userController.password));

api.post('/api/user/verify', auth.verify('user', false, 'unverified'), use(userController.verify));

api.post('/api/user/verify/request', limiter(throttle.signup), auth.verify('user', false, 'unverified'), use(userController.verify.request));

api.put('/api/user/2fa', auth.verify('user'), use(userController['2fa']));

api.post('/api/user/2fa/verify', auth.verify('user'), use(userController['2fa'].verify));

api.delete('/api/user', auth.verify('user', 'user.delete'), use(userController.delete));

api.delete('/api/user/:id', auth.verify('user', 'user.delete', 'unverified'), use(userController.delete));

module.exports = api;
