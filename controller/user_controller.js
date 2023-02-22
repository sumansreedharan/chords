
const User = require('../models/userModel');
const Product = require('../models/productModel')
const Banner = require('../models/bannerModel');
const Category = require('../models/categoryModel')
const headerData = require('../middleware/passingData')
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

// const crypto = require('crypto')

const config = require("../config/config");

const randomstring = require("randomstring");
const { log } = require('handlebars');
const { ObjectID } = require('bson');

//otp sending

const passData = Category.find({})

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

const otp = generateOTP();

//login page
const loginPage = async (req, res) => {
    
    try {
        
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async (password) => {
    try {
        const passwordHAsh = await bcrypt.hash(password, 10);
        return passwordHAsh;
    }
    catch (error) {
        console.log(error.message);
    }
}

// for send mail
const sendVerifyMail = async (name, email,user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword,
            }
        });




        const mailsend = {
            from: config.emailUser,
            to: email,
            subject: 'For Verification mail',
            html: '<p>Hii ' + name + ' This is your OTP  ' + otp + '</p> '
        }
        transporter.sendMail(mailsend, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);

            }
        })
    } catch (error) {
        console.log(error.message);
    }
}



const insertUser = async (req, res) => {
    try {
        const checkUser = await User.find({
            email: req.body.email
        })

        const mob = await User.find({
            mobile: req.body.mobile
        })



        const spassword = await securePassword(req.body.password);

        if (checkUser == "") {

            if (mob == "") {


                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: spassword,
                    is_admin: 0,
                    token: otp
                });



                const userData = await user.save();

                if (userData) {
                    sendVerifyMail(req.body.name, req.body.email,userData._id);
                    res.redirect('/userotpverify?id='+userData._id);
                }
                else {
                    res.render('signup', { error: "Your registration has been failed" });
                }
            }
            else {
                res.render('signup', {
                    error: " email and mobile are not available"
                })
            }
        }
        else {
            res.render('signup', {
                error: " Email or mobile are not available"
            })
        }
    }
    catch (error) {
        console.log(error.message);
    }
}
const otpverification = async(req,res)=>{
    try {
        res.render('userotpverify')
    } catch (error) {
        console.log(error.message);
    }
}

// verify using otp
const verifyMail = async (req, res) => {

    try {
      
    
        const userData = await User.findOne({_id:req.query.id});
       
        const enterotp = await req.body.otp;
        console.log(userData.token);
        console.log(enterotp);
        if (enterotp === userData.token) {
           
            const otpcheck = await User.updateOne({
                email:userData.email
            }, {
                $set: {
                    is_verified: 1
                }
            });
            console.log(otpcheck);
            res.render('login')
           
        } else {
            res.render('userotpverify', {
                message: "invalid otp please check and retry"
            })
        }

    }
    catch (error) {

        console.log(error);
    }
}


const signupPage = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPassword = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}
//for reseting password

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset password',
            html: '<p>Hii ' + name + ' please click here to <a href="http://localhost:3000/remember?token=' + token + '"> Reset </a> your password.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);

            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({ email: email });

        if (userData) {

            if (userData.is_verified === 0) {

                res.render('forget', { message: "Please verify your mail" });

            } else {

                const randomString = randomstring.generate();
                const UpdatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                sendResetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget', { message: "Please check your mail for reseting your password." });

            }


        } else {
            res.render('forget', { message: "User email is incorrect." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });

        if (tokenData) {

            res.render('remember', { user_id: tokenData._id });

        } else {
            res.render('404', { message: "Token is invalid" });
        }



    } catch (error) {
        console.log(error.message);
    }
}


const resetPassword = async (req, res) => {
    try {

        const password = req.body.password
        const user_id = req.body.user_id

        const secure_Password = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_Password } });

        res.render('remember', { message: "Password reset successfull" })

    } catch (error) {
        console.log(error.message)
    }
}




const verifyLogin = async (req, res, next) => {

    try {

        // const productData = await Product.find({})
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({
            email: email
        });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {

                    res.render('login', {
                        
                        error: "please verify your mail.",
                    })

                } else {
                    if (userData.blocked) {
                        res.render('login', {
                           
                            error: "Temporarily blocked by admin.",
                        })
                    }else{
                        req.session.user_id = userData._id
                        // console.log(req.session.user_id);
                        // res.render('home', {usernav:1,
                        //     product: productData,  
                        // });
                        res.redirect('/home')
                    }
                     
                    
                    
                }
            } else {
                res.render('login', {
                    
                    error: "email or  password is incorrect"
                })
            }

        } else {
            res.render('login', {
                
                error: "email or  password is incorrect"
            })
        }

    } catch (error) {
        console.log(error)
}

}





const loadhome = async (req, res) => {
    try {
        console.log(req.session.user_id);
        const bannerData = await Banner.find();
        const categories = await (await headerData()).categories;
        const productData = await Product.find({
             is_deleted:false
        })
        if(req.session.user_id){ res.render('home'/*,{user:userData}*/ ,{userlog:1,product:productData,banner:bannerData,categories:categories})}
        // const userData = await User.findById({ _id: req.session.user_id });
       else{
        res.render('home',{usernav:1,product:productData,banner:bannerData})
       }
    } catch (error) {
        console.log(error.message);
    }
}

const productview = async(req,res) =>{
    try {
        
        const id = req.query.id;
        const productData = await Product.findById({_id:id})
        console.log(productData);
        res.render('productview',{product:productData, userlog:1})
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {


    try {
       req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
}
}

const userProfile = async(req,res) =>{
    try {
     const userData = await User.findOne({_id:req.session.user_id})
        res.render('userProfile',{user:userData, address:userData.Address,userlog:1})
    } catch (error) {
       console.log(error.message); 
    }
}

const edituserprofile = async(req,res)=>{
    try {
        const userdata = await User.findOne({_id:req.session.user_id})
        res.render('userEdit',{user:userdata,secnav:1})
    } catch (error) {
       console.log(error.message);
     
    }
}

const updateProfile = async (req, res) => {
    try {
            
        const userdata = await User.updateOne({ _id: req.session.user_id }, {
            
            $set: {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
            }
        })
        res.redirect('/userEdit');
    } catch (error) {
        console.log(error.message);
}
}

const loaduseraddress = async(req,res)=>{
    try {
        res.render('editadress')
    } catch (error) {
        console.log(error.message);

    }
}

const pushAddress = async (req,res) => {
    try {
      const address = await User.findOneAndUpdate({_id:req.session.user_id},{$addToSet:{Address:req.body}})
      res.redirect('/userProfile')  
    } catch (error) {
        console.log(error.message);
    }
}

const popaddress = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findByIdAndUpdate({ _id: req.session.user_id },
            {
                $pull: {
                    Address: { _id: id }
                }
            });
        res.redirect('/userProfile');
    } catch (error) {
        console.log(error.message);
    }
}

const categoryList = async(req,res)=>{
    try {
        const categoryData = await Category.find({})
        res.render('shop-list',{category:categoryData,userlog:1})
    } catch (error) {
       console.log(error.message); 
    }
}

const viewProducts = async (req,res)=>{
    try {
        const productData = await Product.find({category:req.query.categoryname,is_deleted: false})
        res.render('viewProducts',{Product:productData,userlog:1,})
    } catch (error) {
        console.log(error.message);
    }
}





module.exports = {
    loginPage,
    signupPage,
    forgetPassword,
    insertUser,
    verifyMail,
    verifyLogin,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    loadhome,
    otpverification,  
    productview,
    userLogout,
    userProfile,
    edituserprofile,
    updateProfile,
    loaduseraddress,
    pushAddress,
    popaddress,
    categoryList,
    viewProducts,
    

    
    
    
}