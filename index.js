
const hbs = require('express-handlebars')
const express = require("express")
const config = require('./config/config')
const check = require('./Helper/check')
const session = require('express-session')
const path = require("path")
const app = express()
const connectdb = require('./config/config')
connectdb.DB();




app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials'
}));

app.use(session({
    resave: false,
    secret:config.sessionSecret,
    saveUninitialized: false,
    cookie: {
        maxAge: 360000,
        sameSite: false
}
}));

app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store');
next();
});

const userRoute = require('./routes/userRoute')
app.use('/', userRoute)



const adminRoute = require("./routes/adminRoute");
app.use('/admin', adminRoute)



app.listen(3000, function () {
    console.log("server on");
})

module.exports = adminRoute;