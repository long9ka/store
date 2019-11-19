const router = require('express').Router();

// middleware
const checkAuth = require('../middleware/auth');

// controller
const profile = require('../controllers/profile');

router.route('/')
    .get(checkAuth, profile.renderProfile)
    .post(checkAuth, profile.updateProfile)
    .put()
    .delete()

module.exports = router;