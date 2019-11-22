const router = require('express').Router();

// middleware
const checkAuth = require('../middleware/auth');
const validInput = require('../middleware/valid');
// controller
const user = require('../controllers/user');

router.route('/profile')
    .get(checkAuth, user.renderProfile)
    .post(checkAuth, validInput.validUpdateProfile, user.updateProfile)
    .put()
    .delete()

router.route('/verify')
    .get(checkAuth, user.renderVerify)
    .post(checkAuth, user.handleConfirmOtpCode)
    .put()
    .delete()

router.route('/password')
    .get(checkAuth, user.renderPasswordChange)
    .post(checkAuth, validInput.validChangePassword, user.handleChangePassword)
    .put()
    .delete()

router.route('/verify/otp')
    .get()
    .post(checkAuth, user.handleSendOptCode)
    .put()
    .delete()

module.exports = router;