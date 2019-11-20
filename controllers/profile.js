const Profile = require('../models/Profile');

module.exports = {
    renderProfile: (req, res) => {
        Profile.findById(req.user.profileId)
            .then(profile => {
                if (profile) {
                    return res.render('profile', {
                        user: req.user,
                        profile
                    })
                }
                res.render('profile', { user: req.user });
            })
            .catch(error => console.error(error.message));
    },
    updateProfile: (req, res) => {
        Profile.findByIdAndUpdate(req.user.profileId, { $set: req.body })
            .then(result => {
                req.flash('success', 'Update Profile successful');
                res.redirect('/profile');
            })
            .catch(error => console.error(error.message));
    }
}