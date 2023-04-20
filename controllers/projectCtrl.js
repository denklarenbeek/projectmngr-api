const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const Activity = require('../models/Activity');

// @desc Get All Projects
// @route GET /projects
// @access Private
const getAllProjects = asyncHandler(async(req, res) => {
    if(!req.user) return res.status(401).json({message: 'No Allowed'})

    const { id: userId } = req.user
    const {_id: customer} = req.user.customer
    const isUser = req.user.roles[0] === 'User'
    const isSuperUser = req.user.roles[0] === 'SuperUser'
    let projects

    if(isUser) {
        // A user with the role user can only view projects where is involved in
        projects = await Project.find({$or:[{participants: userId},{owner: userId}]}).lean().populate('owner participants', 'name');
    } else if(isSuperUser) {
        // A user with the role superuser can view all the projects no matter which customer
        projects = await Project.find().lean().populate('owner participants', 'name');
    } else {
        projects = await Project.find({customer}).lean().populate('owner participants', 'name');
    }

    if(!projects?.length) {
        return res.status(400).json({message: 'No projects found'})
    }

    // Get TotalHours, TotalTravelHours, TotalCost, TotalKM directly from the Database

    const activities = await Activity.find();
    const formattedProject = projects.map((project) => {
        let newProject = { ...project }
        let totalHours = activities.reduce((sum, record) => {if(record.category === 'Hours' && record.project_id.toString() === project._id.toString() ) {return sum += record.quantity} return sum}, 0)
        let totalCosts = activities.reduce((sum, record) => {if(record.category === 'Costs' && record.project_id.toString() === project._id.toString() ) {return sum += record.quantity} return sum}, 0)
        let totalKM = activities.reduce((sum, record) => {if(record.category === 'Kilometers' && record.project_id.toString() === project._id.toString() ) {return sum += record.quantity} return sum}, 0)
        let totalTravelHours = activities.reduce((sum, record) => {if(record.category === 'Travel Hours' && record.project_id.toString() === project._id.toString() ) {return sum += record.quantity} return sum}, 0)
        newProject.totals = {
            totalHours,
            totalKM,
            totalCosts,
            totalTravelHours
        }
        return newProject
    })
    return res.json(formattedProject);

});

// @desc Get One Projects
// @route GET /project
// @access Private
const getOneProject = asyncHandler(async(req, res) => {

    const {id} = req.params
    const project = await Project.findById(id).lean();

    if(!project) {
        return res.status(400).json({message: 'No project found'})
    }
    return res.json([project]);

});

// @desc Create New Project
// @route POST /projects
// @access Private
const createNewProject = asyncHandler(async(req, res) => {
    
    const {title, owner, participants, value, status} = req.body;

    // Confirm Data
    if(!title || !owner) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if(participants && !Array.isArray(participants)) {
        return res.status(400).json({ message: 'Invalid participant field' });
    }

    if(value && typeof value !== 'number') {
        return res.status(400).json({ message: 'The value data is invalid' });
    }

    const projectObject = {title, owner, participants, status};

    if(value) {
        projectObject.value = value;
    }

    const project = await Project.create(projectObject);

    if(project) {
        res.status(201).json({ message: `New project ${title} is created`});
    } else {
        res.status(400).json({ message: 'Invalid project data received' });
    }

});

// @desc Update a User
// @route PATCH /users
// @access Private
const updateProject = asyncHandler(async(req, res) => {

    //TODO: ONLY OWNERS OR ADMINS CAN UPDATE PROJECTS

    const {id, title, participants, value, status, started_at, completed_at} = req.body;

    if(!title) {
        return res.status(400).json({ message: 'Title field is required' });
    }

    const project = await Project.findById(id).exec();
    
    if(!project) {
        return res.status(400).json({ message: 'Project not found' });
    }

    if(title) {
        project.title = title
    }

    if(participants) {
        project.participants = participants
    }

    if(value) {
        project.value = value
    }

    if(status) {
        if(status === 'Completed' && project.status !== 'Completed') {
            project.completed_at = new Date().toLocaleDateString('nl-NL');
        }
        project.status = status
    }

    if(started_at) {
        project.started_at = started_at
    }

    if(completed_at) {
        project.completed_at = completed_at
    }

    const updatedProject = await project.save();

    res.json({ message: `Project "${updatedProject.title}" is updated` })

});

// @desc Delete a Project
// @route Delete /projects
// @access Private
const deleteProject = asyncHandler(async(req, res) => {

    const { id } = req.body;

    if(!id) {
        return res.status(400).json({ message: 'Project ID Required'});
    }

    const project = await Project.findById(id).exec();
    
    if(!project) {
        return res.json({ message: `No Project Found` })
    }

    const result = await project.deleteOne();

    const reply = `Project with title ${result.title} & ID ${result._id} deleted`;

    res.json(reply);

});

module.exports = {getAllProjects, getOneProject, createNewProject, updateProject, deleteProject}