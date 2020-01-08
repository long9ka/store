const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const faker = require('faker')
// config
const config = require('../config/config');
const transporter = require('../config/transporter');
const token = require('../config/token-generator');

// models
const User = require('../models/User');
const Token = require('../models/Token');
const Product = require('../models/Product');

// middleware
const auth = require('../middleware/auth');
const valid = require('../middleware/valid');
const verify = require('../middleware/verify');



const router = express.Router();

router.route('/add')
    .get(auth, verify, (req, res) => {
        res.render('product/addProduct');
    })
    .post(auth, verify, async (req, res) => {
        const {
            code,
            name,
            price,
            inventory,
            description
        } = req.body;
        const isExist = await Product.findOne({ code });
        if (isExist) {
            req.flash('Product already exist');
            res.redirect('../../product/update/');
        }
        else{
            const newProduct = await new Product({
                code,
                name,
                price,
                inventory,
                description
            }).save(function(err){
                if (err) {
                    console.log(err);
                }
                else {
                    req.flash('Add successfully!');
                    res.redirect('back');
                }
            });
        }
    })
router.route('/clone')
    .post((req,res)=>{
        newProduct={
            code :faker.random.number(),
            name: faker.commerce.product(),
            price: faker.commerce.price()*1000,
            description: faker.lorem.text()
        }
        Product.insertMany(newProduct).then(e=>res.send(e))
    })
router.route('/view')
    .get((req,res)=>{
        Product.find().then(r=>{
            res.render('product/productView',{products: r})})
    })
router.route('/update')
    .get(auth, verify, (req, res) => {
        res.render('product/updateProduct');
    })
    .post(auth, verify, async (req, res) => {
        const temp = {
            code, 
            price,
            inventory 
        } = req.body;
        const query = await Product.findOne({ code });
        temp.amount += query.inventory;
        await Product.updateOne(query, temp, function(err) {
            if (err) {
                console.log(err);
            }
            else {
                req.flash('Update successfully!');
                res.redirect('back');
            }
        })
    })

module.exports = router;