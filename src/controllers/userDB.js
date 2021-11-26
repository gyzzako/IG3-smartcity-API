const pool = require('../models/database');
const userDB = require('../models/userDB');
const jwt = require('jsonwebtoken');
const {getHash} = require('../utils/utils');

module.exports.insertUser = async (req, res) => {
    const {firstname, lastname, phone_number, username, password, is_admin, province, city, street_and_number} =  req.body;
    if(firstname === undefined || lastname === undefined || phone_number === undefined || username === undefined || password === undefined || 
        province === undefined || city === undefined || street_and_number === undefined){ 
             res.sendStatus(400);
    }
    const client = await pool.connect();
    try{
        const userExist = await userDB.userExistByUsername(client, username);
        if(!userExist){
            const hashedPassword = await getHash(password);
            const isAdmin = is_admin === undefined ? false : is_admin;
            await userDB.createUser(client, firstname, lastname, phone_number, username, hashedPassword, isAdmin, province, city, street_and_number);
            res.sendStatus(201);
        }else{
            res.status(409).json({error: "Ce nom d'utilisateur existe déjà"});
        }
    }catch(e){
        console.error(e);
        res.sendStatus(500);
    }finally{
        client.release();
    }
}

module.exports.updateUser = async (req, res) => {
    const {id: userId, firstname, lastname, phone_number, username, password, is_admin, province, city, street_and_number} = req.body;
    if(firstname === undefined || lastname === undefined || phone_number === undefined || username === undefined || password === undefined || 
        province === undefined || city === undefined || street_and_number === undefined){ 
             res.sendStatus(400);
    }
    const client = await pool.connect();
    try{
        //user to modify from the id in body
        const {rows: usersToModify} = await userDB.getUserById(client, userId);
        const userToModify = usersToModify !== undefined ? usersToModify[0] : undefined;

        //check if a user exists with the username written in body
        const {rows: users} = await userDB.getUserByUsername(client, username);
        const user = users !== undefined ? users[0] : undefined;

        if(userToModify === undefined) res.status(404).json({error: "Utilisateur introuvable"});

        if(!user || user.username === userToModify.username){ //if a user with the new username doens't exist or if this is the same username as before
            const hashedPassword = await getHash(password);
            await userDB.updateUser(client, userId, firstname, lastname, phone_number, username, hashedPassword, is_admin, province, city, street_and_number);
            res.sendStatus(204);
        }else{ //if we try to change username to one already in use
            res.status(409).json({error: "Ce nom d'utilisateur existe déjà"});
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

module.exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    const client = await pool.connect();
    try{
        const {rows: user} = await userDB.getUserById(client, userId);
        if(user !== undefined){
            res.json(user);
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
        const response = await userDB.deleteUserById(client, id);
        if(response.rowCount > 0){
            res.sendStatus(204);
        }else{
            res.sendStatus(404);
        }
    }catch(e){
        if(e.code == 23503){ // quand on essaie de supprimer une ligne qui est référencée par une FK autre part
            res.status(403).json({error: "Impossible de supprimer cet utilisateur car il est lié à d'autres entités", errorCode: 23503});
        }else{
            console.error(e);
            res.sendStatus(500);
        }
    }finally{
        client.release();
    }
}

module.exports.login = async (req, res) => {
    const {username, password} = req.body;
    if(username === undefined || password === undefined){
        res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const result = await userDB.getUserForConnection(client, username, password);
            const {userType, value} = result;
            if(userType === "inconnu") {
                res.sendStatus(404);
            }else{
                // Pour les admin et user normaux
                const {id, firstname, lastname} = value;
                const payload = {status: userType, value: {id, firstname, lastname}};
                const token = jwt.sign(
                    payload,
                    process.env.SECRET_TOKEN,
                    {expiresIn: '1d'}
                );
                res.json(token);
            }
        }catch(e){
            console.error(e);
            res.sendStatus(500);
        }finally{
            client.release();
        }
    }
}