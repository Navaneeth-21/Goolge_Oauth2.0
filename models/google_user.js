const mongoose = require('mongoose');

const createSchema = new mongoose.Schema({
    googleID : {
        type : String,
        required :  true
    },
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    }

});

module.exports = mongoose.model('googleuser' , createSchema);