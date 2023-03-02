const bcrypt = require('bcrypt')
require('dotenv').config()

// const sessionSecret = process.env. SessionSecret

const sessionSecret =  "mysitesessionsecret"

const emailUser = "bcb61smpttest@gmail.com"
const emailPassword = "askrtcywkrfquxls"

const DB = ()=>{
    const mongoose = require("mongoose")
mongoose.set('strictQuery', true);
mongoose.connect(process.env. databaseUrl+process.env.database)
}



module.exports={
    sessionSecret,
    emailUser,
    emailPassword,
    DB
    
}