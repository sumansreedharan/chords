const { ObjectId } = require('mongodb');
const mongoose =  require('mongoose')
const Schema = mongoose.Schema;


const paySchema = new Schema({
    userId:{
        type:ObjectId,
        required:true,

    },

    product:[
        {
            id:{type:ObjectId},
            name:{type:String},
            price:{type:Number},
            quantity:{type:Number}
        }
    ],
    orderId:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    status:{
        type:String,
        required:true,
        default:"pending"
    },
    payment_method:{
        type:String,
        required:true,
    },
    addressId:{
        type:String,
        required:true,
    },
    subtotal:{
        type:Number,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    // image:[
    //     { type:String, 
    //      required : true}
    // ]



})

module.exports = mongoose.model('payment',paySchema)