const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const payment = require('../models/payModel');
const Banner = require('../models/bannerModel');
const Coupon = require('../models/couponModel')
const moment = require("moment");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randomstring = require("randomstring");
const session = require('express-session');
const { log } = require('handlebars');
const { ObjectID } = require('bson');
const { findByIdAndUpdate } = require('../models/adminModel');
const popup = require = ("node-popup")







const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {

        console.log(error.message)
    }
}


const adminlogin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            res.redirect('/admin/adminhome');
        } else {
            res.render('login', {
                login: false
            })
        }


    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email })

        if (adminData) {

            const matchPassword = await bcrypt.compare(password, adminData.password)
            if (matchPassword) {

                req.session.admin_id = adminData._id
                // req.session.admin = true
                res.redirect('/admin/adminhome')
            }

            else {
                // req.session.admin = false;
                res.render('login', { message: "Email or pasword is incorrect" })

            }

        } else {
            // req.session.admin=false;
            res.render('login', { message: "Email or password is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//logout for admin

const logoutAdmin = async (req, res, next) => {

    try {

        req.session.destroy();
        res.redirect('/admin');
    }
    catch (error) {
        console.log(error.message);

    }
}

const addRegister = async (req, res) => {
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message);
    }
}

//add admin

const addAdmin = async (req, res) => {
    try {
        const secpass = await securePassword(req.body.password)
        const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: secpass
        })

        const adminData = await admin.save();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
}

// const adminhomeLoad = async (req, res) => {
//     try {
//         res.render('adminhome', { admin: 1, login: true })

//     } catch (error) {
//         console.log(error.message);
//     }
// }


const adminhomeLoad = async (req, res) => {
    const months = {};
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    try {
        const orders = await payment.find({});
        orders.forEach(function (order) {
            var orderDate = new Date(order.date);
            var month = monthNames[orderDate.getMonth()];
            if (!months[month]) {
                months[month] = 0;
            }
            months[month]++;
        });

        const users = await User.countDocuments({});
        const orderCount = await payment.countDocuments({});
        const productCount = await Product.countDocuments({});
        const couponCount = await Coupon.countDocuments({});

        const result = await payment.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$month" },
                        year: { $year: "$year" }
                    },
                    count: { $sum: 1 },
                },
            },
        ]);


        res.render('adminhome', { months: months, result: result, admin: 1,login:true, users: users, orderCount: orderCount, productCount: productCount, couponCount: couponCount });

    } catch (error) {
        console.log(error.message);
    }
};





const addProductManagement = async (req, res) => {
    try {
        const productData = await Product.find({ is_deleted: false }).lean();
        res.render('product_management', { admin: 1, product: productData, admin: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        res.render('add_product', { category: categoryData, admin: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const insertProduct = async (req, res) => {
    console.log(req.body.category);
    try {

        const Images = req.files.map((file) => {
            return file.filename
        })
        console.log(req.body.quantity)
        const product = new Product({
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            description: req.body.description,
            image: Images,
            quantity: req.body.quantity
        })
        const productData = await product.save();
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req, res) => {
    try {

        const id = req.query.id
        const productData = await Product.findById({ _id: id })
        res.render('edit_products', { product: productData, admin: 1 })

    } catch (error) {
        console.log(error.message);
    }
}



const updateproduct = async (req, res, next) => {
    try {
        const id = req.body.id
        if (req.file) {
            const productData = await Product.findByIdAndUpdate({
                _id: id
            }, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.description,
                    quantity: req.body.quantity,
                    image: req.file.filename
                }
            })
        } else {
            const productData = await Product.findByIdAndUpdate({
                _id: id
            }, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.price,
                    description: req.body.description,
                    quantity: req.body.quantity,
                }
            })
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const id = req.query.id;
        console.log(req.query.id);
        const productData = await Product.updateOne({ _id: id }, {
            $set: {
                is_deleted: true
            }
        })

        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);

    }
}

const restoreProduct = async (req, res) => {
    try {

        const id = req.query.id;
        const productData = await Product.findByIdAndUpdate({ _id: id }, {
            $set: {
                is_deleted: false
            }
        });
        res.redirect('/admin/products');

    } catch (error) {
        console.log(error.message);
    }
}


const adduserManagement = async (req, res) => {
    try {
        const userData = await User.find({})
        res.render('user_management', { users: userData, admin: 1 })

    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                blocked: true
            }
        })
        res.redirect('user_management');
    } catch (error) {
        console.log(error.message);
    }
}

const unBlockUser = async (req, res) => {

    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                blocked: false
            }
        });
        res.redirect('user_management');
    } catch (error) {
        console.log(error.message)
    }
}


const addCategoryLoad = async (req, res) => {

    try {
        res.render('add_category', { admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const insertCategory = async (req, res) => {

    try {

        const categoryData = await Category.findOne({ name: req.body.name })
        if (categoryData) {
            res.render('add_category', {
                // category: categoryData,
                // adminlog: 1,
                error: "Entered category already exists"
            })

        } else {
            const category = new Category({
                name: req.body.name
            });

            const categoryData = await category.save();
            res.redirect('/admin/category');
        }




    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req, res) => {

    try {
        const id = req.query.id
        const categoryData = await Category.findById({
            _id: id
        })
        res.render('edit_category', { category: categoryData, admin: 1 });

    } catch (error) {
        console.log(error.message);
    }
}



const updateCategory = async (req, res, next) => {

    try {

        const categoryData = await Category.find({})

        if (categoryData) {
            res.render('category', {
                category: categoryData,
                // adminlog: 1,
                error: "Category alreasy exist"
            })
        } else {
            const name = req.body.name
            const categoryData = await Category.findByIdAndUpdate({
                _id: req.body.id
            }, {
                $set: {
                    name: name
                }
            })

            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error);
    }
}


const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.deleteOne({ _id: id });
        res.redirect('/admin/category');


    } catch (error) {
        console.log(error.message)
    }
}

const loadCategory = async (req, res) => {

    try {
        const categoryData = await Category.find({});
        res.render('category', { admin: 1, category: categoryData });
    } catch (error) {
        console.log(error);
    }
}


const userOrder = async (req, res) => {
    try {
        const orderData = await payment.find({}).lean()
        res.render('userOrder', { orderData: orderData, admin: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const viewOrders = async (req, res) => {
    try {
        const orderData = await payment.find({ _id: ObjectID(req.query.id) })
        res.render('viewProducts', { order: orderData, admin: 1 })
    } catch (error) {
        console.log(error.message);
    }
}


const changeStatus = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await payment.findOne({ _id: id })
        if (orderData.status === "pending") {
            const shipped = await payment.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "shipped"
                }
            })
        } else if (orderData.status === "shipped") {
            const delivered = await payment.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "delivered"
                }
            })
        }
        res.redirect('/admin/userOrders')
    } catch (error) {
        console.log(error.message);
    }
}

const pushBanner = async (req, res) => {
    try {
        const bannerData = await Banner.find({})
        console.log(bannerData);
        res.render('bannerView', { banner: bannerData, admin: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async (req, res) => {
    try {
        res.render('bannerManage')
    } catch (error) {
        console.log(error.message)
    }
}

const postBanner = async (req, res) => {
    try {
        const banner = new Banner({
            name: req.body.name,
            image: req.file.filename,
        })
        const bannerData = await banner.save()
        res.redirect('/admin/bannerView')
    } catch (error) {
        console.log(error.message)
    }
}

const editBanner = async (req, res) => {
    try {
        const id = req.query.id
        const bannerData = await Banner.findById({ _id: id })
        res.render('editBanner', { banner: bannerData })
    } catch (error) {
        console.log(error.message)
    }
}

const patchBanner = async (req, res) => {
    try {
        const id = req.query.id
        const bannerData = await Banner.findByIdAndUpdate({ _id: id }, {
            $set: {
                name: req.body.name,
                image: req.file.filename

            }
        })
        res.redirect('/admin/bannerView')
    } catch (error) {
        console.log(error.message);
    }
}

const removeBanner = async (req, res) => {
    try {
        const id = req.query.id;
        const bannerData = await Banner.deleteOne({ _id: id })
        res.redirect('/admin/bannerView')
    } catch (error) {
        console.log(error.message)
    }
}

const couponManage = async (req, res) => {
    try {
        const couponData = await Coupon.find({})
        res.render('load-coupon', { coupon: couponData, admin: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async (req, res) => {
    try {
        res.render('add-coupon', { admin: 1 })
    } catch (error) {
        console.log(error.message)
    }
}

const pushCoupon = async (req, res) => {
    try {
        const coupon = new Coupon({
            name: req.body.name,
            offer: req.body.offer,
            status: "Active"
        })

        const couponData = await coupon.save()
        if (couponData) {
            res.redirect('/admin/couponView')
        } else {
            res.render('add-coupon')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const popCoupon = async (req, res) => {
    try {
        const id = req.query.id
        const couponData = await Coupon.findOne({ _id: id })
        if (couponData.status === "Active") {
            const removeCoupon = await Coupon.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Inactive"
                }
            })
        } else if (couponData.status === "Inactive") {
            const updateCoupon = await Coupon.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Active"
                }
            })
        }
        res.redirect('/admin/couponView')
    } catch (error) {
        console.log(error.message);
    }
}




const salesReports = async(req,res) => {
    try {

        const orderdata = await payment.aggregate([
            { $match: { status: "delivered" } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$subtotal" }
                    
                },
                
            },
            {
                $sort:{_id:1}
            }
        ]);
        const orderdetails=await payment.find({status:"delivered"})
        const totalSales = orderdata.length > 0 ? orderdata[0].totalSales : 0;
        
        res.render('salesReports', { admin: 1, orderdata: orderdetails, totalSales: totalSales });
        
    } catch (error) {
        console.log(error.message);
    }

}





  





module.exports = {
    adminlogin,
    verifyLogin,
    logoutAdmin,
    addRegister,
    addAdmin,
    adminhomeLoad,
    addProductManagement,
    addProduct,
    insertProduct,
    editProduct,
    updateproduct,
    deleteProduct,
    restoreProduct,
    adduserManagement,
    blockUser,
    unBlockUser,
    addCategoryLoad,
    insertCategory,
    editCategory,
    updateCategory,
    deleteCategory,
    loadCategory,
    changeStatus,
    userOrder,
    viewOrders,
    pushBanner,
    addBanner,
    postBanner,
    editBanner,
    patchBanner,
    removeBanner,
    couponManage,
    addCoupon,
    pushCoupon,
    popCoupon,
    salesReports




}