const Category = require('../models/categoryModel')
const path = require('path');
const productModel = require('../models/productModel');

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

const applyOffer = async (req,res)=>{
  const {catId} = req.params;
  const {offerPercentage} = req.body;
  try {
    if(!offerPercentage){
      return res.status(400).json({success:false,
        message:"offerPercentage is required"
      })
    }
    const products = await productModel.find({category:catId})
    if(!products){
      return res.status(404).json({success:false,message:'no products found'});
    }
    console.log(offerPercentage)
    for(let product of products){
      product.withoutOfferPrice=product.price
      const discount = parseInt((product.price * offerPercentage) / 100)
      const newPrice = product.price-discount;

      product.price=newPrice;
      await product.save()
    }
    
    
    await Category.findByIdAndUpdate(catId,{isOfferApplied:true});
    return res.status(200).json({success:true,message:"OfferPercentage applied successfully"});
  } catch (error) {
    console.error("Error while applying offer:",error);
    return res.status(500).json({success:false,message:"Something went wrong:",error});
  }
}

const removeOffer= async(req,res)=>{
  const {categoryId} = req.params;
  try {
    if(!categoryId){
      return res.status(400).json({success:false,message:"Invalid categoryId"})
    }
    const products = await productModel.find({category:categoryId})
    if(!products){
      return res.status(404).json({success:false,message:'No products found'});
    }
    for(let product of products){
      product.price=product.withoutOfferPrice;
      await product.save()
    }

    await Category.findByIdAndUpdate(categoryId,{isOfferApplied:false});
    return res.status(200).json({success:true,message:"Offer removed successfully"});
  } catch (error) {
    console.error("Error removing offer : ",error);
    return res.status(500).json({success:false,message:"Something went wrong"})
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