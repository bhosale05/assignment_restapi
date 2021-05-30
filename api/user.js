const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const Users = require('../model/user');
const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const jwt = require('jsonwebtoken');
const e = require('express');
jwtkey = 'jwt';

// Create/register new user API 
router.post('/create_user', (req, res) => {
    let data = req.body;

    if (data.name) {
        data = validate(data);
        if (data.error) {
            res.status(500).json({ error: data.error });
            return;
        } else {
            data = data.data;
        }


        Users.collection.insertOne(data, (error, result) => {
            if (error) {
                console.log(`error : ${error}`);
                res.status(400).json(`error : ${error}`);
            } else {
                // create json web token with expaire time 5 sec
                jwt.sign({ result }, jwtkey, { expiresIn: '500s' }, (err, token) => {
                    if (err) {
                        res.status(400).json({ err });
                    } else {
                        console.log(`User records Insert for ${JSON.stringify(data)}`);
                        res.status(200).json({
                            success: `User record Insert successfully`,
                            token: token,
                            result: data
                        })
                    }
                })
            }
        })
    } else {
        console.error(`Please check the payload. Payload is empty`);
        res.status(500).json({ error: `Please check the payload. Payload is empty` });
    }

})

//update user by id API
router.put('/:id', (req, res) => {
    let updatedData = req.body;
    let id = req.params.id;
    Users.updateOne({ _id: id }, updatedData, (err, result) => {
        if (err) {
            console.log(`error : ${err}`);
            res.status(400).json({
                msg: `error occures at the time of update user record by id : ${id}`,
                error: err
            })
        } else {
            console.log(`User record update successfully for id : ${id}`);
            res.status(200).json({
                success: `User record update Successfully for id : ${id}`
            })
        }
    })
})

// delete user by id API
router.delete('/:id', (req, res) => {
    let id = req.params.id;
    Users.findByIdAndRemove({ _id: id }, (err, result) => {
        if (err) {
            console.log(`error : ${err}`);
            res.status(400).json({
                msg: `error occures at the time of delete user record by id : ${id}`,
                error: err
            })
        } else {
            console.log(`User record deleted successfully for id : ${id}`);
            res.status(200).json({
                success: `User record delete Successfully for id : ${id}`
            })
        }
    })
})

// get all users API 
router.get('/', tokenVerify, (req, res) => {
    Users.find((error, result) => {
        if (error) {
            console.log(`error : ${error}`);
            res.status(400).json({ error: error })
        } else {
            console.log(`records fetch successfully`)
            res.status(200).json({
                success: `records fetch successsfully..`,
                result: result
            });
        }
    })
})

// verify json web token for fetch records from db
function tokenVerify(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        // verify token passed by headers 
        jwt.verify(req.token, jwtkey, (err, authData) => {
            if (err) {
                res.status(500).json({ error: err })
            } else {
                next();
            }
        })
    } else {
        res.status(400).json(`Invalid token...`);
    }
}

// validate data send by payload
function validate(data) {
    let error = null;
    // name validation
    if (typeof data.name != 'string') {
        error = `Name is not String for ${JSON.stringify(data)}`;
    }

    // email validation
    if (typeof data.email != 'string') {
        error = `email is not string for ${JSON.stringify(data)}`;
    }
    // phone_number Validation
    if (!regex.test(data.mobile)) {
        error = `mobile number is incorrect for ${JSON.stringify(data)}`;
    }

    if (error) {
        return { error: error };

    } else {

        return { data: data };
    }
    return error;
}


module.exports = router
