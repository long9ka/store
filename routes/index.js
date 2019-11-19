const router = require('express').Router();

// controller
const index = require('../controllers/index');

const passport = require('passport');

router.route('/')
    .get((req, res) => res.redirect('/login'))
    .post()
    .put()
    .delete()

router.route('/login')
    .get(index.renderLogin)
    .post()
    .put()
    .delete()

router.route('/register')
    .get(index.renderRegister)
    .post(index.handleRegister)
    .put()
    .delete()

router.route('*')
    .get(index.pageNotFound)
    .post()
    .put()
    .delete()

module.exports = router;