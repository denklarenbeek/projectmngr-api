const express = require('express');
const router = express.Router();
const userController = require('../controllers/userCtrl');
const verifyJWT = require('../middleware/verifyJWT');
const {multerUploads} = require('../middleware/fileHandler');

router.route('/token/:token')
    .get(userController.getUserByToken)

router.route('/activate')
    .post(userController.activateUser)
    
router.use(verifyJWT)

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser)
    .patch(multerUploads, userController.updateUser)
    .delete(userController.deleteUser)


router.route('/invite')
    .post(userController.inviteNewUser)

router.route('/role')
    .post(userController.changeRole)

module.exports = router;