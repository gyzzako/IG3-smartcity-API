const pool = require('../models/database');
const userDB = require('../models/userDB');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *  schemas:
 *      UserWithoutPassword:
 *          type: object
 *          properties:
 *              id:
 *                  type: integer
 *              firstname:
 *                  type: string
 *                  description: User's firstname
 *              lastname:
 *                  type: string
 *                  description: User's lastname
 *              username:
 *                  type: string
 *                  description: Username of the user
 *              is_admin:
 *                  type: boolean
 *                  description: Determine if a user if an administrator or not
 *              province:
 *                  type: string
 *                  description: Province where the user lives
 *              city:
 *                  type: string
 *                  description: City where the user lives
 *              street_and_number:
 *                  type: string
 *                  description: Street and number where the user lives
 *  responses:
 *      UserBadJSONBody:
 *          description: The JSON body is not correct
 *      UserBadParams:
 *          description: The URL parameters are not valid
 *      UserAlreadyExist:
 *          description: This username is already talen
 */

/**
 *@swagger
 *components:
 *  responses:
 *      UserAdded:
 *          description: The user has been added
 *  requestBodies:
 *      UserToAdd:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstname:
 *                              type: string
 *                              description: User's firstname
 *                          lastname:
 *                              type: string
 *                              description: User's lastname
 *                          username:
 *                              type: string
 *                              description: Username of the user
 *                          password:
 *                              type: string
 *                              description: Hashed password of the user
 *                          is_admin:
 *                              type: boolean
 *                              description: Determine if a user if an administrator or not
 *                          province:
 *                              type: string
 *                              description: Province where the user lives
 *                          city:
 *                              type: string
 *                              description: City where the user lives
 *                          street_and_number:
 *                              type: string
 *                              description: Street and number where the user lives
 *                      required:
 *                          - firstname
 *                          - lastname
 *                          - username
 *                          - password
 *                          - province
 *                          - city
 *                          - street_and_number
 */
module.exports.insertUser = async (req, res) => {
    const {firstname, lastname, phone_number, username, password, is_admin, province, city, street_and_number} =  req.body;
    if(firstname === undefined || firstname === "" || lastname === undefined || lastname === "" || phone_number === undefined || phone_number === "" ||
        username === undefined || username === "" || password === undefined || password === "" || province === undefined || province === "" ||
        city === undefined || city === "" || street_and_number === undefined || street_and_number === ""){ 
             res.sendStatus(400);
    }else{
        const client = await pool.connect();
        try{
            const userExist = await userDB.userExistByUsername(client, username);
            if(!userExist){
                const isAdmin = is_admin === undefined || is_admin === null || is_admin === "" ? false : is_admin;
                await userDB.createUser(client, firstname, lastname, phone_number, username, password, isAdmin, province, city, street_and_number);
                res.sendStatus(201);
            }else{
                res.status(409).json({error: "Ce nom d'utilisateur existe d??j??"});
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
 *      UserUpdated:
 *          description: The user has been updated
 *  requestBodies:
 *      UserToUpdate:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                          firstname:
 *                              type: string
 *                              description: User's firstname
 *                          lastname:
 *                              type: string
 *                              description: User's lastname
 *                          username:
 *                              type: string
 *                              description: Username of the user
 *                          password:
 *                              type: string
 *                              description: Hashed password of the user
 *                          is_admin:
 *                              type: boolean
 *                              description: Determine if a user if an administrator or not
 *                          province:
 *                              type: string
 *                              description: Province where the user lives
 *                          city:
 *                              type: string
 *                              description: City where the user lives
 *                          street_and_number:
 *                              type: string
 *                              description: Street and number where the user lives
 *                      required:
 *                          - id
 */
module.exports.updateUser = async (req, res) => {
    const {id: userId, firstname, lastname, phone_number, username, password, is_admin, province, city, street_and_number} = req.body;
    /* le check de l'userID est fait dans le middleware authorization*/

    const client = await pool.connect();
    try {
        const promiseUserToModify = userDB.getUserById(client, userId); //utilisateur ?? modifier avec l'id du body
        const promiseUserExist = userDB.userExistByUsername(client, username); //v??rifi?? si un utilisateur existe avec le pseudo dans le body
        const promiseValue = await Promise.all([promiseUserToModify, promiseUserExist]);
        const userToModify = promiseValue[0].rows[0] !== undefined ? promiseValue[0].rows[0] : undefined;
        const userExist = promiseValue[1];
        if (userToModify === undefined) {
            res.status(404).json({ error: "Utilisateur introuvable" });
        } else {
            if (!userExist || username === userToModify.username) { //si un utilisateur avec le nouveau pseudo ou si c'est le m??me qu'avant
                await userDB.updateUser(client, userId, firstname, lastname, phone_number, username, password, is_admin, province, city, street_and_number);
                res.sendStatus(204);
            } else {
                res.status(409).json({ error: "Ce nom d'utilisateur existe d??j??" });
            }
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    } finally {
        client.release();
    }
}

/**
 * @swagger
 * components:
 *  responses:
 *      UsersFound:
 *           description: Return an array of users
 *           content:
 *               application/json:
 *                   schema:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/UserWithoutPassword'
 */
module.exports.getAllUsers = async (req, res) => {
    const rowLimit = req.query.rowLimit !== undefined && req.query.rowLimit !== "" ? parseInt(req.query.rowLimit) : undefined;
    const offset = req.query.offset !== undefined && req.query.offset !== "" ? parseInt(req.query.offset) : undefined;
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;

    if((req.query.rowLimit !== undefined && (req.query.rowLimit === "" || isNaN(req.query.rowLimit))) || (req.query.offset !== undefined && (req.query.offset === "" || isNaN(req.query.offset))) ||
        (req.query.searchElem !== undefined && req.query.searchElem === "")){
            res.sendStatus(404);
    }else{
        const client = await pool.connect();
        try{
            const {rows: users} = await userDB.getAllUsers(client, rowLimit, offset, searchElem);
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
}

/**
 * @swagger
 * components:
 *  responses:
 *      UserNumberFound:
 *           description: Return the number of user
 *           content:
 *               application/json:
 *                   schema:
 *                       type: integer
 */
module.exports.getUsersCount = async (req, res) => {
    const client = await pool.connect();
    const searchElem = req.query.searchElem !== undefined && req.query.searchElem !== "" ? req.query.searchElem.toLowerCase() : undefined;
    try{
        const {rows: counts} = await userDB.getUsersCount(client, searchElem);
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
 *      UserFound:
 *           description: Return a user
 *           content:
 *               application/json:
 *                   schema:
 *                       $ref: '#/components/schemas/UserWithoutPassword'
 */
module.exports.getUserById = async (req, res) => {
    const userId = req.params.id; /* le check de l'userID est fait dans le middleware authorization*/
    const client = await pool.connect();
    try {
        if (userId !== undefined) {
            const { rows: user } = await userDB.getUserById(client, userId);
            if (user !== undefined) {
                res.json(user);
            } else {

            }
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
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
 *      UserDeleted:
 *          description: The user has been deleted
 *      UserDeleteErrorEntityRelated:
 *          description: Can not deleted the user because it has related entities
 *  requestBodies:
 *      UserToDelete:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: integer
 *                              description: User ID
 *                      required:
 *                          - id
 */
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
        if(e.code == 23503){ // quand on essaie de supprimer une ligne qui est r??f??renc??e par une FK autre part
            res.status(403).json({error: "Impossible de supprimer cet utilisateur car il est li?? ?? d'autres entit??s", errorCode: 23503});
        }else{
            console.error(e);
            res.sendStatus(500);
        }
    }finally{
        client.release();
    }
}


/**
 *@swagger
 *components:
 *  responses:
 *      UserLogged:
 *          description: The user has been logged
 *  requestBodies:
 *      UserToLogin:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                          password:
 *                              type: string
 *                      required:
 *                          - username
 *                          - password
 */
module.exports.login = async (req, res) => {
    const {username, password} = req.body;
    if(username === undefined || username === "" || password === undefined || password === ""){
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
                const payload = {value: {status: userType, id, firstname, lastname}};
                const token = jwt.sign(
                    payload,
                    process.env.SECRET_TOKEN,
                    {expiresIn: '5d'}
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