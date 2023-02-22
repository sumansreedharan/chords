const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({

     name:{
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     mobile:{
        type:String,
        required:true
     },
   password:{
      type:String,
      required:true
      
   },
   Address:[{
      name:{type:String,required:true},
      number:{type:String,required:true},
      house:{type:String,required:true},
      city:{type:String,required:true},
      country:{type:String,required:true},
      state:{type:String,required:true},
      pincode:{type:String,required:true}
   }],
   cart:[{
      productId:{type:ObjectId},
      _id:false
   }],

     is_verified:{
        type:Number,
        default:0
     },
     token:{
      type:String,
     },

     blocked:{
     type:Boolean,
     default:false,
     }
})

module.exports = mongoose.model('User',userSchema)
    
