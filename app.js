const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./api/user');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

mongoose.connect('mongodb+srv://AB:archanab@ab.eoxpi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log('Connect to DB...');
    })
    .catch((error) => {
        console.log(`Error : ${error}`);
    })

app.use(jsonParser);
app.use('/users', userRouter);


module.exports = app;