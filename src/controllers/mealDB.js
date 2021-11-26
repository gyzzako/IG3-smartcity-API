const pool = require("../models/database");
const mealDB = require("../models/mealDB");
const userDB = require("../models/userDB");
const categoryDB = require("../models/categoryDB");
const orderDB = require("../models/orderDB");
const uuid = require('uuid');
const {handleImageUploadingToStorage, handleImageRemovingFromStorage} = require('../models/imageManager');

const destFolderImages = "./src/upload/mealImages";

module.exports.insertMeal = async (req, res) => {
    const {user_fk: userId, name, description, portion_number, category_fk: categoryId, order_fk, publication_date} = req.body;
    const image = req.files.image[0];
    if(userId === undefined || name === undefined || description === undefined || portion_number === undefined || 
        categoryId === undefined || image === undefined){
            res.sendStatus(400);
    }
    const client = await pool.connect();
    try{
        let fullImageName = null;
        if(image !== undefined){
            fullImageName = uuid.v4();
            const imageFormat = await handleImageUploadingToStorage(image, fullImageName, destFolderImages);
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
            await mealDB.createMeal(client, name, description, portion_number, fullImageName, userId, categoryId, orderId, publication_date);
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

module.exports.updateMeal = async (req, res) => {
    const {id: mealId, user_fk: userId, name, description, portion_number, publication_date, category_fk: categoryId, order_fk, oldImageName} = req.body;
    const images = req.files.image;
    const image = images !== undefined ? images[0] : undefined;
    if(userId === undefined || name === undefined || description === undefined || portion_number === undefined || 
        categoryId === undefined){
            res.sendStatus(400);
    }
    const client = await pool.connect();
    try{
        let fullImageName;
        if(image !== undefined){
            fullImageName = uuid.v4();
            const imageFormat = await handleImageUploadingToStorage(image, fullImageName, destFolderImages);
            fullImageName += "." + imageFormat;
        }
        
        await client.query("BEGIN;");
        const mealExist = await mealDB.mealExistById(client, mealId);
        const userExist = await userDB.userExistById(client, userId);
        const categoryExist = await categoryDB.categoryExistById(client, categoryId)
        let orderExist, orderId;
        if(order_fk !== undefined && order_fk !== null){
            orderExist = await orderDB.orderExistById(client, order_fk);
            orderId = orderExist ? order_fk : undefined; //will either be the order id if it's a correct one or null if there's none written in parameters
        }
       
        /*check if the meal we want to modify exist and if the user and category related exists as well. We also check if 
          there is an order parameter and if it's a valid one. If there is none, the order_fk is set to null */
        if(mealExist && userExist && categoryExist && ((order_fk !== undefined && orderExist) || (order_fk === undefined))){
            await mealDB.updateMeal(client, mealId, name, description, portion_number, publication_date, userId, categoryId, orderId, fullImageName);
            await client.query("COMMIT");
            if(image !== undefined) handleImageRemovingFromStorage(oldImageName, destFolderImages); //ne supprime l'ancienne image seulement si on recoit une nouvelle
            res.sendStatus(204);
        }else{
            await client.query("ROLLBACK");
            if(!mealExist) res.status(404).json({error: "Repas introuvable"}); 
            else if(!userExist) res.status(404).json({error: "Utilisateur introuvable"}); 
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

module.exports.getAllMeals = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: meals} = await mealDB.getAllMeals(client);
        if(meals !== undefined){
            //NE PAS SUPP. Pas encore applicable car il faut changer le fonctionnement d'affichage du backoffice pour gérer les objects envoyés par l'api 
            const {rows: categories} = await categoryDB.getAllCategories(client);
            if (categories !== undefined) {
                //on récupère l'object categorie complet (id et nom) à la place de juste l'id de la catégorie
                meals.forEach(meal => {
                    const category = categories.find(category => category.id === meal.category_fk)
                    meal.category = category;
                    delete meal.category_fk;
                });
            }
            res.json(meals);
        }else{111
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
            //on récupère l'object categorie complet (id et nom) à la place de juste l'id de la catégorie
            const {rows: category} = await categoryDB.getCategoryById(client, meal[0].category_fk);
            if(category !== undefined){
                meal[0].category = category[0];
                delete meal.category_fk;
            }
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
        let imageName;
        if(imagesName.length > 0) imageName = imagesName[0].image;
        const response = await mealDB.deleteMealById(client, id);
        if(response.rowCount > 0){
            if(imageName !== undefined) handleImageRemovingFromStorage(imageName, destFolderImages);
            res.sendStatus(204);
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