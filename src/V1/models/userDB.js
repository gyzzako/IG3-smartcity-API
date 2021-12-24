const {compareHash, getHash} = require('../utils/utils');

const _this = this; //pour pouvoir utiliser la méthode getUserByUsername dans getUserForConnection

module.exports.createUser = async (client, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber) => {
    const hashedPassword = await getHash(password);
    return await client.query(`
    INSERT INTO "user"(firstname, lastname, phone_number, username, password, isAdmin, province, city, street_and_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [firstname, lastname, phoneNumber, username, hashedPassword, isAdmin, province, city, streetAndNumber]);
}

module.exports.updateUser = async (client, userId, firstname, lastname, phoneNumber, username, password, isAdmin, province, city, streetAndNumber) => {
    const params = [];
    const querySet = [];
    let query = `UPDATE "user" SET `;

    if(firstname !== undefined && firstname !== ""){
        params.push(firstname);
        querySet.push(` firstname = $${params.length} `);
    }
    if(lastname !== undefined && lastname !== ""){
        params.push(lastname);
        querySet.push(` lastname = $${params.length} `);
    }
    if(phoneNumber !== undefined && phoneNumber !== ""){
        params.push(phoneNumber);
        querySet.push(` phone_number = $${params.length} `);
    }
    if(username !== undefined && username !== ""){
        params.push(username);
        querySet.push(` username = $${params.length} `);
    }
    if(password !== undefined && password !== ""){
        const hashedPassword = await getHash(password);
        params.push(hashedPassword);
        querySet.push(` password = $${params.length} `);
    }
    if(isAdmin !== undefined && isAdmin !== ""){
        params.push(isAdmin);
        querySet.push(` isAdmin = $${params.length} `);
    }
    if(province !== undefined && province !== ""){
        params.push(province);
        querySet.push(` province = $${params.length} `);
    }
    if(city !== undefined && city !== ""){
        params.push(city);
        querySet.push(` city = $${params.length} `);
    }
    if(streetAndNumber !== undefined && streetAndNumber !== ""){
        params.push(streetAndNumber);
        querySet.push(` street_and_number = $${params.length} `);
    }
    if(params.length > 0){
        query += querySet.join(',');
        params.push(userId);
        query += ` WHERE id = $${params.length}`;

        return client.query(query, params);
    } else {
        throw new Error("No field to update");
    }
}

module.exports.getAllUsers = async (client, rowLimit, offset, searchElem) => {
    const params = [];
    let query = `SELECT id, firstname, lastname, phone_number, username, isAdmin, province, city, street_and_number FROM "user"`;

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
    return await client.query(`SELECT id, firstname, lastname, phone_number, username, isAdmin, province, city, street_and_number FROM "user" WHERE id = $1 LIMIT 1`, [userId]);
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
