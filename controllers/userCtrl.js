const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const crypto = require('crypto')

const fileHandler = require('../middleware/fileHandler');
const { uploadToCloudinary } = require('../utils/fileUpload');
const sendEmail = require('../utils/email/sendEmail');

// @desc Get All Users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select(['-password', '-reset_token', '-reset_token_expiring']).lean();

    if(!users?.length) {
        return res.status(400).json({message: 'No users found'})
    }

    return res.json(users);

});

const getUserByToken = asyncHandler(async(req, res) => {
    const { token}  = req.params;

    const user = await User.find({inviteToken: token }).select(['email', 'name']).lean()

    if( user.length === 0 ) return res.status(400).json( {message: 'No User Found'} )
    if( user.inviteExpireDate < Date.now() ) return res.status(400).json({ message: 'Token is not valid anymore, please contact the administrator' })

    res.status(201).json({ user })

})

// @desc Create New User
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async(req, res) => {

    const {password, roles, name, picture} = req.body;
    const email = req.body.email.toLowerCase();

    // Confirm Data
    if(!email || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fiels are required' });
    }

    // Check for duplicates
    const duplicate = await User.findOne({ email }).lean().exec();

    if(duplicate) {
        return res.status(409).json({ message: 'The email address already exist' })
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = {
        email, 
        password: hashedPwd, 
        roles, 
        name
    };

    const user = await User.create(userObject);

    if(user) {
        res.status(201).json({ message: `New user ${email} is created`});
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }

});

// @desc Update a User
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async(req, res) => {

    console.log('body', req.file)
    console.log('image', req.image)
    
    const {id, email, roles, status, password, name, customer, picture} = req.body;

    if(!id || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(id).exec();

    if(!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check for duplicates
    const duplicate = await User.findOne({ email }).lean().exec();

    // Allow updates to original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate email' });
    }

    if(email) user.email = email
    if(name) user.name = name
    if(roles) user.roles = roles
    if(status) user.status = status
    if(customer) user.customer = customer

    if(password) {
        user.password = await bcrypt.hash(password, 10);
    }

    if(req.file) {
       const url = await uploadToCloudinary([req.file]);
       user.picture = url[0]
    }

    const updatedUser = await user.save();

    res.json({ message: `Profile of ${updatedUser.email} is updated` })

});

// @desc Delete a User
// @route Delete /users
// @access Private
const deleteUser = asyncHandler(async(req, res) => {

    const { id } = req.body;

    if(!id) {
        return res.status(400).json({ message: 'User ID Required'});
    }

    if(id ===  req.user.id) return res.status(400).json({ message: 'You cannot delete the logged in user'});

    const user = await User.findById(id).exec();

    if(!user) {
        return res.json({ message: `No User Found` })
    }

    const project = await Project.findOne({ participants: id }).lean().exec();

    if(project) {
        user.status = 'Inactive';

        const updatedUser = user.save();

        return res.json({ message: `Profile of is set to inactive because there are projects linked` })
        // Find user and set to not active instead of deleting user
    }
    
    const result = await user.deleteOne();

    res.json({message: `User is deleted`});

});

// @desc Invite New User
// @route POST /users/invite
// @access Private
const inviteNewUser = asyncHandler(async(req, res) => {

    const {email, role, name} = req.body;

    if(!email || !name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicates
    const duplicate = await User.findOne({ email }).lean().exec();

    if(duplicate) {
        console.log('Found a duplicate user by inviting a new one')
        return res.status(409).json({ message: 'The email address already exist' })
    }

    const inviteToken = crypto.randomBytes(24).toString('hex');
    const hashedPwd = await bcrypt.hash(inviteToken, 10);
    let inviteExpireDate = Date.now();
    inviteExpireDate = inviteExpireDate + (2629700000) // 30 dagen

    const customerId = req.user.customer._id //THE CUSTOMER ID OF THE JWT TOKEN USER

    const userObject = {email, roles: [role], name, status: 'Pending', password: hashedPwd, inviteExpireDate, customer: customerId, inviteToken };


    try {
        const user = await User.create(userObject);
        
        if(!user) {
            console.log('Something went wrong creating an user....')
            return res.status(400).json({ message: 'Something went wrong creating an user....' });
        }

        const activateUrl = `${process.env.FRONT_END_URL}/activateuser/${inviteToken}`
    
        const options = { 
            email: email, 
            template: './templates/inviteUser.handlebars', 
            subject: 'Invite for Projectmngr', 
            payload: { 
                activateUrl, 
                name: userObject.name,
                inviteName: req.user.name
    
            }
        }
        await sendEmail(options)
        console.log('Invite Email has been send')
        return res.status(201).json({ message: `New user ${email} is invited`});
        
    } catch (error) {
        console.log(`Something went wrong inviting user`, error)
        return res.status(400).json({ message: 'Invalid user data received' });
    }
})

const activateUser = async (req, res) => {
    const { email, name, password, password2, picture } = req.body

    if(!email || !name || !password || !password2) return res.status(400).json({ message: 'All fields are required' })

    const hashedPwd = await bcrypt.hash(password, 10);

    const user = await User.findOne({email}).exec()

    
    if(email) user.email = email
    if(password) user.password = hashedPwd
    
    if(name) user.name = name
    if(picture) {
        user.picture = picture
    }  else {
        user.picture = `https://eu.ui-avatars.com/api/?name=${name}&size=250"`
    }
    
    console.log(user)
    
    user.inviteExpireDate = null
    user.inviteToken = null
    user.status = 'Active'

    const activatedUser = user.save()

    return res.status(201).json({ activatedUser })

}

const changeRole = async (req, res, next) => {
    const {id, role} = req.body;
    const user = await User.findById(id);
    user.roles = role;
    const response = await user.save()

    if(response) {
        res.status(201).json({ message: `Role of User ${response.name} is changed to ${response.roles[0]}`});
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
}

const changepicture = async (req,res) => {
    console.log(req.file)
}

module.exports = { getAllUsers, getUserByToken, createNewUser, updateUser, deleteUser, inviteNewUser, changeRole, activateUser, changepicture };