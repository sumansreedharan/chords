const express = require("express");
const userRoute = express();
const session =require('express-session')
const path = require("path");
const confirm = require('../middleware/auth')
const config = require('../config/config')
const cartcontroller = require('../controller/cartcontroller')
const payController= require('../controller/payController')
const Razorpay=require('razorpay')
var instance = new Razorpay({ key_id: "rzp_test_pChQvCOnHtlSse", key_secret: "FpXGRTbRaNxnzz9kh7xgiO3T" })



userRoute.set('view engine','hbs');
userRoute.set('views','./views/user');


userRoute.use(session({
    saveUninitialized:false,
    secret: (config.sessionSecret),
    resave: false,
   
}));

userRoute.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, no-store');
next();
});

userRoute.use(express.json());
userRoute.use(express.urlencoded({extended: true}));



const userController = require('../controller/user_controller');


userRoute.get('/', userController.loadhome);

userRoute.get('/login',confirm.isLogout, userController.loginPage);

userRoute.post('/login',userController.verifyLogin);

userRoute.get('/signup',confirm.isLogout,userController.signupPage);

userRoute.post('/signup',userController.insertUser);

userRoute.get('/userotpverify',confirm.isLogout,userController.otpverification);

userRoute.post('/userotpverify',userController.verifyMail);

userRoute.get('/forget',confirm.isLogout,userController.forgetPassword);

userRoute.post('/forget',userController.forgetVerify);

userRoute.get('/remember',confirm.isLogout,userController.forgetPasswordLoad);

userRoute.post('/remember',userController.resetPassword);

userRoute.get('/home',confirm.isLogin,userController.loadhome);

userRoute.get('/productview',confirm.isLogin,userController.productview);

userRoute.get('/logout',userController.userLogout)

userRoute.get('/userProfile',confirm.isLogin,userController.userProfile)

userRoute.get('/userEdit',confirm.isLogin,userController.edituserprofile)

userRoute.post('/userEdit',userController.updateProfile)

userRoute.get('/editaddress',confirm.isLogin,userController.loaduseraddress)

userRoute.post('/editaddress',userController.pushAddress)

userRoute.get('/popaddress',confirm.isLogin,userController.popaddress)

userRoute.get('/addtocart',confirm.isLogin,cartcontroller.addtocart)

userRoute.get('/usercart',confirm.isLogin,cartcontroller.loadusercart)

userRoute.delete('/deleteproduct/:id',confirm.isLogin,cartcontroller.removeCartProduct)

userRoute.post('/user-checkout',cartcontroller.userCheckout)

userRoute.get('/checkout-address',confirm.isLogin,cartcontroller.addCheckoutAddress)

userRoute.post('/checkout-address',cartcontroller.postCheckoutAddress)

userRoute.post('/placeOrder',cartcontroller.placeOrder)

userRoute.get('/myOrder',confirm.isLogin,payController.myOrderLoad)

userRoute.get('/cancelOrder',confirm.isLogin,payController.cancelMyOrder)

userRoute.get('/categoryList',confirm.isLogin,userController.categoryList)

userRoute.get('/viewProducts',confirm.isLogin,userController.viewProducts)

userRoute.post('/validateCoupon',cartcontroller.validateCoupon)

userRoute.get('/invoice',payController.userInvoice)






userRoute.post('/create/orderId',(req,res)=>{
    console.log("Create OrderId Request",req.body)
    var options = {
      amount: req.body.amount,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "rcp1"
    };
    instance.orders.create(options, function(err, order) {
      console.log(order);
      res.send({orderId:order.id});//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
    });
});

userRoute.post("/api/payment/verify",(req,res)=>{

    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
   
     var crypto = require("crypto");
     var expectedSignature = crypto.createHmac('sha256', 'FpXGRTbRaNxnzz9kh7xgiO3T')
       .update(body.toString())
       .digest('hex');
       console.log("sig received " ,req.body.response.razorpay_signature);
      console.log("sig generated " ,expectedSignature);
     var response = {"signatureIsValid":"false"}
     if(expectedSignature === req.body.response.razorpay_signature)
      response={"signatureIsValid":"true"}
         res.send(response);
     });





module.exports = userRoute;