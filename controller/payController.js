const User = require('../models/userModel');
const payment = require('../models/payModel');
const moment = require('moment')



const myOrderLoad = async (req, res) => {
    try {
      const orderData = await payment
        .find({ userId: req.session.user_id })
        .sort({ date: -1 });
  
      const formattedOrderData = orderData.map((order) => ({
        ...order._doc,
        date: moment(order.date).format("MM/DD/YYYY"),
      }));
  
      const length = formattedOrderData.length;
      res.render("myOrder", {
        order: formattedOrderData,
        secnav: 1,
        usefooter: 1,
        length,
      });
    } catch (error) {
      console.log(error);
    }
  };
  


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
        const serverDate = new Date(orderData[0].date);
            

        // Format the date as a string in the desired format
        const formattedDate = serverDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        res.render('userInvoice',{order:orderData,userlog:1,formattedDate})
    } catch (error) {
       console.log(error.message); 
    }
}

const orderSuccess = async(req,res)=>{
    try {
        
            const orderData = await payment.find({}).sort({_id:-1}).limit(1)
            const serverDate = new Date(orderData[0].date);
            

            // Format the date as a string in the desired format
            const formattedDate = serverDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            res.render('order-success',{order:orderData,formattedDate}) 

           

// Display the formatted date on the UI
console.log(formattedDate); 
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