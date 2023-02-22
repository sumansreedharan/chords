const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    quantity:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('Product',productSchema)