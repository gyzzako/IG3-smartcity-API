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

module.exports.getAllUsers = async (client) => {
    return await client.query(`SELECT * FROM "user" ORDER BY id`);
}

module.exports.getUserById = async (client, userId) => {
    return await client.query(`SELECT * FROM "user" WHERE id = $1 LIMIT 1`, [userId]);
}

module.exports.getUserByUsername = async (client, username) => {
    return await client.query(`SELECT * FROM "user" WHERE username = $1 LIMIT 1`, [username]);
}

/* A VOIR POUR LA CONNECTION*/
module.exports.getUserByUsernameAndPassword = async (client, username, password) => {
    return await client.query(`SELECT * FROM "user" WHERE username = $1 AND password = $2 LIMIT 1`, [username, password]);
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