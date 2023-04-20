const User = require('../models/User');
const Activity = require('../models/Activity');
const asyncHandler = require('express-async-handler');

// @desc Get All Activities
// @route GET /activity
// @access Private
const getAllActivities = asyncHandler(async(req, res) => {
    const activities = await Activity.find().lean().populate('owner project_id', 'name title');

    //Calculate the total hours 

    if(!activities?.length) {
        return res.status(400).json({message: 'No activities found'})
    }

    return res.json(activities);
});

// @desc Get All Activities by Owner
// @route GET /activity/me/
// @access Private
const getAllActivitiesByOwner = asyncHandler(async(req, res) => {

    const {id} = req.params
    console.log(id);
    const project = await Project.findById(id).lean();

    if(!project) {
        return res.status(400).json({message: 'No project found'})
    }
    console.log(project);
    return res.json([project]);

});

// @desc Get All Activities by Project
// @route GET /activity/:projectid
// @access Private
const getAllActivitiesByProject = asyncHandler(async(req, res) => {

    const {id} = req.params
    const activities = await Activity.find({project_id: id}).lean().populate('owner', 'name');

    if(!activities) {
        return res.status(400).json({message: 'No activities found on this project'})
    }

    console.log(typeof [activities]) ;

    return res.json(activities);

});

// @desc Create New Activity
// @route POST /activity
// @access Private
const createNewActivity = asyncHandler(async(req, res) => {

    console.log(req.body)
    
    const {category, owner, project_id, start_date, end_date, quantity, participants, title, color} = req.body;

    // Confirm Data
    if(!owner || !category || !start_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const activityObject = {category, owner, project_id, start_date, quantity, end_date, participants, title, color};

    const activity = await Activity.create(activityObject);

    try {
        if(activity && activity.category !== 'Planned') {
            res.status(201).json({ message: `New activity is logged on ${project_id}`});
        } else if(activity && activity.category === 'Planned') {
            res.status(201).json({ message: `New activity is scheduled`});
        }
    } catch (error) {
        console.error(error.message)
        res.status(400).json({message: error.message})
    }


});

// @desc    Update an Activity
// @route   PATCH /activity
// @access  Private
const updateActivity = asyncHandler(async(req, res) => {
    const {id, title, start_date, end_date, owner, project_id, category, participants} = req.body
    const activity = await Activity.findById(id);

    if(!activity) return res.status(400).json({message: 'Activity does not exist'})


    if(title) activity.title = title
    if(start_date) activity.start_date = start_date
    if(end_date) activity.end_date = end_date
    if(owner) activity.owner = owner
    if(project_id) activity.project_id = project_id
    if(category) activity.category = category
    if(participants) activity.participants = participants

    try {
        const result = await activity.save()
        console.log(result)
        res.status(200).json({message: 'The Activity has been updated'})
    } catch (error) {
        res.status(404).json({message: error.message})
    }

});

// @desc Delete a Activity
// @route Delete /activity
// @access Private
const deleteActivity = asyncHandler(async(req, res) => {

    const { id } = req.body;
    console.log(req.body)

    if(!id) {
        return res.status(400).json({ message: 'Logging ID Required'});
    }

    const activity = await Activity.findById(id).exec();
    
    if(!activity) {
        return res.json({ message: `No Project Found` })
    }

    const result = await activity.deleteOne();

    const reply = `Activity logged on project ${result.project_id} deleted`;

    res.json(reply);

});

module.exports = {getAllActivities, getAllActivitiesByProject, getAllActivitiesByOwner, createNewActivity, updateActivity, deleteActivity}