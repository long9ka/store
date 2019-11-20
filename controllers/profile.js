const Profile = require('../models/Profile');

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
    updateProfile: (req, res) => {
        // input valid
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg );
            return res.redirect('/profile');
        }
        Profile.findByIdAndUpdate(req.user.profileId, { $set: req.body })
            .then(result => {
                req.flash('success', 'Update Profile successful');
                res.redirect('/profile');
            })
            .catch(error => console.error(error.message));
    }
}