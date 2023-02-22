const Handlebars = require('handlebars')



 const checkOne =  Handlebars.registerHelper('iftrue', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

const checkTwo =  Handlebars.registerHelper('ifnottrue', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


module.exports={
    checkOne,
    checkTwo,
    
}