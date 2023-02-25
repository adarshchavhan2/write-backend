const { Schema, model } = require('mongoose');

const postSchema = new Schema({
    title: {
        required: true,
        type: String
    },
    brief: {
        required: true,
        type: String
    },
    desc: {
        required: true,
        type: String
    },
    cat: {
        required: true,
        type: String
    },
    img: {
        public_id: String,
        url: String
    },
    tags:[],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: Date
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Post', postSchema)