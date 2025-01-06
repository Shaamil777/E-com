const Category = require('../models/categoryModel')
const path = require('path');
const productModel = require('../models/productModel');
const Offer = require('../models/offerModel')

const loadCategoryManagement = async(req, res)=>{
    try{
        const category = await Category.find({isDeleted:false});
       return res.render('admin/categoryManagement',{categories:category});
        
    }catch(error){
        console.error('Error loading category',error);
        res.status(500).send('internal server error')
    }
    
}

const loadAddCategory = async(req, res)=>{
    res.render('admin/addCategory',{message:null});
}

const addCategory = async(req, res)=>{
    const { categoryName } = req.body;
    try {
      const imagePath = path.relative(
        path.join(__dirname, "..", "public"),
        req.file.path
      );
      console.log(imagePath);
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        return res.status(200).json({ val: false, msg: "Category already exists" });
      }
      await Category.create({ name: categoryName, image: imagePath });
      res.status(200).json({ val: true, msg: "Category added successfully" });
    } catch (err) {
      console.log(err);
      res.status(200).json({ val: false, msg: "Category add failed" });
    }

}


const loadUpdateCategory = async(req, res)=>{
    const categoryId = req.params.id;
    try{
        const category = await Category.findById(categoryId);
        if(!category){
           return res.redirect('/admin/categorymanagement')
        }
        res.render('admin/updateCategory',{category:category});
    }catch(error){
        console.error('Error loading category',error);
        res.status(500).send('internal server error')
    }
}



async function categoryImageUpdate(req, res) {
    console.log('dghd')
    try {
      const { categoryId } = req.params;
      if (!req.file) {
        return res
          .status(400)
          .json({ val: false, msg: "No file was uploaded" });
      }
      const filePath = path.relative(
        path.join(__dirname, "..", "public"),
        req.file.path
      );
      console.log("Category ID:", categoryId);
      console.log("File Path:", filePath);
      const category = await Category.findOne({ _id: categoryId });
      if (!category) {
        return res.status(404).json({ val: false, msg: "Category not found" });
      }
      category.image = filePath;
      await category.save();
      return res
        .status(200)
        .json({ val: true, msg: "Category image updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ val: false, msg: "Server error" });
    }
  }
async function categoryUpdate(req, res) {
  const { categoryId } = req.params;
  const { categoryName } = req.body;

  try {
    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      return res.status(404).json({ val: false, msg: "Category not found" });
    }
    category.name = categoryName;
    await category.save();
    return res.status(200).json({ val: true, msg: "Category updated successfully" });
  } catch (err) {
    console.error("Error during category update:", err);
    return res.status(500).json({ val: false, msg: "Server error" });
  }
}

const updateCategory = async(req, res)=>{
    const {categoryName,categoryImage,categoryDescription,categoryId} = req.body;
    
    try {
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).send('category not found')
        }

        
        category.name = categoryName;
        category.description = categoryDescription;
        category.image = categoryImage;
        category.updatedAt = Date.now();

        await category.save();
        res.status(200).json({success:true,message:'succcessfully updated category'})
    } catch (error) {
        console.error('Error updating category : ',error);
        res.status(500).json({success:false,message:'error updating category'});
    }
}

const applyOffer = async(req,res)=>{
  const {catName}=req.params
  const {discountPercentage,startDate,endDate} = req.body
  try {

    if(!discountPercentage || !startDate || !endDate){
      return res.status(400).json({success:false,message:"All fields are required"})
    }
    if(discountPercentage<=0 || discountPercentage>100){
      return res.status(400).json({success:false,message:"Invalid discount percentage"})
    }
    const currentTime = new Date();
    if(new Date(endDate) <= currentTime){
      return res.status(400).json({success:false,message:"End date should be greater than current date"})
    }
    const existingOffer = await Offer.findOne({category:catName,expireAt:{$gte:currentTime}})
    if(existingOffer){
      return res.status(400).json({success:false,message:"Offer already exists for this category"})
    }

    const products = await productModel.find({category:catName});
    if(!products || products.length === 0){
      return res.status(404).json({success:false,message:"Product not found"})
    }
    for(let product of products){
      if(!product.withoutOfferPrice||product.withOfferPrice===0){
        product.withoutOfferPrice = product.price;
      }
      product.price = product.price - (product.price * discountPercentage) / 100;
      await product.save();
    }

    const offer = new Offer({
      category:catName,
      startDate:new Date(startDate),
      endDate:new Date(endDate),
      discountPercentage:discountPercentage,
      expireAt:new Date(endDate)
    })

    await offer.save();

    await Category.updateOne({name:catName},{$set:{isOfferApplied:true}})
    
    res.status(200).json({success:true,message:"Offer applied successfully"})
  } catch (error) {
    console.error('Error applying offer:',error);
    res.status(500).json({success:false,message:"Error while applying offer"})
  }
}

const removeOffer = async(req,res)=>{
  const {catName}=req.params;
  try {
    const offer = await Offer.findOneAndDelete({category:catName});

    if(!offer){
      return res.status(404).json({success:false,message:"No active offer found for this category"})
    }
    const products = await productModel.find({category:catName});
    for(let product of products){
      if(product.withoutOfferPrice){
        product.price = product.withoutOfferPrice;
        product.withoutOfferPrice = undefined;
        await product.save();
      }
    }

    await Category.updateOne({name:catName},{$set:{isOfferApplied:false}});
    res.status(200).json({success:true,message:"Offer removed successfully"})
  } catch (error) {
    console.error("Error occured while removing the offer",error);
    res.status(500).json({success:false,message:"Something went wrong,failed to remove offer"})
  }
}

const loadDeletedCategory = async(req,res)=>{
    try {
        const category = await Category.find({isDeleted:true});
        if(!category){
            return res.status(404).json({message:"No deleted categories found"})
        }else{
            return res.render('admin/deletedCategory',{deletedCategories:category})
        }
    }catch(error){
        console.error('Error loading deleted categories',error);
        res.status(500).json({message:'Internal server error'})
    }
}

const deleteCategory = async(req,res)=>{
    const {categoryId} = req.body;
    
    
    try {
        const category = await Category.findByIdAndUpdate(categoryId,{isDeleted:true},{new:true});
 
        if(!category){
            return res.status(404).json({message:"category not found"})
        }
        return res.status(200).json({success:true,message:'category deleted successfully'})
        
    } catch (error) {
        console.error('Error deleting category',error);
       return res.status(500).json({message:'Internal server error'})
    }
}

const recoverCategory = async(req,res)=>{
    const {categoryId} = req.body;
   
    
    
    try {
        const trimmedCategoryId = categoryId.trim();
        const category = await Category.findByIdAndUpdate(trimmedCategoryId,{isDeleted:false},{new:true})
        ;
        
        if(!category){
            return res.status(404).json({message:"category not found"})
        }
        return res.status(200).json({success:true,message:'category recovered successfully'})
    } catch (error) {
        console.error('Error while recovering category',error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}


module.exports ={
    loadCategoryManagement,
    loadAddCategory,
    addCategory,
   loadUpdateCategory,
   updateCategory,
   loadDeletedCategory,
   deleteCategory,
   recoverCategory,
   categoryUpdate,
   categoryImageUpdate,
   applyOffer,
   removeOffer
}