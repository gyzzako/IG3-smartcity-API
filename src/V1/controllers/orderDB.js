const pool = require("../models/database");
const orderDB = require('../models/orderDB');
const userDB = require('../models/userDB');
const mealDB = require('../models/mealDB');

/**
 * @swagger
 * components:
 *  schemas:
 *      Order:
 *          type: object
 *          properties:
 *              id:
 *                  type: integer
 *              order_date:
 *                  type: string
 *                  description: Order date
 *              user_fk:
 *                  type: integer
 *                  description: User ID of who created the order
 *  responses:
 *      OrderBadJSONBody:
 *          description: The JSON body is not correct
 *      OrderBadParams:
 *          description: The URL parameters are not valid
 */

/**
 *@swagger
 *components:
 *  responses:
 *      OrderAdded:
 *          description: The order has been added
 *  requestBodies:
 *      OrderToAdd:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              type: object
 *                              properties:
 *                                  id:
 *                                      type: integer
 *                          order_date:
 *                              type: string
 *                              description: When the order has been created (omit for today date)
 *                          meals:
 *                              type: object
 *                              properties:
 *                                  id:
 *                                      type: integer
 *                      required:
 *                          - user
 */
module.exports.insertOrder = async (req, res) => {
    const {user, order_date, meals_id: meals} = req.body;
    if(user?.id === undefined || user?.id === ""){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            await client.query("BEGIN;");
            const userExist = await userDB.userExistById(client, user.id);
            if(userExist){
                const orderResponse = await orderDB.createOrder(client, user.id, order_date);
                let promises = [];
                if(meals !== undefined && meals[0] !== undefined){
                    meals.forEach(mealData =>{
                        promises.push(mealDB.updateMeal(client, mealData.id, undefined, undefined, undefined, undefined, undefined, undefined, orderResponse.rows[0].id, undefined));            
                    })
                }
                const response = await Promise.all(promises);
                let i = 0;
                let areMealsUpdated = true;
                while(i < response.length && areMealsUpdated){
                    if(response[i].rowCount !== 1) areMealsUpdated = false;
                    i++;
                }
                if((meals === undefined || (meals[0] !== undefined && response[0] !== undefined)) && areMealsUpdated){ //pour pouvoir créer une commande avec rien ou avec les repas
                    await client.query("COMMIT");
                    res.sendStatus(201);
                }else{
                    await client.query("ROLLBACK");
                    res.status(404).json({error: "Repas introuvable"});
                }
            }else{
                await client.query("ROLLBACK");
                if(!userExist) res.status(404).json({error: "Utilisateur introuvable"});
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
}


/**
 *@swagger
 *components:
 *  responses:
 *      OrderUpdated:
 *          description: The order has been updated
 *  requestBodies:
 *      OrderToUpdate:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                              description: Order ID
 *                          user:
 *                              type: object
 *                              properties:
 *                                  id:
 *                                      type: integer
 *                          order_date:
 *                              type: string
 *                              description: When the order has been created (omit for today date)
 *                      required:
 *                          - id
 *                          - user
 *                          - order_date
 */
module.exports.updateOrder = async (req, res) => {
    const {id: orderId, order_date, user} = req.body;
    if(orderId === undefined || orderId === "" || user?.id === undefined || user?.id === "" || order_date === undefined || order_date === ""){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const promiseOrderExist = orderDB.orderExistById(client, orderId);
            const promiseUserExist = userDB.userExistById(client, user?.id);
            const promiseValue = await Promise.all([promiseOrderExist, promiseUserExist]);
            const orderExist = promiseValue[0];
            const userExist = promiseValue[1];
            if(orderExist && userExist){
                await orderDB.updateOrder(client, orderId, order_date, user.id);
                res.sendStatus(204);
            }else{
                if(!orderExist) res.status(404).json({error: "Commande introuvable"});
                if(!userExist) res.status(404).json({error: "Utilisateur introuvable"});
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
 *      OrdersFound:
 *           description: Return an array of orders
 *           content:
 *               application/json:
 *                   schema:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/Order'
 */
module.exports.getAllOrders = async (req, res) => {
    const client = await pool.connect();
    const rowLimit = req.query.rowLimit !== undefined && req.query.rowLimit !== "" ? parseInt(req.query.rowLimit) : undefined;
    const offset = req.query.offset !== undefined && req.query.offset !== "" ? parseInt(req.query.offset) : undefined;
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;

    if((req.query.rowLimit !== undefined && req.query.rowLimit === "") || (req.query.offset !== undefined && req.query.offset === "") ||
        (req.query.searchElem !== undefined && req.query.searchElem === "")){
            res.sendStatus(404);
    }else{
        try{
            const {rows: orders} = await orderDB.getAllOrders(client, rowLimit, offset, searchElem);
            if(orders !== undefined){
                res.json(orders);
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
 *      OrderNumberFound:
 *           description: Return the number of orders
 *           content:
 *               application/json:
 *                   schema:
 *                       type: integer
 */
module.exports.getOrdersCount = async (req, res) => {
    const client = await pool.connect();
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;
    try{
        const {rows: counts} = await orderDB.getOrdersCount(client, searchElem);
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
 *      OrderFound:
 *           description: Return an order
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/Order'
 */
module.exports.getOrderById = async (req, res) => {
    const orderId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: order} = await orderDB.getOrderById(client, orderId);
        if(order !== undefined){
            res.json(order);
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
 *      OrderDeleted:
 *          description: The order has been deleted
 *      OrderDeleteErrorEntityRelated:
 *          description: Can not deleted the order because it has related entities
 *  requestBodies:
 *      OrderToDelete:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                              description: Order ID
 *                      required:
 *                          - id
 */
module.exports.deleteOrder = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        const response = await orderDB.deleteOrderById(client, id);
        if(response.rowCount > 0){
            res.sendStatus(204);
        }else{
            res.sendStatus(404);
        }
    }catch(e){
        if(e.code == 23503){ // quand on essaie de supprimer une ligne qui est référencée par une FK autre part
            res.status(403).json({error: "Impossible de supprimer cette commande car il est liée à d'autres entités", errorCode: 23503});
        }else{
            console.error(e);
            res.sendStatus(500);
        }
    }finally{
        client.release();
    }
}