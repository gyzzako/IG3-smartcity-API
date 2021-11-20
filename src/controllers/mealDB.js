var fs = require('fs');
const pool = require("../models/database");
const mealDB = require("../models/mealDB");
const userDB = require("../models/userDB");
const categoryDB = require("../models/categoryDB");
const orderDB = require("../models/orderDB");
const uuid = require('uuid');
const {saveImage} = require('../models/imageManager');

const destFolderImages = "./src/upload/mealImages";

module.exports.insertMeal = async (req, res) => {
    const client = await pool.connect();
    const {user_fk: userId, name, description, portion_number, category_fk: categoryId, order_fk} = req.body;
    const image = req.files.image[0];
    try{
        let fullImageName = null;
        if(image !== undefined){
            fullImageName = uuid.v4();
            const imageFormat = await handleImageUploadingToStorage(image, fullImageName);
            fullImageName += "." + imageFormat;
        }

        await client.query("BEGIN;");
        const userExist = await userDB.userExistById(client, userId);
        const categoryExist = await categoryDB.categoryExistById(client, categoryId);
        const orderExist = await orderDB.orderExistById(client, order_fk);
        const orderId = (order_fk !== undefined && orderExist) ? order_fk : null; //will either be the order id if it's a correct one or null if there's none written in parameters

        /*check if the user and category related exist. We also check if 
          there is an order parameter and if it's a valid one. If there is none, the order_fk is set to null */
        if(userExist && categoryExist && ((order_fk !== undefined && orderExist) || (order_fk === undefined))){ 
            await mealDB.createMeal(client, name, description, portion_number, fullImageName, userId, categoryId, orderId);
            await client.query("COMMIT");
            res.sendStatus(201);
        }else{
            await client.query("ROLLBACK");
            if(!userExist) res.status(404).json({error: "Utilisateur introuvable"}); 
            else if(!categoryExist) res.status(404).json({error: "Catégorie introuvable"}); 
            else if(!orderExist && order_fk !== undefined) res.status(404).json({error: "Commande introuvable"}); 
            else res.sendStatus(404);
        }
    }catch(e){
        await client.query("ROLLBACK;");
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.updateMeal = async (req, res) => {//TODO: faire pour pouvoir modifier que un seul attribut
    //const {user, id: mealId, name, description, portion_number, publication_date, image, category, order} = req.body;
    const {id: mealId, user_fk: userId, name, description, portion_number, publication_date, category_fk: categoryId, order_fk, oldImageName} = req.body;
    const images = req.files.image;
    const image = images !== undefined ? images[0] : undefined;
    const client = await pool.connect();
    try{
        let fullImageName;
        if(image !== undefined){
            fullImageName = uuid.v4();
            const imageFormat = await handleImageUploadingToStorage(image, fullImageName);
            fullImageName += "." + imageFormat;
        }
        
        await client.query("BEGIN;");
        const mealExist = await mealDB.mealExistById(client, mealId);
        const userExist = await userDB.userExistById(client, userId);
        const categoryExist = await categoryDB.categoryExistById(client, categoryId)
        let orderExist, orderId;
        if(order_fk !== undefined){
            orderExist = await orderDB.orderExistById(client, order_fk);
            orderId = orderExist ? order_fk : undefined; //will either be the order id if it's a correct one or null if there's none written in parameters
        }
       
        /*check if the meal we want to modify exist and if the user and category related exists as well. We also check if 
          there is an order parameter and if it's a valid one. If there is none, the order_fk is set to null */
        if(mealExist && userExist && categoryExist && ((order_fk !== undefined && orderExist) || (order_fk === undefined))){
            await mealDB.updateMeal(client, mealId, name, description, portion_number, publication_date, userId, categoryId, orderId, fullImageName);
            await client.query("COMMIT");
            if(image !== undefined) handleImageRemovingFromStorage(oldImageName); //ne supprime l'ancienne image seulement si on recoi une nouvelle
            res.sendStatus(204);
        }else{
            await client.query("ROLLBACK");
            if(!mealExist) res.status(404).json({error: "Repas introuvable"}); 
            else if(!userExist) res.status(404).json({error: "Utilisateur introuvable"}); 
            else if(!categoryExist) res.status(404).json({error: "Catégorie introuvable"}); 
            else if(!orderExist && order_fk !== undefined) res.status(404).json({error: "Commande introuvable"}); 
            else res.sendStatus(404).json({error: "dddd"});
        }
    }catch(e){
        await client.query("ROLLBACK;");
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.getAllMeals = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: meals} = await mealDB.getAllMeals(client);
        if(mealDB !== undefined){
            res.json(meals);
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

module.exports.getMealById = async (req, res) => {
    const mealId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: meal} = await mealDB.getMealById(client, mealId);
        if(meal !== undefined){
            res.json(meal);
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


module.exports.deleteMeal = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        const {rows: imagesName} = await mealDB.getMealImageById(client, id);
        const imageName = imagesName[0].image;
        await mealDB.deleteMealById(client, id);
        if(imageName !== undefined) handleImageRemovingFromStorage(imageName);
        res.sendStatus(204);
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

async function handleImageUploadingToStorage(imageTest, imageName){
    const image = imageTest;
    if(image === undefined){
        throw new error("Erreur lors de la sauvegarde de l'image");
    }else{
        try{
            const response = await saveImage(image.buffer, imageName, destFolderImages);
            return response.format;
        }catch(e){
            console.error(error);
            throw new error("Erreur lors de la sauvegarde de l'image");
        }
    }
}

async function handleImageRemovingFromStorage(imageName){
    if(imageName !== undefined && imageName !== null && imageName !== "null"){
        fs.stat(destFolderImages, function (err, stats) {     
            if(err) {
                return console.error(err);
            }
            fs.unlink(destFolderImages + "/" + imageName, function(err){
                 if(err) return console.error(err);
            });  
         });
    }
}

