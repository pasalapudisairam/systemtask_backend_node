'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

let responseData = {
    status: false,
    data: {
        message: 'Something went wrong. Please check again'
    }
};

var validationError = function (res, err) {
    return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
    User.find({status: true,role:'employee'}, '-salt -hashedPassword', function (err, users) {
        if (err) return res.status(500).send(err);
        res.status(200).json(users);
    });
};

/**
 * Edit a user
 * restriction: 'admin'
 */
exports.editUser = function (req, res) {

    User.findOneAndUpdate({
        _id: req.body._id
    }, {
        $set: req.body
    }, function (err, user) {
        if (!user['status'] ) return res.status(400).send({
            status: false,
            data: {
                message: 'User not exist'
            }
        });
        else if (user && user.status != false) return res.status(200).send({
            status: true,
            data: {
                message: 'Details updated successfully'
            }
        });

        else if (err) return res.status(500).send(err);
    });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
    console.log(">>", req.body);
    var newUser = new User(req.body);
    newUser.role = (req.body.role) ? req.body.role : "employee";
    // newUser.role = "employee";
    newUser.save(function (err, user) {
        if (err) return validationError(res, err);
        var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
        res.json({token: token});
    });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function (err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user.profile);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
    console.log('>>', req.body.name)
    User.findOneAndUpdate({
        _id: req.body.UserId
    }, {
        $set: {
            status: false
        }
    }, function (err, user) {

        console.log("del;", user);
        if (user.status == false) return res.status(400).send({
            status: false,
            data: {
                message: 'User not exist'
            }
        });
        else if (user && user.status != false) return res.status(200).send({
            status: true,
            data: {
                message: 'User deleted'
            }
        });

        else if (err) return res.status(500).send(err);
    });
};
/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {

    console.log(" change pwd", req.body.name);
    let username = req.body.name;
    User.findOne({
        name: username
    }, function (err, userdet) {
        console.log(" user details ", userdet);

        if (userdet) {
            let userId = userdet._id;
            var newPass = String(req.body.newPassword);
            User.findById(userId, function (err, user) {
                if (user) {
                    user.password = newPass;
                    user.save(function (err) {
                        if (err) return validationError(res, err);
                        responseData.data.message = 'Password changed Successfully';
                        responseData.status = true;
                        res.status(200).send(responseData);
                    })
                }
            })
        } else {
            responseData.data.message = 'Password Cannot Change';
            responseData.status = false;
            res.status(404).send(responseData);
        }
    })
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/');
};
