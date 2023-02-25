const { getAllPosts, getMyPosts, getUserPosts,
    getPost, createPost, updatePost, likePost, commentPost, savePost, getSavedPosts, deleteComment, deletePost } = require('../controllers/postController');
const { auth } = require('../middlewares/auth');

const router = require('express').Router();

router.get('/@:handle/posts', getUserPosts);
router.get('/me/posts', auth, getMyPosts);
router.route('/posts').get(getAllPosts).post(auth, createPost);
router.route('/posts/:id').get(getPost).put(auth, updatePost).delete(auth, deletePost);
router.put('/posts/:id/like', auth, likePost);
router.route('/posts/:id/comment').put(auth, commentPost).delete(auth, deleteComment);
router.route('/posts/:id/save').put(auth, savePost)
router.get('/saved/posts', auth, getSavedPosts)

module.exports = router;