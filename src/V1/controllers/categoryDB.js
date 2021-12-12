const pool = require("../models/database");
const categoryDB = require('../models/categoryDB');

/**
 * @swagger
 * components:
 *  schemas:
 *      Category:
 *          type: object
 *          properties:
 *              id:
 *                  type: integer
 *              name:
 *                  type: string
 *                  description: Category name
 * 
 *  responses:
 *      CategoryBadJSONBody:
 *          description: The JSON body is not correct
 *      CategoryBadParams:
 *          description: The URL parameters are not valid
 *      CategoryAlreadyExist:
 *          description: Category name already taken
 */

/**
 *@swagger
 *components:
 *  responses:
 *      CategoryAdded:
 *          description: The category has been added
 *  requestBodies:
 *      CategoryToAdd:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                      required:
 *                          - name
 */
module.exports.insertCategory = async (req, res) => {
    const {name} = req.body;
    if(name === undefined || name === ""){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const categoryExist = await categoryDB.categoryExistByName(client, name);
            if(!categoryExist){
                await categoryDB.createCategory(client, name);
                res.sendStatus(201);
            }else{
                res.status(409).json({error: "Nom de catégorie déjà existant"});
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
 *      CategoryUpdated:
 *          description: The category has been updated
 *  requestBodies:
 *      CategoryToUpdate:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                              description: Category ID
 *                          name:
 *                              type: string
 *                              description: Category name
 *                      required:
 *                          - id
 *                          - name
 */
module.exports.updateCategory = async (req, res) => {
    const {id: categoryId, name} = req.body;
    if(name === undefined || name === "" || categoryId === undefined || categoryId === ""){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const promiseCategoryById = categoryDB.getCategoryById(client, categoryId); //catégorie à modifier depuis l'id dans le body
            const promiseCategoryByName = categoryDB.getCategoryByName(client, name); //vérifie si une catégorie existe avec le nom spécifié dans le body
            const promiseValues = await Promise.all([promiseCategoryById, promiseCategoryByName]);
            const categoryToModify = promiseValues[0].rows[0] !== undefined ? promiseValues[0].rows[0] : undefined; 
            const category = promiseValues[1].rows[0] !== undefined ? promiseValues[1].rows[0] : undefined; 
            
            if(categoryToModify === undefined){
                res.sendStatus(404);
            }else{
                if(!category || category.name === categoryToModify.name){ //si une catégorie avec le nouveau nom n'existe pas ou si c'est le même nom que avant
                    await categoryDB.updateCategory(client, categoryId, name);
                    res.sendStatus(204);
                }else{
                    res.status(409).json({error: "Nom de catégorie déjà existant"});
                }
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
 *      CategoriesFound:
 *           description: Return an array of categories
 *           content:
 *               application/json:
 *                   schema:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/Category'
 */
module.exports.getAllCategories = async (req, res) => {
    const client = await pool.connect();
    const rowLimit = req.query.rowLimit !== undefined && req.query.rowLimit !== "" ? parseInt(req.query.rowLimit) : undefined;
    const offset = req.query.offset !== undefined && req.query.offset !== "" ? parseInt(req.query.offset) : undefined;
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;

    if((req.query.rowLimit !== undefined && req.query.rowLimit === "") || (req.query.offset !== undefined && req.query.offset === "" ||
        (req.query.searchElem !== undefined && req.query.searchElem === ""))){
            res.sendStatus(400);
    }else{
        try{
            const {rows: categories} = await categoryDB.getAllCategories(client, rowLimit, offset, searchElem);
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
}


/**
 * @swagger
 * components:
 *  responses:
 *      CategoryNumberFound:
 *           description: Return the number of categories
 *           content:
 *               application/json:
 *                   schema:
 *                       type: integer
 */
module.exports.getCategoryCount = async (req, res) => {
    const client = await pool.connect();
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;
    try{
        const {rows: counts} = await categoryDB.getCategoryCount(client, searchElem);
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
 *      CategoryFound:
 *           description: Return a category
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Category'
 */
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

/**
 *@swagger
 *components:
 *  responses:
 *      CategoryDeleted:
 *          description: The category has been deleted
 *      CategoryDeleteErrorEntityRelated:
 *          description: Can not deleted the category because it has related entities
 *  requestBodies:
 *      CategoryToDelete:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                              description: Category ID
 *                      required:
 *                          - id
 */
module.exports.deleteCategory = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        const response = await categoryDB.deleteCategoryById(client, id);
        if(response.rowCount > 0){
            res.sendStatus(204);
        }else{
            res.sendStatus(404);
        }
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