const router = require('express').Router();

// middleware
const checkAuth = require('../middleware/auth');
// controller
const index = require('../controllers/index');
// valid input
const validInput = require('../middleware/valid');

router.route('/')
    .get(checkAuth, index.renderPage)
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

router.route('*')
    .get(index.pageNotFound)
    .post()
    .put()
    .delete()

module.exports = router;