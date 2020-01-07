const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// config
const config = require('../config/config');
const transporter = require('../config/transporter');
const token = require('../config/token-generator');

// models
const User = require('../models/User');
const Token = require('../models/Token');

// middleware
const auth = require('../middleware/auth');
const valid = require('../middleware/valid');
const verify = require('../middleware/verify');

const router = express.Router();

router.route('/')
    .get(auth, verify, (req, res) => res.render('page', { user: req.user,check:true }))
    .post()

router.route('/terms')
    .get((req, res) => res.render('terms', { title: 'Terms of service', user: req.user }))
    .post()

router.route('*')
    .get((req, res) => {
        res.status(404).render('error', {
            title: 'Error',
            user: req.user,
            views: {
                statusCode: 404,
                message: `Sorry, This page isn't available`
            }
        });
    })
    .post()

module.exports = router;