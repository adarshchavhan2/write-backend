const { signup, login, logout, getMyProfile, getUserProfile, forgetPassword, updateProfile, updatePassword, resetPassword } = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

const router = require('express').Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', auth, logout);
router.route('/me').get(auth, getMyProfile).put(auth, updateProfile);
router.put('/password', auth, updatePassword);
router.put("/password/forget", forgetPassword);
router.put("/password/reset/:token", resetPassword);
router.get('/@:handle', getUserProfile);

module.exports = router;