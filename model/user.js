const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    mobile: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    address: {
        street: String,
        locality: String,
        city: String,
        state: String,
        pincode: String,
        location: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }

        }
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updateAt: {
        type: Date
    }
})


module.exports = mongoose.model('users', userSchema)