const {compareHash} = require('../utils/utils');

var _this = this; //pour pouvoir utiliser la méthode getUserByUsername dans getUserForConnection

module.exports.createUser = async (client, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber) => {
    return await client.query(`
    INSERT INTO "user"(firstname, lastname, phone_number, username, password, isAdmin, province, city, street_and_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber]);
}

module.exports.updateUser = async (client, userId, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber) => {
    return await client.query(`
    UPDATE "user" SET firstname = $2, lastname = $3, phone_number = $4, username = $5, password = $6, isAdmin = $7, province = $8, city = $9, street_and_number = $10
    WHERE id = $1`, [userId, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber]);
}

module.exports.getAllUsers = async (client, rowLimit, offset, searchElem) => {
    let params = [];
    let query = `SELECT * FROM "user"`;

    if(searchElem !== undefined){
        params.push("%" + searchElem + "%");
        query += ` WHERE CAST(id AS TEXT) LIKE $${params.length} OR LOWER(firstname) LIKE $${params.length} OR LOWER(lastname) LIKE $${params.length} OR LOWER(username) LIKE $${params.length}`;
    }

    query += ` ORDER BY id`;

    if(rowLimit !== undefined){
        params.push(rowLimit);
        query += ` LIMIT $${params.length}`;
    }

    if(rowLimit !== undefined && offset !== undefined){
        params.push(offset);
        query += ` OFFSET $${params.length}`;
    }
    return await client.query(query, params);
}

module.exports.getUsersCount = async (client, searchElem) => {
    if(searchElem === undefined){
        return await client.query(`SELECT COUNT(*) FROM "user"`);
    }else{
        return await client.query(`SELECT COUNT(*) FROM "user" WHERE CAST(id AS TEXT) LIKE $1 OR LOWER(firstname) LIKE $1 OR LOWER(lastname) LIKE $1 OR LOWER(username) LIKE $1`, ["%" + searchElem + "%"]);
    }
}

module.exports.getUserById = async (client, userId) => {
    return await client.query(`SELECT * FROM "user" WHERE id = $1 LIMIT 1`, [userId]);
}

module.exports.getUserByUsername = async (client, username) => {
    return await client.query(`SELECT * FROM "user" WHERE username = $1 LIMIT 1`, [username]);
}

/* For the connection*/
module.exports.getUserForConnection = async (client, username, password) => {
    const userRows = await _this.getUserByUsername(client, username);
    const user = userRows.rows[0];
    if(user !== undefined && !user.isadmin && await compareHash(password, user.password)){
        return {userType: "client", value: user};
    } else if (user !== undefined && user.isadmin && await compareHash(password, user.password)){
        return {userType: "admin", value: user};
    } else {
        return {userType: "inconnu", value: null}
    }
}

module.exports.deleteUserById = async (client, userId) => {
    return await client.query(`DELETE FROM "user" WHERE id = $1`, [userId]);
}

module.exports.userExistByUsername = async (client, username) => {
    const {rows} = await client.query(
        `SELECT count(username) AS nbr FROM "user" WHERE username = $1`,
        [username]
    );
    return rows[0].nbr > 0;
}

module.exports.userExistById = async (client, userId) => {
    const {rows} = await client.query(
        `SELECT count(id) AS nbr FROM "user" WHERE id = $1`,
        [userId]
    );
    return rows[0].nbr > 0;
}
