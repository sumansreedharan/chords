const Category = require('../models/categoryModel')

module.exports = async () => {
    const categories = await Category.find({ status: true });
    const products = "fghjkdm";

    return { categories, products };

}


