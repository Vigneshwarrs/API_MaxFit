const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO)
        .then(()=>console.log("Connected to DB"))
        .catch((err)=>console.log("Error while connecting DB", err));