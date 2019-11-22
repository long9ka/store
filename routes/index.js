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

router.route('/password_reset')
    .get(index.renderResetPassword)
    .post(validInput.validResetPassword, index.handleResetPassword)
    .put()
    .delete()

router.route('/password_reset/verify')
    .get()
    .post(index.handleSendOtpCode)
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

router.route('*')
    .get(index.pageNotFound)
    .post()
    .put()
    .delete()

module.exports = router;