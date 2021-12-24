const pool = require("../models/database");
const mealDB = require("../models/mealDB");
const userDB = require("../models/userDB");
const categoryDB = require("../models/categoryDB");
const orderDB = require("../models/orderDB");
const uuid = require('uuid');
const {handleImageUploadingToStorage, handleImageRemovingFromStorage} = require('../models/imageManager');

const destFolderImages = "./src/V1/upload/mealImages";

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
 *              multipart/form-data:
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
 *                              type: string
 *                              format: byte
 *                              description: Bytes of the images
 *                      required:
 *                          - name
 *                          - description
 *                          - portion_number
 *                          - user_fk
 *                          - category_fk
 *                          - image
 */
module.exports.insertMeal = async (req, res) => {
    const {user_fk: userId, name, description, portion_number, category_fk: categoryId, order_fk, publication_date} = req.body;
    const image = req.files?.image !== undefined ? req.files.image[0] : undefined;
    /* le check de l'userID est fait dans le middleware authorization*/
    if(name === undefined || name === "" || description === undefined || description === "" || portion_number === undefined || 
        portion_number === "" || isNaN(portion_number) || categoryId === undefined || categoryId === "" || isNaN(categoryId) ||
        (order_fk !== undefined && (order_fk === "" || isNaN(order_fk))) || image === undefined){
            res.sendStatus(400);    
    }else{
        const client = await pool.connect();
        try {
            let fullImageName
            if (image !== undefined) {
                fullImageName = uuid.v4();
                const imageFormat = await handleImageUploadingToStorage(image, fullImageName, destFolderImages);
                fullImageName += "." + imageFormat;
            }

            const promises = [];
            promises.push(userDB.userExistById(client, userId));
            promises.push(categoryDB.categoryExistById(client, categoryId));
            if(order_fk !== undefined) promises.push(orderDB.orderExistById(client, order_fk));
            const promiseValues = await Promise.all(promises);
            const userExist = promiseValues[0];
            const categoryExist = promiseValues[1];
            const orderExist = promiseValues[2];
            const orderId = orderExist ? order_fk : null; //Sera soit l'id de la commande si il est correct ou null si rien n'est spécifié

            /*vérifie si l'utiliseur et la catégorie reliée existent. Vérification aussi si il y a une commande et si son id est valide.*/
            if (userExist && categoryExist && ((order_fk !== undefined && orderExist) || (order_fk === undefined))) {
                await mealDB.createMeal(client, name, description, portion_number, fullImageName, userId, categoryId, orderId, publication_date);
                res.sendStatus(201);
            } else {
                if (!userExist) res.status(404).json({ error: "Utilisateur introuvable" });
                else if (!categoryExist) res.status(404).json({ error: "Catégorie introuvable" });
                else if (!orderExist && order_fk !== undefined) res.status(404).json({ error: "Commande introuvable" });
                else res.sendStatus(404);
            }
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        } finally {
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
 *              multipart/form-data:
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
 *                              type: string
 *                              format: byte
 *                              description: Bytes of the images
 *                      required:
 *                          - id
 */
module.exports.updateMeal = async (req, res) => {
    const {id: mealId, user_fk: userId, name, description, portion_number, publication_date, category_fk: categoryId, order_fk, oldImageName} = req.body;
    const image = req.files?.image !== undefined ? req.files.image[0] : undefined;
    if(mealId === undefined || mealId === "" || (portion_number !== undefined && (portion_number === "" || isNaN(portion_number))) || (categoryId !== undefined && (categoryId === "" || isNaN(categoryId))) || 
    (order_fk !== undefined && (order_fk === "" || isNaN(order_fk)))){
            res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            let fullImageName
            if(image !== undefined){
                fullImageName = uuid.v4();
                const imageFormat = await handleImageUploadingToStorage(image, fullImageName, destFolderImages);
                fullImageName += "." + imageFormat;
            }
            
            const promises = [];
            promises.push(mealDB.mealExistById(client, mealId));
            promises.push(userDB.userExistById(client, userId));
            promises.push(categoryDB.categoryExistById(client, categoryId));
            if(order_fk !== undefined)  promises.push(orderDB.orderExistById(client, order_fk));
            const promiseValue = await Promise.all(promises);
            const mealExist = promiseValue[0];
            const userExist = promiseValue[1];
            const categoryExist = promiseValue[2];
            const orderExist = promiseValue[3];
            let orderId = orderExist ? order_fk : undefined; //sera soit l'id de la commande si il y a correspondance ou undefined si rien n'est précisé dans le body
            if(order_fk == -1) orderId = null; // pour supprimer une commande d'un repas

            /*vérifie si le repas existe, si un utilisateur est précisé et qu'il existe ou pas d'utilisateur précisé,
                si une catégorie est précisée et qu'elle existe ou pas de catégorie précisée,
                si une commande est précisée et qu'elle existe ou pas de commande précisée
            */
            if(mealExist && 
                ((userId !== undefined && userExist) || userId === undefined) && 
                ((categoryId !== undefined && categoryExist) || categoryId === undefined) && 
                ((order_fk !== undefined && orderExist) || (order_fk === undefined || orderId === null))){
                await mealDB.updateMeal(client, mealId, name, description, portion_number, publication_date, userId, categoryId, orderId, fullImageName);
                if(image !== undefined) await handleImageRemovingFromStorage(oldImageName, destFolderImages); //ne supprime l'ancienne image seulement si on recoit une nouvelle
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
module.exports.getAllMeals = async (req, res) => { //TODO: faire pour recevoir objet user
    const rowLimit = req.query.rowLimit !== undefined && req.query.rowLimit !== "" ? parseInt(req.query.rowLimit) : undefined;
    const offset = req.query.offset !== undefined && req.query.offset !== "" ? parseInt(req.query.offset) : undefined;
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;
    const isMealAvailableFiltered = req.query.mealAvailableFilter !== undefined && (req.query.mealAvailableFilter === 'yes' || req.query.mealAvailableFilter === 'true') ? true : false;

    if((req.query.rowLimit !== undefined && (req.query.rowLimit === "" || isNaN(req.query.rowLimit))) || (req.query.offset !== undefined && (req.query.offset === "" || isNaN(req.query.offset))) ||
        (req.query.searchElem !== undefined && req.query.searchElem === "")){
            res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const {rows: meals} = await mealDB.getAllMeals(client, rowLimit, offset, searchElem, isMealAvailableFiltered);
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
        if(counts === undefined || counts[0]?.count === undefined){
            res.sendStatus(404);
        }else{
            res.json(parseInt(counts[0].count));
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
    const mealId = isNaN(req.params.id) ? undefined : parseInt(req.params.id);
    const client = await pool.connect();
    try{
        if(mealId !== undefined){
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
                handleImageRemovingFromStorage(imageName, destFolderImages);
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