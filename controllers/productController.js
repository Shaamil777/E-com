const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const path = require('path')


const loadProductManagement = async(req, res)=>{
    try{
        const product = await Product.find({isDeleted:false});
       return res.render('admin/productManagement',{products:product});
        
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


const loadUpdateProduct = async(req, res)=>{
    const productId = req.params.id;
    
    try{
        const product = await Product.findById(productId);
        if(!product){
           return res.redirect('/admin/productmanagement')
        }
        const categories = await Category.find()
        res.render('admin/updateProduct',{product:product,categories:categories});
    }catch(error){
        console.error('Error loading product',error);
        res.status(500).send('internal server error')
    }
}

const updateProduct = async(req, res)=>{
    const {productName,productImage,productDescription,productId,productCategory,productBrand,productPrice,productStock,productWarrenty,productReturn} = req.body;
    
    try {
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).send('product not found')
        }

        
        product.name = productName;
        product.description = productDescription;
        product.image = productImage;
        product.price = productPrice;
        product.brand = productBrand;
        product.stock = productStock;
        product.warrenty = productWarrenty;
        product.category = productCategory;
        product.returnPolicy = productReturn;
        product.updatedAt = Date.now();

        await product.save();
        res.status(200).json({success:true,message:'succcessfully updated product'})
    } catch (error) {
        console.error('Error updating product : ',error);
        res.status(500).json({success:false,message:'error updating product'});
    }
}

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
}