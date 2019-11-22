const transporter = require('../config/transporter');
const config = require('../config/config');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');

const { validationResult } = require('express-validator');

module.exports = {
    renderProfile: (req, res) => {
        Profile.findById(req.user.profileId)
            .then(profile => {
                if (profile) {
                    return res.render('profile', {
                        title: 'Profile',
                        user: req.user,
                        profile
                    })
                }
                res.render('profile', { user: req.user });
            })
            .catch(error => console.error(error.message));
    },
    renderVerify: (req, res) => {
        res.render('verify', { title: 'Email verifier', user: req.user });
    },
    updateProfile: (req, res) => {
        // input valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg );
            return res.redirect('/user/profile');
        }
        Profile.findByIdAndUpdate(req.user.profileId, { $set: req.body })
            .then(result => {
                req.flash('success', 'Update Profile successful');
                res.redirect('/user/profile');
            })
            .catch(error => console.error(error.message));
    },
    handleConfirmOtpCode: (req, res) => {
        Otp.findOneAndRemove({ userId: req.user.id, token: req.body.otp })
            .then(otp => {
                if (otp) {
                    User.findByIdAndUpdate(req.user.id, { isVerified: true })
                        .then(result => {
                            res.redirect('/');
                        })
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Otp incorrect');
                    res.redirect('/user/verify')
                }
            })
            .catch(error => console.error(error.message));
    },
    handleSendOptCode: (req, res) => {
        // function random otp code [low, high]
        const randomCode = (low, high) => {
            return Math.floor(Math.random() * (high - low + 1) + low);
        }

        Profile.findById(req.user.profileId)
            .then(profile => {
                if (profile) {
                    // new otp code
                    const otp = new Otp({
                        userId: req.user.id,
                        token: randomCode(1e5, 1e6 - 1) // otpCode: length = 6
                    })
                    otp.save()
                        .then()
                        .catch(error => console.error(error.message));

                    // send email
                    const mailOptions = {
                        from: config.EMAIL_USER,
                        to: profile.email,
                        subject: 'Welcome to Store Manager',
                        text: otp.token.toString()
                    }

                    transporter.sendMail(mailOptions)
                        .then(req.flash('success', 'Send email successful'))
                        .catch(error => console.error(error.message));
                } else {
                    req.flash('error', 'Email not found');
                }
                res.redirect('/user/verify');
            })
            .catch(error => console.error(error.message))
    }
}