const User = require('../models/userModel');
const payment = require('../models/payModel');


const myOrderLoad = async(req,res)=>{
    try {
        const orderData = await payment.find({userId:req.session.user_id}).sort({date: -1});
        const length = orderData.length
        res.render('myOrder',{order:orderData,secnav:1,usefooter:1,length})
    } catch (error) {
        console.log(error)
    }
}

const cancelMyOrder = async(req,res)=>{
    try {
        const id =req.query.id;
        const orderData = await payment.findOne({_id:id})
        if (orderData.status === "delivered") {
            const returnOrder = await payment.findOneAndUpdate({_id:id},{

                $set:{
                    status:"returned"
                }
            })
        } else if(orderData.status === "pending"){
            const cancelOrder = await payment.findOneAndUpdate(
                {_id:id},
                {
                    $set:{
                        status:"cancelled"
                    },
                }
            )
        }
        res.redirect('/myOrder')
    } catch (error) {
      console.log(error.message)
    }
}

const userInvoice = async(req,res)=>{
    try {
        const orderData = await payment.find({orderId:req.query.id}).lean()
        res.render('userInvoice',{order:orderData,userlog:1, })
    } catch (error) {
       console.log(error.message); 
    }
}

const orderSuccess = async(req,res)=>{
    try {
        // if(req.session.pass){
        //     delete req.seesion.pass
            const orderData = await payment.find({}).sort({_id:-1}).limit(1)
            res.render('order-success',{order:orderData}) 
        // }
        // else{
        //     res.redirect('/')
        // }
      
    } catch (error){
      console.log(error.message);  
    }
}
    


module.exports={
    myOrderLoad,
    cancelMyOrder,
    userInvoice,
    orderSuccess
}