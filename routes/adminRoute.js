const express = require('express')
const adminRoute = express()
const path = require('path');
const config = require('../config/config')
const upload = require('../middleware/fileupload')
const confirm = require('../middleware/auth')


 const session = require('express-session')

// adminRoute.set('view engine','hbs');
adminRoute.set('views','./views/admin');

const adminController = require('../controller/admin_controller')



adminRoute.use(session({
    saveUninitialized:false,
    secret: (config.sessionSecret),
    resave: false,
   
}));

adminRoute.use(function(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
 next();
});






adminRoute.get('/',confirm.isLogoutAdmin,adminController.adminlogin)
adminRoute.get('/admin',confirm.isLogoutAdmin, adminController.adminlogin)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/adminhome',confirm.isLoginAdmin,adminController.adminhomeLoad)
adminRoute.get('/logout',confirm.isLoginAdmin,adminController.logoutAdmin)


adminRoute.get('/registration',confirm.isLogoutAdmin,adminController.addRegister)
adminRoute.post('/registration',adminController.addAdmin)



adminRoute.get('/products',confirm.isLoginAdmin,adminController.addProductManagement);
adminRoute.get('/addproduct',confirm.isLoginAdmin,adminController.addProduct);
adminRoute.post('/addproduct',upload.array('image',4),adminController.insertProduct);
adminRoute.get('/editproduct',confirm.isLoginAdmin,adminController.editProduct);
adminRoute.post('/editproduct',upload.array('image',4),adminController.updateproduct);
adminRoute.get('/deleteproduct',confirm.isLoginAdmin,adminController.deleteProduct);
adminRoute.get('/restoreproduct',adminController.restoreProduct);


adminRoute.get('/category',confirm.isLoginAdmin,adminController.loadCategory);
adminRoute.get('/addcategory',confirm.isLoginAdmin,adminController.addCategoryLoad);
adminRoute.post('/addcategory',adminController.insertCategory);
adminRoute.get('/editcategory',confirm.isLoginAdmin,adminController.editCategory);
adminRoute.post('/editcategory',adminController.updateCategory);
adminRoute.get('/deletecategory',confirm.isLoginAdmin,adminController.deleteCategory);

adminRoute.get('/user_management',confirm.isLoginAdmin,adminController.adduserManagement);
adminRoute.get('/adinlogout',adminController.logoutAdmin);
adminRoute.get('/blockuser',confirm.isLoginAdmin,adminController.blockUser);
adminRoute.get('/unblockuser',confirm.isLoginAdmin,adminController.unBlockUser);

adminRoute.get('/userOrders',confirm.isLoginAdmin,adminController.userOrder)
adminRoute.get('/viewOrder',confirm.isLoginAdmin,adminController.viewOrders)
adminRoute.get('/statusChange',confirm.isLoginAdmin,adminController.changeStatus)

adminRoute.get('/showBanner',confirm.isLoginAdmin,adminController.pushBanner)
adminRoute.get('/addBanner',confirm.isLoginAdmin,adminController.addBanner)
adminRoute.post('/addBanner',upload.single('image'),adminController.postBanner)
adminRoute.get('/editBanner',confirm.isLoginAdmin,adminController.editBanner)
adminRoute.post('/editbanner',upload.single('image'),adminController.patchBanner)
adminRoute.get('/removeBanner',confirm.isLoginAdmin,adminController.removeBanner)

adminRoute.get('/couponView',adminController.couponManage)
adminRoute.get('/add-coupon',adminController.addCoupon)
adminRoute.post('/add-coupon',adminController.pushCoupon)
adminRoute.get('/delete-coupon',adminController.popCoupon)

adminRoute.get('/salesReports',adminController.salesReports)





adminRoute.get('*',function(req,res){
    res.redirect('/admin')
})






module.exports = adminRoute;