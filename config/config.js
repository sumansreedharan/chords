const bcrypt = require('bcrypt')
require('dotenv').config()

const sessionSecret = process.env. SessionSecret

const emailUser = process.env.EmailUser
const emailPassword = process.env. EmailPassword 

const DB = ()=>{
    const mongoose = require("mongoose")
mongoose.set('strictQuery', true);
mongoose.connect(process.env. databaseUrl+process.env. database)
}



module.exports={
    sessionSecret,
    emailUser,
    emailPassword,
    DB
    
}