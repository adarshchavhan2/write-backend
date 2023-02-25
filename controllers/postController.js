const User = require('../models/User');
const Post = require('../models/Post');
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require('../utils/ErrorHandler');
const cloudinary = require('cloudinary').v2;
const ApiFeatures = require('../utils/ApiFeatures');

// Configuration 
cloudinary.config({
    cloud_name: "blogs-adarsh14",
    api_key: "749389945332788",
    api_secret: "EkJH8GK4FKQiIMgKL27ZCuEJqas"
});


exports.getAllPosts = catchAsyncError(async (req, res, next) => {


    let pageSize = req.query.pageSize || 10;
    let apiFeatures = new ApiFeatures(Post.find({}), req.query).search().filter();
    let posts = await apiFeatures.query;
    let totalPages = Math.ceil(posts.length / pageSize);

    apiFeatures = new ApiFeatures(Post.find({}), req.query).search().filter().pagination(pageSize)
    posts = await apiFeatures.query;
    
    res.send({
        success: true,
        pageSize,
        totalPages,
        posts
    });
});


exports.getMyPosts = catchAsyncError(async (req, res, next) => {

    let pageSize = req.query.pageSize || 10;
    let apiFeatures = new ApiFeatures(Post.find({}), req.query).search().filter();
    let posts = await apiFeatures.query;
    let totalPages = Math.ceil(posts.length / pageSize);

    apiFeatures = new ApiFeatures(Post.find({author: req.userid}), req.query).search().filter().pagination(pageSize)
    posts = await apiFeatures.query;
    
    res.send({
        success: true,
        pageSize,
        totalPages,
        posts
    });
    
});


exports.getUserPosts = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) {
        return next(new ErrorHandler('Author not found', 404));
    }

    let pageSize = req.query.pageSize || 10;
    let apiFeatures = new ApiFeatures(Post.find({author: user._id}), req.query).search().filter();
    let posts = await apiFeatures.query;
    let totalPages = Math.ceil(posts.length / pageSize);

    apiFeatures = new ApiFeatures(Post.find({author: user._id}), req.query).search().filter().pagination(pageSize)
    posts = await apiFeatures.query;
    
    res.send({
        success: true,
        pageSize,
        totalPages,
        posts
    });
});


exports.getSavedPosts = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.userid);
    let posts = await Post.find({ _id: user.saved }).populate('author');

    res.send({
        success: true,
        posts
    })
});


exports.getPost = catchAsyncError(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate('author comments.user');
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    res.send({
        success: true,
        post
    })
});


exports.createPost = catchAsyncError(async (req, res, next) => {
    const { title, brief, desc, cat, image, tags } = req.body;
    const img = image ? await cloudinary.uploader.upload(image, {
        folder: '/blogs/posts'
    }) : null;

    const post = await Post.create({
        title, brief, desc, cat, tags,
        img: img && {
            public_id: img.public_id,
            url: img.secure_url
        },
        author: req.userid
    });

    const user = await User.findById(req.userid);
    user.posts.push(post);
    await user.save();

    res.send({
        success: true,
        message: 'Post created successfully',
        post
    })
});


exports.updatePost = catchAsyncError(async (req, res, next) => {
    const { title, brief, desc, cat, image, tags } = req.body;

    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    if (String(post.author) !== String(req.userid)) {
        return next(new ErrorHandler('Unauthorized action denied', 401));
    }

    title ? post.title = title : null;
    brief ? post.brief = brief : null;
    desc ? post.desc = desc : null;
    cat ? post.cat = cat.value : null;
    tags ? post.tags = tags : null;

    if (image) {
        const oldImgId = post.img.public_id;
        const img = await cloudinary.uploader.upload(image, {
            folder: '/blogs/posts'
        });
        post.img = {
            public_id: img.public_id,
            url: img.secure_url
        }
        if (oldImgId) {
            await cloudinary.uploader.destroy(oldImgId);
        }
    } else {
        if (post.img.public_id) {
            await cloudinary.uploader.destroy(post.img.public_id);
        }
        post.img = null;
    }

    post = await post.save();

    res.send({
        success: true,
        message: 'Post updated successfully',
        post
    })
});


exports.likePost = catchAsyncError(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    if (post.likes.includes(req.userid)) {
        post.likes = post.likes.filter(item => String(item) !== String(req.userid))
        await post.save();

        res.send({
            success: true,
            message: 'Post unliked'
        });

    } else {
        post.likes.push(req.userid);
        await post.save();

        res.send({
            success: true,
            message: 'Post liked'
        });
    }
});


exports.commentPost = catchAsyncError(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    const { comment } = req.body;
    let commentIndex = -1;

    post.comments.forEach((item, i) => {
        if (String(item.user) === String(req.userid)) {
            commentIndex = i;
        }
    })

    if (commentIndex !== -1) {
        post.comments[commentIndex].comment = comment;
        post.comments[commentIndex].createdAt = new Date(Date.now());
        await post.save();

        res.send({
            success: true,
            message: 'Comment updated'
        });

    } else {
        post.comments.push({
            user: req.userid,
            comment,
            createdAt: new Date(Date.now())
        });
        await post.save();

        res.send({
            success: true,
            message: 'Comment added'
        });
    }

});


exports.deleteComment = catchAsyncError(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    post.comments = post.comments.filter(item => String(item.user) !== String(req.userid));
    await post.save();
    res.send({
        success: true,
        message: 'Comment deleted'
    });
});


exports.savePost = catchAsyncError(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    const user = await User.findById(req.userid);

    if (user.saved.includes(post._id)) {
        user.saved = user.saved.filter(item => String(item) !== String(post._id))
        await user.save();

        res.send({
            success: true,
            message: 'Post unsaved'
        });

    } else {
        user.saved.push(post._id);
        await user.save();

        res.send({
            success: true,
            message: 'Post saved'
        });
    }
});


exports.deletePost = catchAsyncError(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler('Post not exist', 404));
    }

    if (String(post.author) !== String(req.userid)) {
        return next(new ErrorHandler('Unauthorized action denied', 401));
    }
    if (post.img.public_id) {
        await cloudinary.uploader.destroy(post.img.public_id);
    }
    await post.remove();

    res.send({
        success: true,
        message: 'Post deleted successfully'
    });
})