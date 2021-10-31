const pool = require('../models/database');
const userDB = require('../models/userDB');

module.exports.insertUser = async (req, res) => {
    const client = await pool.connect();
    const {firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber} =  req.body;
    try{
        const userExist = await userDB.userExistByUsername(client, username);
        if(!userExist){
            await userDB.createUser(client, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber);
            res.sendStatus(201);
        }else{
            res.status(409).json({error: "username already exists"});
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.updateUser = async (req, res) => { //TODO: faire avec la gestion des sessions VOIR correctioon labo 4 controleur/clientDB
    const {id: userId, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber} = req.body;
    const client = await pool.connect();
    try{
        //user to modify from the id in body
        const {rows: usersToModify} = await userDB.getUserById(client, userId);
        const userToModify = usersToModify !== undefined ? usersToModify[0] : undefined;

        //check if a user exists with the username written in body
        const {rows: users} = await userDB.getUserByUsername(client, username);
        const user = users !== undefined ? users[0] : undefined;

        if(userToModify === undefined) res.status(404).json({error: "user doesn't exist"});

        if(!user || user.username === userToModify.username){ //if a user with the new username doens't exist or if this is the same username as before
            await userDB.updateUser(client, userId, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber);
            res.sendStatus(204);
        }else{ //if we try to change username to one already in use
            res.status(409).json({error: "username already exists"});
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.getAllUsers = async (req, res) => {
    const client = await pool.connect();
    try{
        const {rows: users} = await userDB.getAllUsers(client);
        if(users !== undefined){
            res.json(users);
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

module.exports.deleteUser = async (req, res) => {
    const {id} = req.body;
    const client = await pool.connect();
    try{
        await userDB.deleteUserById(client, id);
        res.sendStatus(204);
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}