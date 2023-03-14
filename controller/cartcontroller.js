const User = require('../models/userModel');
const { ObjectId } = require('mongodb');
// const swal = require('sweetalert2');
const Product = require('../models/productModel')
const order = require('../models/payModel')
const Coupon = require('../models/couponModel')
const moment = require('moment')

const loadusercart = async (req, res) => {
   
    try {
        

        const cartData = await User.aggregate([ 
            { $match: { _id: ObjectId(req.session.user_id) } },
            {
                $lookup: {
                    from: "products",
                    let: { cartItems: "$cart" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$cartItems.productId"],
                                }
                            }
                        }
                    ],
                    as: 'productcartData'
                }
            }
        ]);
        
     
        const cartProducts = cartData[0].productcartData
        let subtotal = 0;
        cartProducts.forEach((cartProduct) => {
            subtotal = subtotal + Number(cartProduct.price);
         });
         
     const length =  cartProducts.length
        res.render('usercart',{cartProducts, subtotal , length,secnav: 1,usefooter:1});
    } catch (error) {
        console.log(error);
    }
}

const addtocart = async (req, res) => {
    try {
        const cartData = await User.updateOne({ _id: req.session.user_id }, {
            $addToSet: {
                cart: { productId: req.query.id }
            }
        });
        
        res.redirect('/home');
    } catch (error) {
        console.log(error);
    }
}


const removeCartProduct = async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate({_id: req.session.user_id }, {
            $pull: {
                cart: { productId: req.params.id }
            }
        });
        res.json("success")
    } catch (error) {
        console.log(error);
    }
}


let finalAmount

const userCheckout = async(req,res)=>{

    try {
        const address = await User.find({ _id: req.session.user_id }).lean();

        const cartData = await User.aggregate([
            { $match: { _id: ObjectId(req.session.user_id) } },
            {
                $lookup: {
                    from: "products",
                    let: { cartItems: "$cart" },
                    pipeline: [ 
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$cartItems.productId"],
                                },
                            },
                        },
                    ],
                    as: "Cartproducts",
                },
            },
        ]);
        let subtotal = 0;

        finalAmount = 0;
        const cartProducts = cartData[0].Cartproducts;
        cartProducts.map((cartProduct, i) => {
            cartProduct.quantity = req.body.quantity[i];
            subtotal = subtotal + cartProduct.price * req.body.quantity[i];
            finalAmount = subtotal
        });

       
        res.render("user-checkout", {
            productDetails: cartData[0].Cartproducts,
            subtotal: subtotal,
            finalAmount:subtotal,
            offer:0,
            address: address[0].Address,usernav:1,usefooter:1
        });
    } catch (error) {
        console.log(error.message);
}

}

const validateCoupon = async (req, res) => {
    try {
        const codeId = req.body.code

        const couponData = await Coupon.findOne({ name: codeId }).lean();

        const userData = await Coupon.findOne({ name: codeId, userId: req.session.user_id }).lean()

        if (couponData && couponData.status == "Active") {
            offerPrice = couponData.offer

            if (userData) {
                res.json("fail")
            } else {

                const CouponData = await Coupon.updateOne({ name: codeId }, { $push: { userId: req.session.user_id } })
                res.json(offerPrice)
            }
        }else{
            res.json("NOT")
        }

    } catch (error) {
        console.log(error.message);
    }
}


const addCheckoutAddress = async(req,res)=>{
    try {
        res.render('checkout-address')
    } catch (error) {
       console.log(error); 
    }
}

const postCheckoutAddress = async(req,res)=>{
    try {
        const address = await User.findByIdAndUpdate({_id: req.session.user_id},{$addToSet:{Address:req.body}})
        res.redirect('/usercart')
    } catch (error) {
       console.log(error)
 
    }
}

let sumTotal=0;
let fCoupon;
let fCouponAmount;


const placeOrder = async (req, res) => {
    try {
        console.log("hi");
      const { productid,productname,payment,subtotal, price, quantity,addressId,image} = req.body;
      console.log(req.body,"182");
        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;
        sumTotal = subtotal;
        const picture = req.body.image
        // const today = moment();
        const dateData = new Date();
        const chordsecom =productid.map((item, i) => ({
            id: productid[i],
            name:productname[i],
            price: price[i],
            quantity: quantity[i]
    
        }));

        if(req.body.coupon){
            fCoupon = req.body.coupon

            const couponApplied = await Coupon.findOne({name: req.body.coupon})
            fCouponAmount = couponApplied.offer
            if(fCouponAmount && subtotal){
                const amount = (subtotal*fCouponAmount)/100
                sumTotal = subtotal - amount
            }else{
                sumTotal = subtotal
            }
        }
        
        let data = {
          userId: ObjectId(req.session.user_id),
          orderId: orderId,
          date:dateData,
          addressId: addressId,
          product:chordsecom,
          status: "pending",
          payment_method: String(payment),
          subtotal: Number(sumTotal),
          image:String(picture)
        };
        console.log(data, "data");
   
  
   
        const orderPlacement = await order.insertMany(data);
        console.log("cleared");
        const clearCart= await  User.updateOne({
        _id:req.session.user_id
        },{$set:{
          cart:[]
        }})
        quantity.map(async (item,i)=>{
        const reduceStock=await Product.updateOne({_id:ObjectId(productid[i])},{
        $inc:{
        quantity:-Number(item)
        }
    })
       })
    
        if(orderPlacement && clearCart){
            req.session.pass = "run"
          res.json("success")
        }else{
          const handlePlacementissue = await order.deleteMany({ orderId: orderId,});
         
          res.json("try again")
    
        }
    } catch (error) {
      res.json("try again")
  
}
  };




module.exports={
    loadusercart,
    addtocart,
    removeCartProduct,
    userCheckout,
    addCheckoutAddress,
    postCheckoutAddress,
    placeOrder,
    validateCoupon,
}