const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const path = require('path')


const loadProductManagement = async(req, res)=>{
    const page = parseInt(req.query.page) || 1; 
    const limit = 5;
    try{
        const productCount = await Product.countDocuments({ isDeleted: false });

        const product = await Product.find({isDeleted:false}).skip((page-1)*limit).limit(limit);

       return res.render('admin/productManagement',{products:product,currentPage:page,totalPages:Math.ceil(productCount/limit),limit:limit});
        
    }catch(error){
        console.error('Error loading category',error);
        res.status(500).send('internal server error')
    }
    
}

const loadAddProduct = async(req, res)=>{
   try {
    const category = await Category.find({isDeleted: false});
    return res.render('admin/addProduct',{Category: category});
   } catch (error) {
    console.error('Error loading category',error);
    res.status(500).send('internal server error') 
   }
}

const addProduct = async(req, res)=>{
 try{
    const {productName,productDescription,productImage,productPrice,productCategory,productBrand,productStock,productWarrenty,productReturn} = req.body;
    const imagePaths = [];
      for (const key in req.files) {
        req.files[key].forEach((file) => {
          imagePaths.push(
            path.relative(path.join(__dirname, "..", "public"), file.path)
          );
        });
      }
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ val: false, msg: "No files were uploaded" });
      }
  
  const product = new Product({
    name: productName,
    description: productDescription,
    image: imagePaths,
    price: productPrice,
    brand: productBrand,
    stock: productStock,
    warrenty: productWarrenty,
    returnPolicy: productReturn,
    category: productCategory,
    createdAt: new Date,
    isDeleted: false
  })

  await product.save();

  res.redirect('/admin/productmanagement')

}catch(error){
    console.error('Error in adding product',error);
    res.status(500).send('internal server error')
}
  

}


const loadUpdateProduct = async (req, res) => {
    const productId = req.params.id;
    
    try {
        // Fetch product details by productId
        const product = await Product.findById(productId);
        if (!product) {
            // If the product is not found, redirect to the product management page
            return res.redirect('/admin/productmanagement');
        }

        // Fetch available categories
        const categories = await Category.find();
        
        // Render the update product page with the product details and categories
        res.render('admin/updateProduct', { 
            product: product, 
            categories: categories 
        });
    } catch (error) {
        console.error('Error loading product', error);
        res.status(500).send('Internal server error');
    }
};

const  productImageUpdate=async(req, res)=>{
    try {
      const { productIndex } = req.body;
      const { productId } = req.params;
      if (!req.file) {
        return res
          .status(400)
          .json({ val: false, msg: "No file was uploaded" });
      }
      const filePath = path.relative(
        path.join(__dirname, "..", "public"),
        req.file.path
      );
      console.log("Product Index:", productIndex);
      console.log("Product ID:", productId);
      console.log("File Path:", filePath);
      const product = await Product.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({ val: false, msg: "Product not found" });
      }
      product.image[productIndex] = filePath;
      await product.save();
      return res
        .status(200)
        .json({ val: true, msg: "Product image updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ val: false, msg: "Server error" });
    }
  }


const updateProduct = async (req, res) => {
    const { productName, productDescription, productId, productCategory, productBrand, productPrice, productStock, productWarrenty, productReturn } = req.body;


    
   


    try {
        const product = await Product.findById(productId);
        if (!product) {
            // Return a JSON response instead of plain text
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.name = productName;
        product.description = productDescription;
        product.price = productPrice;
        product.brand = productBrand;
        product.stock = productStock;
        product.warranty = productWarrenty;
        product.category = productCategory;
        product.returnPolicy = productReturn;
        product.updatedAt = Date.now();

        // Assign images if they exist
       

        await product.save();
        res.status(200).json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product: ', error);
        res.status(500).json({ success: false, message: 'Error updating product' });
    }
};


const loadDeletedProduct = async(req,res)=>{
    try {
        const product = await Product.find({isDeleted:true});
        if(!product){
            return res.status(404).json({message:"No deleted categories found"})
        }else{
            return res.render('admin/deletedProduct',{deletedProducts:product})
        }
    }catch(error){
        console.error('Error loading deleted product',error);
        res.status(500).json({message:'Internal server error'})
    }
}

const deleteProduct = async(req,res)=>{
    const {productId} = req.body;
    
    
    try {
        const product = await Product.findByIdAndUpdate(productId,{isDeleted:true},{new:true});
 
        if(!product){
            return res.status(404).json({message:"product not found"})
        }
        return res.status(200).json({success:true,message:'product deleted successfully'})
        
    } catch (error) {
        console.error('Error deleting product',error);
       return res.status(500).json({message:'Internal server error'})
    }
}

const recoverProduct = async(req,res)=>{
    const {productId} = req.body;
    try {
        const trimmedProductId = productId.trim();
        const product = await Product.findByIdAndUpdate(trimmedProductId,{isDeleted:false},{new:true});
        
        if(!product){
            return res.status(404).json({success:false,message:"product not found"})
        }
        return res.status(200).json({success:true,message:'product recovered successfully'})
        
    } catch (error) {
        console.error('Error while recovering product',error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}




module.exports ={
    loadProductManagement,
    loadAddProduct,
    addProduct,
   loadUpdateProduct,
   updateProduct,
   loadDeletedProduct,
   deleteProduct,
   recoverProduct,
   productImageUpdate
}