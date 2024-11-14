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
    res.render('admin/addCategory');
}

const addCategory = async(req, res)=>{
 try{
    const {categoryName,categoryDescription} = req.body;
    
    
    if(!req.file){
        return res.status(400).json({val:false, msg:"No image file was uploaded"});
    }


    const ImagePath = path.relative(path.join(__dirname, "..","public"),req.file.path);
  
  const category = new Category({
    name: categoryName,
    description: categoryDescription,
    image: ImagePath,
    createdAt: Date.now(),
    isDeleted: false,
    updatedAt: Date.now()
  })

  await category.save();

 return res.status(200).json({message: 'Category added successfully',category: category});
}catch(error){
    console.error('Error in adding category',error);
    res.status(500).send('internal server error')
}
  

}


const loadUpdateCategory = async(req, res)=>{
    const categoryId = req.params.id;
    console.log(categoryId);
    
    
    
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
}