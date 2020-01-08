const express = require('express');
const router = express();
const moment = require('moment');
const bcrypts = require('bcryptjs')
const auth = require('../middleware/auth');
const faker = require('faker')
const verify = require('../middleware/verify')
//model
const User = require('../models/User');
const Amount = require('../models/Amount');
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
            return res.render('adManage/tableview', {
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
//doanh so
router.post('/cloneturnover', (req, res, next) => {
    address = ['1A Tạ Quang Bửu Quận 8', '291 Nguyễn Thị Minh Khai Quận 1', '360 Nguyễn Trãi Quận 5'];
    var opset = Math.floor(Math.random() * 3);
    newAmount = {
        address: address[opset],
        date: faker.date.between("1-1-2019","1-1-2020"),
        turnover: Math.floor(Math.random() *1000)
    }
    Amount.insertMany(newAmount).then(e => {
        return res.send(e);
    })
})
//get turnover
router.get('/getturnover', (req, res) => {
    Amount.find().sort({
        date: -1
    }).then(e => {
        res.send({
            amount: e
        });
    })
})
router.post('/getbymonth', (req, res) => {
    Amount.aggregate([{
            $addFields: {
                "month": {
                    $month: '$date'
                }
            }
        },
        {
            $match: {
                month: parseInt(req.body.id)
            }
        }
    ]).sort({
        date: -1
    }).then(e => {
        res.send({
            id: req.body.id,
            amount: e,
        })
    })
})


router.route('/turnover')
    .get((req, res) => {
        res.render('adManage/chart')
    })
router.route('/turnoverbymonth')
    .get((req, res) => {
        res.render('adManage/chartbymonth')
    })
router.route('/delete').post((req, res) => {
    name = req.body.name;
    User.findOneAndDelete({
        "username": name
    }).then(r => {
        if (r)
            res.send({
                check: true
            })
    })

})
module.exports = router