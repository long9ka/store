const router = require('express').Router();
const Report = require('../models/Product');

router.route('/')
    .get((req, res) => {
            console.log('test');
        }) 
    .post()
    .put()
    .delete()

module.exports = router;