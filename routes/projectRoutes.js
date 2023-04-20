const express = require('express');
const router = express.Router();
const projectCtrl = require('../controllers/projectCtrl');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT)

router.route('/')
.get(projectCtrl.getAllProjects)
.post(projectCtrl.createNewProject)
.patch(projectCtrl.updateProject)
.delete(projectCtrl.deleteProject)

router.get('/:id', projectCtrl.getOneProject);

module.exports = router;