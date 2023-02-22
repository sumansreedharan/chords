const User = require('../models/userModel');
const payment = require('../models/payModel');


const myOrderLoad = async(req,res)=>{
    try {
        const orderData = await payment.find().lean();
        res.render('myOrder',{order:orderData,secnav:1})
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
    


module.exports={
    myOrderLoad,
    cancelMyOrder,
}