const pool = require("../models/database");
const orderDB = require('../models/orderDB');
const userDB = require('../models/userDB');

module.exports.insertOrder = async (req, res) => {
    const {user} = req.body;
    const client = await pool.connect();
    try{
        const userExist = await userDB.userExistById(client, user.id);
        if(userExist){
            await orderDB.createOrder(client, user.id);
            res.sendStatus(201);
        }else{
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

module.exports.updateOrder = async (req, res) => {
    const {id: orderId, order_date, user} = req.body;
    const client = await pool.connect();
    try{
        const orderExist = await orderDB.orderExistById(client, orderId);
        const userExist = await userDB.userExistById(client, user?.id);
        if(orderExist && userExist){
            await orderDB.updateOrder(client, orderId, order_date, user.id);
            res.sendStatus(204);
        }else{
            if(!orderExist) res.status(409).json({error: "Catégorie introuvable"});
            if(!userExist) res.status(409).json({error: "Utilisateur introuvable"});
            else res.sendStatus(404);
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.getAllOrders = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: orders} = await orderDB.getAllOrders(client);
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

module.exports.deleteOrder = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        await orderDB.deleteOrderById(client, id);
        res.sendStatus(204);
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}