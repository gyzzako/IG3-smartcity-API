const pool = require("../models/database");
const categoryDB = require('../models/categoryDB');

module.exports.insertCategory = async (req, res) => {
    const {name} = req.body;
    const client = await pool.connect();
    try{
        const categoryExist = await categoryDB.categoryExistByName(client, name);
        if(!categoryExist){
            await categoryDB.createCategory(client, name);
            res.sendStatus(201);
        }else{
            res.status(404).json({error: "Catégorie introuvable"}); 
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.updateCategory = async (req, res) => {//TODO: faire pour pouvoir modifier que un seul attribut
    const {id: categoryId, name} = req.body;
    const client = await pool.connect();
    try{
        //category to modify from the id in body
        const {rows: categoriesToModify} = await categoryDB.getCategoryById(client, categoryId);
        const categoryToModify = categoriesToModify !== undefined ? categoriesToModify[0] : undefined;

        //check if a category exists with the name written in body
        const {rows: categories} = await categoryDB.getCategoryByName(client, name);
        const category = categories !== undefined ? categories[0] : undefined;

        if(!category || category.name === categoryToModify.name){ //if a category with the new name doens't exist or if this is the same category name as before
            await categoryDB.updateCategory(client, categoryId, name);
            res.sendStatus(204);
        }else{ //if we try to change category name to one already in use
            res.status(409).json({error: "Catégorie introuvable"});
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.getAllCategories = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: categories} = await categoryDB.getAllCategories(client);
        if(categories !== undefined){
            res.json(categories);
        }else{
            res.sendStatus(404);
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}


module.exports.getCategoryById = async (req, res) => {
    const categoryId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: category} = await categoryDB.getCategoryById(client, categoryId);
        if(category !== undefined){
            res.json(category);
        }else{
            res.sendStatus(404);
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.deleteCategory = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        await categoryDB.deleteCategoryById(client, id);
        res.sendStatus(204);
    }catch(e){
        if(e.code == 23503){ // quand on essaie de supprimer une ligne qui est référencée par une FK autre part
            res.status(403).json({error: "Impossible de supprimer cette catégorie car elle est liée à d'autres entités", errorCode: 23503});
        }else{
            console.error(e);
            res.sendStatus(500);
        }
    }finally{
        client.release();
    }
}