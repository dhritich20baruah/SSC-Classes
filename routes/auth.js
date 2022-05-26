const express = require('express');
const router = express.Router();
const Admin = require('../models/login');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchadmin =  require('../middleware/fetchadmin')

const JWT_SECRET = 'deltaweb$services'

//Create admin login: POST "/api/auth". Doesn't require Auth
router.post('/createAdmin', [
    body('adminName', 'Enter valid name').isLength({ min: 3 }),
    body('adminEmail', 'Enter valid email').isEmail(),
    body('adminPassword', 'enter valid password').isLength({ min: 5 })
], async (req, res) => {
    //If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //Check whether the user with this email exists already
    try {
        let admin = await Admin.findOne({ adminEmail: req.body.adminEmail });
        if (admin) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.adminPassword, salt);
        //create a new user
        admin = await Admin.create({
            adminName: req.body.adminName,
            adminPassword: secPass,
            adminEmail: req.body.adminEmail
        });
        const data = {
            user: {
                id: admin.id
            }
        }
        //send the new user as response with JWT 
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured")
    }
})

//Authenticate a user using: "/api/auth/login"
//Route2: Login end points and sending auth token
router.post('/login', [
    body('adminEmail', 'Enter a valid email').isEmail(),
    body('adminPassword', 'Password cannot be blank').exists(),
], async(req, res) => {
    let success = false;
    //if there are err then return bad request and errs
    //express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {adminEmail, adminPassword} = req.body;
    try{
        let admin = await Admin.findOne({adminEmail});
        if(!admin){
            return res.status(400).json({error: "Login with correct credentials"})
        }
        const passwordCompare = await bcrypt.compare(adminPassword, admin.adminPassword);
        if(!passwordCompare){
            success= false;
            return res.status(400).json({success, error: 'Login with correct credentials'})
        }
        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authtoken});
    } catch(error){
        console.error(error.message);
        res.status(500).send("Internal server error occured")
    }
})

//ROUTE3: Get Logged in user details using: POST "/api/auth/getuser". Login required.
router.post('/getadmin', fetchadmin, async (req, res) =>{
    try {
      adminId= req.admins.id;
      const admin = await User.findById(adminId).select("-password");
      res.send(admin)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured")
    }
    });

module.exports = router

