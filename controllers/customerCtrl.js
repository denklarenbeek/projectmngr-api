const Customer = require('../models/Customer');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc Get All Customers
// @route GET /customers
// @access Private
const getAllCustomers = asyncHandler(async(req, res) => {
    const customers = await Customer.find().lean()
    if(!customers?.length) {
        return res.status(400).json({message: 'No customers found'})
    }

    return res.json(customers);

});

// @desc Create New Customer
// @route POST /customers
// @access Private
const createNewCustomer = asyncHandler(async(req, res) => {

    const {name, subscription, primary_user} = req.body;

    // Confirm Data
    if(!name || !primary_user || !subscription) {
        return res.status(400).json({ message: 'Name and Primary Contact fields are required' });
    }

    // Check for duplicates
    const duplicate = await Customer.findOne({ name }).lean().exec();

    if(duplicate) {
        return res.status(409).json({ message: 'The Name already exist' })
    }

    const customerObject = {name, subscription, primary_user};

    const customer = await Customer.create(customerObject);

    if(customer) {
        res.status(201).json({ message: `New customer ${name} is created`});
    } else {
        res.status(400).json({ message: 'Invalid customer data received' });
    }

});

// @desc Update a Customer
// @route PATCH /customers
// @access Private
const updateCustomer = asyncHandler(async(req, res) => {

    const {id, name, subscription, primary_user, status} = req.body;

    if(!id) {
        return res.status(400).json({ message: 'ID field is required' });
    }

    const customer = await Customer.findById(id).exec();

    if(!customer) {
        return res.status(400).json({ message: 'Customer not found' });
    }

    // Check for duplicates
    const duplicate = await Customer.findOne({ name }).lean().exec();

    // Allow updates to original customer
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate name' });
    }

    if(name) customer.name = name
    if(status) customer.status = status
    if(subscription) customer.subscription = subscription
    if(primary_user) customer.primary_user = primary_user

    const updatedCustomer = await customer.save();

    res.json({ message: `Customer of ${customer.name} is updated` })

});

// @desc Delete a Customer
// @route Delete /customers
// @access Private
const deleteCustomer = asyncHandler(async(req, res) => {

    const { id } = req.body;

    if(!id) {
        return res.status(400).json({ message: 'Customer ID Required'});
    }

    const customer = await Customer.findById(id).exec();
    
    if(!customer) {
        return res.json({ message: `No Customer Found` })
    }

    const user = await User.findOne({ customer: id }).lean().exec();
    
    if(user) {
        customer.active = false;

        const updatedCustomer = customer.save();

        return res.json({ message: `Customer "${updateCustomer.name}" is set to inactive because there are users linked` })
        // Find customer and set to not active instead of deleting customer
    }
    
    const result = await customer.deleteOne();

    const reply = `Customer "${result.name}" with ID ${result._id} has been deleted`;

    res.json(reply);

});

module.exports = { getAllCustomers, createNewCustomer, updateCustomer, deleteCustomer };