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

// Generate a JWT token for the user
userSchema.methods.generateToken = function () {
    const user = this;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token)
    return token;
};

// Find a user by email and password
userSchema.statics.findByCredentials = async function (email, password) {
    console.log('Login attempt with email:', email);

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

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;