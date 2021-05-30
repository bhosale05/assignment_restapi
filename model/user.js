const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    address: {
        street: String,
        locality: String,
        city: String,
        state: String,
        pincode: String,
        coordinatesType: String,
        coordinates: [Number]
    },
    createdAt    : { type: Date, required: true, default: Date.now },
    updateAt : Date
})

module.exports = mongoose.model('users', userSchema)