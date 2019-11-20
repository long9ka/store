const router = require('express').Router();

// middleware
const checkAuth = require('../middleware/auth');
const validInput = require('../middleware/valid');
const verify = require('../middleware/verify');
// controller
const profile = require('../controllers/profile');

router.route('/')
    .get(checkAuth, verify, profile.renderProfile)
    .post(checkAuth, verify, validInput.validUpdateProfile, profile.updateProfile)
    .put()
    .delete()

module.exports = router;