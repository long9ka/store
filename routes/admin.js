const express = require('express');
const router = express();
const moment = require('moment');
const bcrypts = require('bcryptjs')
const auth = require('../middleware/auth');
const faker = require('faker')
const verify = require('../middleware/verify')
//model
const User = require('../models/User');
router.route('/manager')
    .get(auth, verify, (req, res) => {
        User.find({
            role: 'manager'
        }).then(result => {
            return res.render('adManage/tableview', {
                users: result,
                moment: (time) => moment(time).format("DD-MM-YYYY")
            });
        })
    })
router.route('/staff')
    .get(auth, (req, res) => {
        User.find({
            role: 'staff'
        }).then(resp => {
            return res.render('adManage/tableview', {
                users: resp,
                moment: (time) => moment(time).format("DD-MM-YYYY")
            })
        })
    })
router.route('/guest')
    .get(auth, (req, res) => {
        User.find({
            role: 'guest'
        }).then(resp => {
            return res.render('adManage/manager', {
                users: resp,
                moment: (time) => moment(time).format("DD-MM-YYYY")
            })
        })
    })
router.route('/cloneuser')
    .post((req, res) => {
        role = ["manager", "staff", "guest"]
        gender = ['male', 'female', 'male']
        //var hash = bcrypt.hashSync("B4c0/\/", salt);
        var random_boolean = Math.random() <= 10;
        var random = Math.floor(Math.random() * 3)
        newUser = {
            isVerified: random_boolean,
            role: role[random],
            username: faker.internet.userName(),
            password: faker.internet.password(),
            profile: {
                name: faker.name.findName(),
                email: faker.internet.email(),
                birthday: faker.date.past(),
                gender: gender[random]
            }
        }
        console.log(newUser);
        User.insertMany(newUser).then(e => {
            return res.send(e);
        });
    })
router.route('/delete').post((req, res) => {
    name = req.body.name;
    User.findOneAndDelete({
        "username": name
    }).then(r=>{
        if(r)
        res.send({check:true})
    })
    
})
module.exports = router