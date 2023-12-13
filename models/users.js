const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8, // Minimum password length
    },
});

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Find a user by email and password
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email: email.trim() });

    if (!user) {
        console.error('User not found for email:', email);
        throw new Error('Email Invalid');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        console.error('Incorrect password for email:', email);
        throw new Error('Password Invalid');
    }

    return user;
};

// Generate a JWT token for the user
userSchema.methods.generateToken = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { algorithm: 'HS256' }, { expiresIn: '1h' });
    console.log('Encoded Token:', token);
    return token;
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;