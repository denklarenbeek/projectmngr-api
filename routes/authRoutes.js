const express = require('express');
const router = express.Router();
const authController = require('../controllers/authCtrl');
const loginLimitter = require('../middleware/loginLimitter');

router.route('/')
    .post(loginLimitter, authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

router.route('/resetpassword')
    .post(authController.resetPassword)

router.route('/changepassword')
    .post(authController.changePassword)

module.exports = router