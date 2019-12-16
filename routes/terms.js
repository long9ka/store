const router = require('express').Router();

router.route('/')
    .get((req, res) => {
        res.render('terms', { 
            title: 'Terms of service',
            user: req.user,
            views: {}
        });
    })
    .post()
    .put()
    .delete()

module.exports = router;