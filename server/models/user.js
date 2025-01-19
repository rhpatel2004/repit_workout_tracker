const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        // match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    },
    profilePictureUrl: {

        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['user', 'trainer'],
        default: 'user'
    },
    trainerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    preferences: {
        notifications: {
            email: {
                enabled: { type: Boolean, default: false },
                frequency: {
                    type: String,
                    enum: ['daily', 'weekly', 'monthly', 'off'],
                    default: 'off'
                }
            },
            whatsapp: {
                enabled: { type: Boolean, default: false },
                frequency: {
                    type: String,
                    enum: ['daily', 'weekly', 'monthly', 'off'],
                    default: 'off'
                }
            }
        }
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);
module.exports = User;
