const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityCtrl');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT)

router.route('/')
    .get(activityController.getAllActivities)
    .post(activityController.createNewActivity)
    .patch(activityController.updateActivity)
    .delete(activityController.deleteActivity)

router.route('/me')
    .get(activityController.getAllActivitiesByOwner)

router.route('/:id')
    .get(activityController.getAllActivitiesByProject);

module.exports = router;