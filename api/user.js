const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const Users = require('../model/user');
const jwt = require('jsonwebtoken');
const { collection } = require('../model/user');
jwtkey = 'jwt';

// Create/register new user API 
router.post('/create_user', (req, res) => {
    let data = req.body;
    if (!data.createdAt) {
        data.createdAt = new Date();
    }
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
    updatedData.updateAt = new Date();
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
                success: `User record update Successfully for id : ${id}`,
                updatedData: updatedData
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
            console.log(`get all users successfully`)
            res.status(200).json({
                success: `get all users successsfully..`,
                result: result
            });
        }
    })
})

/* get all users sorted by createdAt timestamp in descending order with pagination API
    - if do not want to get users with jwt authentication then remove middleware function tokenVerify
    like router.get('/sort/', (req, res) => {
        content
    })
    - user want to sort data on ascending order then change in sort query like sort({ createdAt : 1 })
*/
router.get('/sort/', tokenVerify, (req, res) => {
    let limit = +req.query.limit;
    let skip = +req.query.skip;
    if (limit) {
        Users.find((error, result) => {
            if (error) {
                console.log(`error : ${error}`);
                res.status(400).json({ error: error })
            } else {
                console.log(`get users in descending order with limit : ${limit}`)
                res.status(200).json({
                    success: `get users in descending order with limit : ${limit}`,
                    result: result
                });
            }
        }).sort({ createdAt: -1 }).limit(limit).skip(skip)
    } else {
        Users.find((error, result) => {
            if (error) {
                console.log(`error : ${error}`);
                res.status(400).json({ error: error })
            } else {
                console.log(`get all users in descending order`)
                res.status(200).json({
                    success: `get all users in descending order`,
                    result: result
                });
            }
        }).sort({ createdAt: -1 })
    }
})

// get all users sorted by disnatce from 
router.get('/geo', (req, res) => {

    const maxDistance = req.query.distance !== 'undefined' ? req.query.distance : 1009;
    const lng = req.query.lng !== 'undefined' ? req.query.lng : 80;
    const lat = req.query.lat !== 'undefined' ? req.query.lat : 25;

    Users.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: [+lng, +lat] },
                $maxDistance: maxDistance
            }
        }
    }, (err, result) => {
        if (err) {
            console.log(`error : ${err}`);
            res.status(500).json({ error: err });
        } else {
            res.status(200).json({ result: result });
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
    const mobileRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const pinCodeRegex = /^\d{6}$/;

    // name validation
    if (typeof data.name != 'string') {
        error = `Name is not String for ${JSON.stringify(data)}`;
    } else {
        // phone_number Validation
        if (!mobileRegex.test(data.mobile)) {
            error = `mobile number is incorrect for ${JSON.stringify(data)}`;
        } else {
            // email validation
            if (!emailRegex.test(data.email)) {
                error = `email is incorrect for ${JSON.stringify(data)}`;
            } else {
                if (!pinCodeRegex.test(data.address.pincode)) {
                    error = `pincode is incorrect for ${JSON.stringify(data)}`;
                }
            }
        }
    }
    if (error) {
        return { error: error };

    } else {

        return { data: data };
    }
    return error;
}


module.exports = router
