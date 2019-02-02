'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
// router.get('/me', auth.isAuthenticated(), controller.me);
// router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/createuser', controller.create);
router.post('/deleteuser', auth.hasRole('admin'), controller.destroy);// auth.hasRole('admin'),
router.post('/edituser', auth.hasRole('admin'), controller.editUser); //auth.hasRole('admin'),
router.put('/changepassword', controller.changePassword);
router.get('/getemployees', auth.hasRole('admin'), controller.index);
//  auth.isAuthenticated()
module.exports = router;
