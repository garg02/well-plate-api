// requirements
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv/config');

// create an instance of express
const app = express();
app.use(cors());

// use bodyParser to convert data that comes in witH POST requests into JSON objects. 
app.use(express.json());

// all routes that start with plates/.. will be ran by platesRoute
const platesRoute = require('./routes/plates');
app.use('/plates', platesRoute);

// default home page
app.get('/', (req, res) => {
    res.send('Welcome to the home page');
})


// connect to DB 
mongoose.connect(
    process.env.DB_CONNECTION, 
    {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false} , 
    () => {console.log('succesfully connected to DB')
});

app.listen(3000);