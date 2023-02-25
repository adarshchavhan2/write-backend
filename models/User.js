const { Schema, model } = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    handle: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: isEmail
    },
    password: {
        type: String,
        required: true
    },
    img: {
        public_id: String,
        url: String
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    saved: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        updatedAt: Date
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
});

// hash password before save
userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

// generate jwt token
userSchema.methods.getJWTToken = async function () {
    const token = await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: 90 * 24 * 60 * 60 * 1000
    });
    return token;
}

// compare password
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compareSync(password, this.password);
}


// genrate reset password token
userSchema.methods.getResetPasswordToken = function () {
    // generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and storing to db
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // set tokem expiry
    this.resetPasswordExpire = Date.now + 15 * 60 * 1000;

    return resetToken;
}

module.exports = model('User', userSchema);