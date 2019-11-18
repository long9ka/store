// use .env
require('dotenv').config();

const config = require('./config');

const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.set(express.static('public'));

// use ejs engine
app.set('view engine', 'ejs');

// connect database
connectDB = async () => {
    try {
        await mongoose.connect(config.DB, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected database');
    } catch (error) {
        console.error(error.message);
    }
}

connectDB();


app.get('/', (req, res) => {
    res.send('hello world');
})

app.listen(config.PORT, console.log(`Server started on port ${config.PORT}`));