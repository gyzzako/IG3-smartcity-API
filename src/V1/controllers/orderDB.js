const pool = require("../models/database");
const orderDB = require('../models/orderDB');
const userDB = require('../models/userDB');
const mealDB = require('../models/mealDB');

/**
 * @swagger
 * components:
 *  schemas:
 *      OrderWithConcernedUser:
 *          type: object
 *          properties:
 *              id:
 *                  type: integer
 *              order_date:
 *                  type: string
 *                  description: Order date
 *              user:
 *                  $ref: '#/components/schemas/UserWithoutPassword'
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
 *      MealAlreadyTaken:
 *          description: A meal you want to take is already taken
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
    /* le check de l'userID est fait dans le middleware authorization*/
    const {user, order_date, meals: mealsId} = req.body;
    const client = await pool.connect();
    try {
        await client.query("BEGIN;");
        const userExist = await userDB.userExistById(client, user.id);
        if (userExist) {
            const orderResponse = await orderDB.createOrder(client, user.id, order_date);
            const promises = [];
            if (mealsId !== undefined && mealsId[0] !== undefined) {
                for (mealData of mealsId) {
                    const { rows: meal } = await mealDB.getMealById(client, mealData.id);
                    const isMealAlreadyTaken = meal[0] !== undefined && meal[0].order_fk !== null && meal[0].order_fk !== undefined && meal[0].order_fk !== "" ? true : false;
                    if (!isMealAlreadyTaken) {
                        promises.push(mealDB.updateMeal(client, mealData.id, undefined, undefined, undefined, undefined, undefined, undefined, orderResponse.rows[0].id, undefined));
                    }
                }
            }
            const response = await Promise.all(promises);
            if (response.length > 0) { //check si des plats ont été modifiés ou pas
                let i = 0;
                let areMealsUpdated = true;
                while (i < response.length && areMealsUpdated) {
                    if (response[i].rowCount !== 1) areMealsUpdated = false;
                    i++;
                }

                if (mealsId !== undefined && mealsId[0] !== undefined && response[0] !== undefined && areMealsUpdated && mealsId.length === response.length) { //pour pouvoir créer une commande avec rien ou avec les repas
                    await client.query("COMMIT");
                    res.sendStatus(201);
                } else {
                    await client.query("ROLLBACK");
                    if(areMealsUpdated){
                        res.status(409).json({ error: "Repas déjà pris" });
                    }else{
                        res.status(404).json({ error: "Repas introuvable" });
                    }
                    
                }
            } else {
                if (mealsId === undefined || (mealsId !== undefined && mealsId.length === response.length)) { //pour pouvoir créer une commande avec rien ou avec les repas
                    await client.query("COMMIT");
                    res.sendStatus(201);
                } else {
                    await client.query("ROLLBACK");
                    res.status(409).json({ error: "Repas déjà pris" });
                }
            }
        } else {
            await client.query("ROLLBACK");
            if (!userExist) res.status(404).json({ error: "Utilisateur introuvable" });
            else res.sendStatus(404);
        }
    } catch (e) {
        await client.query("ROLLBACK;");
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
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
    if(orderId === undefined || orderId === "" || user.id === undefined || user.id === "" || isNaN(user.id) || order_date === undefined || order_date === ""){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const promiseOrderExist = orderDB.orderExistById(client, orderId);
            const promiseUserExist = userDB.userExistById(client, user.id);
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
 *                          $ref: '#/components/schemas/OrderWithConcernedUser'
 */
module.exports.getAllOrders = async (req, res) => {
    const client = await pool.connect();
    const rowLimit = req.query.rowLimit !== undefined && req.query.rowLimit !== "" ? parseInt(req.query.rowLimit) : undefined;
    const offset = req.query.offset !== undefined && req.query.offset !== "" ? parseInt(req.query.offset) : undefined;
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;

    if((req.query.rowLimit !== undefined && (req.query.rowLimit === "" || isNaN(req.query.rowLimit))) || (req.query.offset !== undefined && (req.query.offset === "" || isNaN(req.query.offset))) ||
        (req.query.searchElem !== undefined && req.query.searchElem === "")){
            res.sendStatus(404);
    }else{
        try{
            const {rows: orders} = await orderDB.getAllOrders(client, rowLimit, offset, searchElem);
            if(orders !== undefined){
                let user = {}
                orders.forEach(order => {
                    user = {};
                    user.id = order.user_id;
                    user.firstname = order.firstname;
                    user.lastname = order.lastname;
                    user.phone_number = order.phone_number;
                    user.username = order.username;
                    user.isadmin = order.isadmin;
                    user.province = order.province;
                    user.city = order.city;
                    user.street_and_number = order.street_and_number;
                    order.user = user;

                    delete order.user_id;
                    delete order.firstname;
                    delete order.lastname;
                    delete order.phone_number;
                    delete order.username;
                    delete order.isadmin;
                    delete order.province;
                    delete order.city;
                    delete order.street_and_number;
                });
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
 *      OrderFound:
 *           description: Return an order
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/OrderWithConcernedUser'
 */
module.exports.getOrderById = async (req, res) => {
    const orderId = isNaN(req.params.id) ? undefined : parseInt(req.params.id);
    const client = await pool.connect();
    try{
        if(orderId !== undefined){
            const {rows: orders} = await orderDB.getOrderById(client, orderId);
            const order = orders[0] !== undefined ? orders[0] : undefined;
            if(order !== undefined){
                let user = {}
                user.id = order.user_id;
                user.firstname = order.firstname;
                user.lastname = order.lastname;
                user.phone_number = order.phone_number;
                user.username = order.username;
                user.isadmin = order.isadmin;
                user.province = order.province;
                user.city = order.city;
                user.street_and_number = order.street_and_number;
                order.user = user;

                delete order.user_id;
                delete order.firstname;
                delete order.lastname;
                delete order.phone_number;
                delete order.username;
                delete order.isadmin;
                delete order.province;
                delete order.city;
                delete order.street_and_number;
                res.json(order);
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