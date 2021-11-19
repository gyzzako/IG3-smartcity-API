const pool = require("../models/database");
const mealDB = require("../models/mealDB");
const userDB = require("../models/userDB");
const categoryDB = require("../models/categoryDB");
const orderDB = require("../models/orderDB");

module.exports.insertMeal = async (req, res) => {
    const client = await pool.connect();
    const {user, name, description, portion_number, image, category, order} = req.body;
    try{
        await client.query("BEGIN;");
        const userExist = await userDB.userExistById(client, user?.id);
        const categoryExist = await categoryDB.categoryExistById(client, category?.id);
        const orderExist = await orderDB.orderExistById(client, order?.id);
        const orderId = (order !== undefined && orderExist) ? order.id : null; //will either be the order id if it's a correct one or null if there's none written in parameters

        /*check if the user and category related exist. We also check if 
          there is an order parameter and if it's a valid one. If there is none, the order_fk is set to null */
        if(userExist && categoryExist && ((order !== undefined && orderExist) || (order === undefined))){ 
            await mealDB.createMeal(client, name, description, portion_number, image, user.id, category.id, orderId);
            await client.query("COMMIT");
            res.sendStatus(201);
        }else{
            await client.query("ROLLBACK");
            if(!userExist) res.status(404).json({error: "user doesn't exist"}); 
            else if(!categoryExist) res.status(404).json({error: "category doesn't exist"}); 
            else if(!orderExist && order !== undefined) res.status(404).json({error: "order doesn't exist"}); 
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
    const {user, id: mealId, name, description, portion_number, publication_date, image, category, order} = req.body;
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
            await mealDB.updateMeal(client, mealId, name, description, portion_number, publication_date, image, user.id, category.id, orderId);
            await client.query("COMMIT");
            res.sendStatus(204);
        }else{
            await client.query("ROLLBACK");
            if(!mealExist) res.status(404).json({error: "meal doesn't exist"}); 
            else if(!userExist) res.status(404).json({error: "user doesn't exist"}); 
            else if(!categoryExist) res.status(404).json({error: "category doesn't exist"}); 
            else if(!orderExist && order !== undefined) res.status(404).json({error: "order doesn't exist"}); 
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
    console.log(id)
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