const bcrypt = require('bcrypt')
require('dotenv').config()

// const sessionSecret = process.env. SessionSecret

const sessionSecret =  "mysitesessionsecret"

const emailUser = "bcb61smpttest@gmail.com"
const emailPassword = "askrtcywkrfquxls"

const DB = ()=>{
    const mongoose = require("mongoose")
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://sumankannath:Suman123)@cluster0.hrget3n.mongodb.net/?retryWrites=true&w=majority")
}



module.exports={
    sessionSecret,
    emailUser,
    emailPassword,
    DB
    
}