const pool = require("../models/database");
const mealDB = require("../models/mealDB");
const userDB = require("../models/userDB");
const categoryDB = require("../models/categoryDB");
const orderDB = require("../models/orderDB");
const uuid = require('uuid');
const {handleImageUploadingToStorage, handleImageRemovingFromStorage} = require('../models/imageManager');

const destFolderImages = "./src/V1/upload/mealImages";
const imageURL = "http://localhost:3001/mealimages/";

/**
 * @swagger
 * components:
 *  schemas:
 *      Meal:
 *          type: object
 *          properties:
 *              id:
 *                  type: integer
 *              name:
 *                  type: string
 *                  description: Meal name
 *              description:
 *                  type: string
 *                  description: Meal description
 *              portion_number:
 *                  type: integer
 *                  description: Number of portion of the meal
 *              publication_date:
 *                  type: string
 *                  description: When the meal was published
 *              user_fk:
 *                  type: integer
 *                  description: User ID of who created the meal
 *              category_fk:
 *                  type: integer
 *                  description: Category ID to which the meal belongs
 *              order_fk:
 *                  type: integer
 *                  description: Order ID of the related order (null if there is none)
 *              image:
 *                  type: string
 *                  description: Image path + name
 * 
 * 
 *  responses:
 *      MealBadJSONBody:
 *          description: The JSON body is not correct
 *      MealBadParams:
 *          description: The URL parameters are not valid
 */

/**
 *@swagger
 *components:
 *  responses:
 *      MealAdded:
 *          description: The meal has been added
 *  requestBodies:
 *      MealToAdd:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: Meal name
 *                          description:
 *                              type: string
 *                              description: Meal description
 *                          portion_number:
 *                              type: integer
 *                              description: Number of portion of the meal
 *                          publication_date:
 *                              type: string
 *                              description: When the meal was published (omit for today date)
 *                          user_fk:
 *                              type: integer
 *                              description: User ID of who created the meal
 *                          category_fk:
 *                              type: integer
 *                              description: Category ID to which the meal belongs
 *                          order_fk:
 *                              type: integer
 *                              description: Order ID of the related order (omit if there is none)
 *                          image:
 *                              type: object
 *                              description: Image bytes
 *                      required:
 *                          - id
 *                          - name
 *                          - description
 *                          - portion_number
 *                          - category_fk
 *                          - image
 */
module.exports.insertMeal = async (req, res) => {
    const {user_fk: userId, name, description, portion_number, category_fk: categoryId, order_fk, publication_date} = req.body;
    const image = req.files?.image[0];
    if(userId === undefined || userId === "" || name === undefined || name === "" || description === undefined || description === "" || portion_number === undefined || 
        portion_number === "" || categoryId === undefined || categoryId === "" || image === undefined){
            res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            let imageFullURL;
            if(image !== undefined){
                let fullImageName = uuid.v4();
                const imageFormat = await handleImageUploadingToStorage(image, fullImageName, destFolderImages);
                fullImageName += "." + imageFormat;
                imageFullURL = imageURL.concat(fullImageName);
            }

            const promiseUserExist = userDB.userExistById(client, userId);
            const promiseCategoryExist = categoryDB.categoryExistById(client, categoryId);
            const promiseOrderExist = orderDB.orderExistById(client, order_fk);
            const promiseValues = await Promise.all([promiseUserExist, promiseCategoryExist, promiseOrderExist]);
            const userExist = promiseValues[0];
            const categoryExist = promiseValues[1];
            const orderExist = promiseValues[2];
            const orderId = (order_fk !== undefined && orderExist) ? order_fk : null; //Sera soit l'id de la commande si il est correct ou null si rien n'est spécifié
            
            /*vérifie si l'utiliseur et la catégorie reliée existent. Vérification aussi si il y a une commande et si son id est valide.*/
            if(userExist && categoryExist && ((order_fk !== undefined && orderExist) || (order_fk === undefined))){ 
                await mealDB.createMeal(client, name, description, portion_number, imageFullURL, userId, categoryId, orderId, publication_date);
                res.sendStatus(201);
            }else{
                if(!userExist) res.status(404).json({error: "Utilisateur introuvable"}); 
                else if(!categoryExist) res.status(404).json({error: "Catégorie introuvable"}); 
                else if(!orderExist && order_fk !== undefined) res.status(404).json({error: "Commande introuvable"}); 
                else res.sendStatus(404);
            }
        }catch(e){
            console.error(e);
            res.sendStatus(500);
        }finally{
            client.release();
        }
    }
}


/**
 *@swagger
 *components:
 *  responses:
 *      MealUpdated:
 *          description: The meal has been updated
 *  requestBodies:
 *      MealToUpdate:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                          name:
 *                              type: string
 *                              description: Meal name
 *                          description:
 *                              type: string
 *                              description: Meal description
 *                          portion_number:
 *                              type: integer
 *                              description: Number of portion of the meal
 *                          publication_date:
 *                              type: string
 *                              description: When the meal was published
 *                          user_fk:
 *                              type: integer
 *                              description: User ID of who created the meal
 *                          category_fk:
 *                              type: integer
 *                              description: Category ID to which the meal belongs
 *                          order_fk:
 *                              type: integer
 *                              description: Order ID of the related order (omit if there is none or -1 to remove the current one)
 *                          image:
 *                              type: object
 *                              description: Image bytes
 *                      required:
 *                          - id
 */
module.exports.updateMeal = async (req, res) => {
    const {id: mealId, user_fk: userId, name, description, portion_number, publication_date, category_fk: categoryId, order_fk, oldImageName} = req.body;
    const images = req.files?.image;
    const image = images !== undefined ? images[0] : undefined;
    if(mealId === undefined || mealId === ""){
            res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            let imageFullURL;
            if(image !== undefined){
                let fullImageName = uuid.v4();
                const imageFormat = await handleImageUploadingToStorage(image, fullImageName, destFolderImages);
                fullImageName += "." + imageFormat;
                imageFullURL = imageURL.concat(fullImageName);
            }
            
            const promiseMealExist = mealDB.mealExistById(client, mealId);
            const promiseUserExist = userDB.userExistById(client, userId);
            const promiseCategoryExist = categoryDB.categoryExistById(client, categoryId)
            const promiseValue = await Promise.all([promiseMealExist, promiseUserExist, promiseCategoryExist]);
            const mealExist = promiseValue[0];
            const userExist = promiseValue[1];
            const categoryExist = promiseValue[2];
            let orderExist, orderId;
            if(order_fk !== undefined && order_fk !== null){
                orderExist = await orderDB.orderExistById(client, order_fk);
                orderId = orderExist ? order_fk : undefined; //sera soit l'id de la commande si il y a correspondance ou undefined si rien n'est précisé dans le body
                if(order_fk == -1) orderId = null;
            }

            /*vérifie si le repas existe, si un utilisateur est précisé et qu'il existe ou pas d'utilisateur précicé,
                si une catégorie est précisée et qu'elle existe ou pas de catégorie précicée,
                si une commande est précisée et qu'elle existe ou pas de commande précicée
            */
            if(mealExist && 
                ((userId !== undefined && userExist) || userId === undefined) && 
                ((categoryId !== undefined && categoryExist) || categoryId === undefined) && 
                ((order_fk !== undefined && orderExist) || (order_fk === undefined || orderId === null))){
                await mealDB.updateMeal(client, mealId, name, description, portion_number, publication_date, userId, categoryId, orderId, imageFullURL);
                if(image !== undefined) handleImageRemovingFromStorage(oldImageName, destFolderImages); //ne supprime l'ancienne image seulement si on recoit une nouvelle
                res.sendStatus(204);
            }else{
                if(!mealExist) res.status(404).json({error: "Repas introuvable"}); 
                else if(!userExist && userId !== undefined) res.status(404).json({error: "Utilisateur introuvable"}); 
                else if(!categoryExist && categoryId !== undefined) res.status(404).json({error: "Catégorie introuvable"}); 
                else if(!orderExist && order_fk !== undefined) res.status(404).json({error: "Commande introuvable"}); 
                else res.sendStatus(404);
            }
        }catch(e){
            console.error(e);
            res.sendStatus(500);
        }finally{
            client.release();
        }
    }
}


/**
 * @swagger
 * components:
 *  responses:
 *      MealsFound:
 *           description: Return an array of meals
 *           content:
 *               application/json:
 *                   schema:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/Meal'
 */
module.exports.getAllMeals = async (req, res) => {
    const client = await pool.connect();
    const rowLimit = req.query.rowLimit !== undefined && req.query.rowLimit !== "" ? parseInt(req.query.rowLimit) : undefined;
    const offset = req.query.offset !== undefined && req.query.offset !== "" ? parseInt(req.query.offset) : undefined;
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;

    if((req.query.rowLimit !== undefined && req.query.rowLimit === "") || (req.query.offset !== undefined && req.query.offset === "") ||
        (req.query.searchElem !== undefined && req.query.searchElem === "")){
            res.sendStatus(400);
    }else{
        try{
            const {rows: meals} = await mealDB.getAllMeals(client, rowLimit, offset, searchElem);
            if(meals !== undefined){
                let category = {}
                meals.forEach(meal => {
                    category = {};
                    category.id = meal.category_id;
                    category.name = meal.category_name;

                    meal.category = category;
                    delete meal.category_fk;
                    delete meal.category_id
                    delete meal.category_name
                });
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
}


/**
 * @swagger
 * components:
 *  responses:
 *      MealNumberFound:
 *           description: Return the number of meals
 *           content:
 *               application/json:
 *                   schema:
 *                       type: integer
 */
module.exports.getMealsCount = async (req, res) => {
    const client = await pool.connect();
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;
    try{
        const {rows: counts} = await mealDB.getMealsCount(client, searchElem);
        if(counts[0] !== undefined){
            res.json(counts[0]);
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


/**
 * @swagger
 * components:
 *  responses:
 *      MealFound:
 *           description: Return a meal
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Meal'
 */
module.exports.getMealById = async (req, res) => {
    const mealId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: meals} = await mealDB.getMealById(client, mealId);
        const meal = meals[0] !== undefined ? meals[0] : undefined;
        if(meal !== undefined){
            let category = {}
            category.id = meal.category_id;
            category.name = meal.category_name;

            meal.category = category;
            delete meal.category_fk;
            delete meal.category_id
            delete meal.category_name
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

/**
 *@swagger
 *components:
 *  responses:
 *      MealDeleted:
 *          description: The meal has been deleted
 *      MealDeleteErrorEntityRelated:
 *          description: Can not deleted the meal because it has related entities
 *  requestBodies:
 *      MealToDelete:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                              description: Meal ID
 */
module.exports.deleteMeal = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        const {rows: imagesName} = await mealDB.getMealImageById(client, id);
        let imageName;
        if(imagesName.length > 0) imageName = imagesName[0].image;
        const response = await mealDB.deleteMealById(client, id);
        if(response.rowCount > 0){
            if(imageName !== undefined){
                const temp =  imageName.split("/");
                const imageFileName = temp[temp.length-1];
                handleImageRemovingFromStorage(imageFileName, destFolderImages);
            }
            res.sendStatus(204);
        }else{
            res.sendStatus(404);
        }
    }catch(e){
        if(e.code == 23503){ // quand on essaie de supprimer une ligne qui est référencée par une FK autre part
            res.status(403).json({error: "Impossible de supprimer ce repas car il est lié à d'autres entités", errorCode: 23503});
        }else{
            console.error(e);
            res.sendStatus(500);
        }
    }finally{
        client.release();
    }
}