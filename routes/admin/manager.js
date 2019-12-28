const router = require('express').Router();
const checkAuth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
router.route('/')
    .get(checkAuth, (req, res) => {
        Profile.findById(req.user.profileId)
            .then(profile => {
                User.findOne({
                        'roles': 'guest'
                    })
                    .then(user => {
                        console.log(user);
                    })
                res.render('adManage/manager', {
                    title: 'Manager',
                    user: req.user,
                    profile
                });
            })

    })
    .post()
    .put()
    .delete()

module.exports = router;