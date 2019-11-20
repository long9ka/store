const router = require('express').Router();

// middlewares
const checkAuth = require('../middleware/auth');
const validInput = require('../middleware/valid');
const verify = require('../middleware/verify');
// controllers
const index = require('../controllers/index');


router.route('/')
    .get(checkAuth, verify, index.renderPage)
    .post()
    .put()
    .delete()

router.route('/login')
    .get(index.renderLogin)
    .post(index.handleLogin)
    .put()
    .delete()

router.route('/logout')
    .get(index.handleLogout)
    .post()
    .put()
    .delete()

router.route('/register')
    .get(index.renderRegister)
    .post(validInput.validRegister, index.handleRegister)
    .put()
    .delete()

router.route('/verify')
    .get(checkAuth, index.renderVerify)
    .post(checkAuth, index.handleConfirmOtpCode)
    .put()
    .delete()

router.route('/verify/otp')
    .get()
    .post(checkAuth, index.handleSendOptCode)
    .put()
    .delete()

router.route('*')
    .get(index.pageNotFound)
    .post()
    .put()
    .delete()

module.exports = router;