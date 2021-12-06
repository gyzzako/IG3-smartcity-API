const pool = require("../models/database");
const orderDB = require('../models/orderDB');
const userDB = require('../models/userDB');

module.exports.insertOrder = async (req, res) => {
    const {user, order_date} = req.body;
    if(user?.id === undefined || user?.id === ""){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const userExist = await userDB.userExistById(client, user.id);
            if(userExist){
                await orderDB.createOrder(client, user.id, order_date);
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
}

module.exports.updateOrder = async (req, res) => {
    const {id: orderId, order_date, user} = req.body;
    if(orderId === undefined || orderId === "" || user?.id === undefined || user?.id === ""){
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