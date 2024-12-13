const Category = require('../models/categoryModel')
const path = require('path')

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
}