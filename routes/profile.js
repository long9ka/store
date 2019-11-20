const router = require('express').Router();

// middleware
const checkAuth = require('../middleware/auth');
// controller
const profile = require('../controllers/profile');
// valid input
const validInput = require('../middleware/valid');

router.route('/')
    .get(checkAuth, profile.renderProfile)
    .post(checkAuth, validInput.validUpdateProfile, profile.updateProfile)
    .put()
    .delete()

module.exports = router;