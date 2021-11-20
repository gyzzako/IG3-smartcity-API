module.exports.createMeal = async (client, name, description, portionNumber, image, userId, categoryId, orderId) => {
    return await client.query(`
    INSERT INTO meal(name, description, portion_number, publication_date, image, user_fk, category_fk, order_fk)
    VALUES ($1, $2 , $3, NOW(), $4, $5, $6, $7)`, [name, description, portionNumber, image, userId, categoryId, orderId]);
}

module.exports.updateMeal = async (client, mealId, name, description, portionNumber, publicationDate, userId, categoryId, orderId, image) => {
    /*return await client.query(`
    UPDATE meal SET name = $2, description = $3, portion_number = $4, publication_date = $5, image = $6, user_fk = $7, category_fk = $8, order_fk = $9
    WHERE id = $1`, [mealId, name, description, portionNumber, publicationDate, userId, categoryId, orderId, image]);*/

    if(orderId === undefined) orderId = null;

    let params = [mealId, name, description, portionNumber, publicationDate, userId, categoryId, orderId];
    let query = "UPDATE meal SET name = $2, description = $3, portion_number = $4, publication_date = $5, user_fk = $6, category_fk = $7, order_fk = $8";
    if(image !== undefined){
        params.push(image);
        query += `, image = $${params.length}`;
    }
    query += " where id = $1";
    return await client.query(query, params);
}

module.exports.getAllMeals = async (client) => {
    return await client.query(`SELECT *, TO_CHAR(publication_date::DATE, 'dd-mm-yyyy') as publication_date FROM meal ORDER BY id DESC`);
}

module.exports.getMealById = async (client, mealId) => {
    return await client.query(`SELECT *, TO_CHAR(publication_date::DATE, 'dd-mm-yyyy') as publication_date FROM meal WHERE id = $1 LIMIT 1`, [mealId]);
}

module.exports.getMealImageById = async (client, mealId) => {
    return await client.query(`SELECT image FROM meal WHERE id = $1 LIMIT 1`, [mealId]);
}

module.exports.deleteMealById = async (client, mealId) => {
    return await client.query(`DELETE FROM meal WHERE id = $1`, [mealId]);
}

module.exports.mealExistById = async (client, mealId) => {
    const {rows} = await client.query(
        `SELECT count(id) AS nbr FROM meal WHERE id = $1`,
        [mealId]
    );
    return rows[0].nbr > 0;
}