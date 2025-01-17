const express = require('express');
const config = require('config');
const limiter = require('express-rate-limit');
const auth = require('../model/auth');
const authController = require('../controller/authController');
const userController = require('../controller/userController');
const throttle = config.get('throttle');
const api = express.Router();
const use = require('../helper/utility').use;

/* user */
api.post('/api/auth', limiter(throttle.signin), use(authController.signin));

api.post('/api/auth/otp', limiter(throttle.signin), use(authController.signin.otp));

api.get('/api/auth', auth.verify('user', null, 'unverified'), use(authController.get));

api.post('/api/auth/magic', limiter(throttle.signin), use(authController.magic));

api.post('/api/auth/magic/verify', limiter(throttle.signin), use(authController.magic.verify));

api.post('/api/auth/password/reset/request', limiter(throttle.password_reset), use(userController.password.reset.request));

api.post('/api/auth/password/reset', limiter(throttle.password_reset), use(userController.password.reset));

api.post('/api/auth/switch', auth.verify('user'), use(authController.switch));

api.post('/api/auth/impersonate', use(authController.impersonate));

api.delete('/api/auth', auth.verify('user', null, 'unverified'), use(authController.signout));

module.exports = api;
