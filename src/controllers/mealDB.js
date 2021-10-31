const pool = require("../models/database");
const mealDB = require("../models/mealDB");
const userDB = require("../models/userDB");
const categoryDB = require("../models/categoryDB");
const orderDB = require("../models/orderDB");

module.exports.insertMeal = async (req, res) => {
    const client = await pool.connect();
    const {user, name, description, portionNumber, image, category, order} = req.body;
    console.log(order)
    try{
        await client.query("BEGIN;");
        const userExist = await userDB.userExistById(client, user?.id);
        const categoryExist = await categoryDB.categoryExistById(client, category?.id)
        if(userExist && categoryExist){
            await mealDB.createMeal(client, name, description, portionNumber, image, user.id, category.id);
            await client.query("COMMIT");
            res.sendStatus(201);
        }else{
            await client.query("ROLLBACK");
            if(!userExist) res.status(404).json({error: "user doesn't exist"}); 
            if(!categoryExist) res.status(404).json({error: "category doesn't exist"}); 
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
    const {user, id: mealId, name, description, portionNumber, publicationDate, image, category, order} = req.body;
    const client = await pool.connect();
    try{
        await client.query("BEGIN;");
        const mealExist = await mealDB.mealExistById(client, mealId);
        const userExist = await userDB.userExistById(client, user?.id);
        const categoryExist = await categoryDB.categoryExistById(client, category?.id)
        const orderExist = await orderDB.orderExistById(client, order?.id);
        const orderId = (order !== undefined && orderExist) ? order.id : null; //will either be the order id if it's a correct one or null if there's none written in parameters

        /*check if the meal we want to modify exist and if the user and category related exists as well. We also check if 
          there is an order parameter and if it's a valid one. If there is none, the order_fk is set to null */
        if(mealExist && userExist && categoryExist && ((order !== undefined && orderExist) || (order === undefined))){
            await mealDB.updateMeal(client, mealId, name, description, portionNumber, publicationDate, image, user.id, category.id, orderId);
            await client.query("COMMIT");
            res.sendStatus(204);
        }else{
            await client.query("ROLLBACK");
            if(!mealExist) res.status(404).json({error: "meal doesn't exist"}); 
            if(!userExist) res.status(404).json({error: "user doesn't exist"}); 
            if(!categoryExist) res.status(404).json({error: "category doesn't exist"}); 
            if(!orderExist && order !== undefined) res.status(404).json({error: "order doesn't exist"}); 
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


module.exports.deleteMeal = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        await mealDB.deleteMealById(client, id);
        res.sendStatus(204);
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}