module.exports.createMeal = async (client, name, description, portionNumber, image, userId, categoryId, orderId, publicationDate) => {
    if(publicationDate === undefined){
        return await client.query(`
        INSERT INTO meal(name, description, portion_number, publication_date, image, user_fk, category_fk, order_fk)
        VALUES ($1, $2 , $3, NOW(), $4, $5, $6, $7)`, [name, description, portionNumber, image, userId, categoryId, orderId]);
    }else{
        return await client.query(`
        INSERT INTO meal(name, description, portion_number, publication_date, image, user_fk, category_fk, order_fk)
        VALUES ($1, $2 , $3, $8, $4, $5, $6, $7)`, [name, description, portionNumber, image, userId, categoryId, orderId, publicationDate]);
    }
}

module.exports.updateMeal = async (client, mealId, name, description, portionNumber, publicationDate, userId, categoryId, orderId, image) => {
    if(orderId == -1) orderId = null;

    const params = [];
    const querySet = [];
    let query = "UPDATE meal SET ";

    if(name !== undefined && name !== ""){
        params.push(name);
        querySet.push(` name = $${params.length} `);
    }
    if(description !== undefined && description !== ""){
        params.push(description);
        querySet.push(` description = $${params.length} `);
    }
    if(portionNumber !== undefined && portionNumber !== ""){
        params.push(portionNumber);
        querySet.push(` portion_number = $${params.length} `);
    }
    if(publicationDate !== undefined && publicationDate !== ""){
        params.push(publicationDate);
        querySet.push(` publication_date = $${params.length} `);
    }
    if(userId !== undefined && userId !== ""){
        params.push(userId);
        querySet.push(` user_fk = $${params.length} `);
    }
    if(categoryId !== undefined && categoryId !== ""){
        params.push(categoryId);
        querySet.push(` category_fk = $${params.length} `);
    }
    if(orderId !== undefined && orderId !== ""){
        params.push(orderId);
        querySet.push(` order_fk = $${params.length} `);
    }
    if(image !== undefined){
        params.push(image);
        querySet.push(` image = $${params.length} `);
    }
    if(params.length > 0){
        query += querySet.join(',');
        params.push(mealId);
        query += ` WHERE id = $${params.length}`;

        return client.query(query, params);
    } else {
        throw new Error("No field to update");
    }
}

module.exports.getAllMeals = async (client, rowLimit, offset, searchElem, isMealAvailableFiltered) => {
    const params = [];
    let query = `SELECT *, TO_CHAR(m.publication_date::DATE, 'dd-mm-yyyy') as publication_date, m.id as id, m.name as name,
                c.id as category_id, c.name as category_name FROM meal m LEFT JOIN "user" u ON m.user_fk = u.id LEFT JOIN category c ON m.category_fk = c.id`;

    if(searchElem !== undefined){
        params.push("%" + searchElem + "%");
        if(isMealAvailableFiltered !== undefined && isMealAvailableFiltered){
            query += ` WHERE (CAST(m.id AS TEXT) LIKE $${params.length} OR LOWER(m.name) LIKE $${params.length} OR LOWER(m.description) LIKE $${params.length} OR u.username LIKE $${params.length}) AND m.order_fk IS NULL`;
        }else{
            query += ` WHERE CAST(m.id AS TEXT) LIKE $${params.length} OR LOWER(m.name) LIKE $${params.length} OR LOWER(m.description) LIKE $${params.length} OR u.username LIKE $${params.length} OR CAST(m.order_fk AS TEXT) LIKE $${params.length}`;
        }
    }

    if(searchElem === undefined && isMealAvailableFiltered !== undefined && isMealAvailableFiltered){
        query += ` WHERE m.order_fk IS NULL`;
    }

    query += ` ORDER BY m.id DESC`;

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

module.exports.getMealsCount = async (client, searchElem) => {
    if(searchElem === undefined){
        return await client.query(`SELECT COUNT(*) FROM meal`);
    }else{
        return await client.query(`SELECT COUNT(*) FROM meal WHERE CAST(id AS TEXT) LIKE $1 OR LOWER(name) LIKE $1 OR LOWER(description) LIKE $1`, ["%" + searchElem + "%"]);
    }
}

module.exports.getMealById = async (client, mealId) => {
    return await client.query(`SELECT *, TO_CHAR(m.publication_date::DATE, 'dd-mm-yyyy') as publication_date, m.id as id, m.name as name,
        c.id as category_id, c.name as category_name FROM meal m LEFT JOIN "user" u ON m.user_fk = u.id LEFT JOIN category c ON m.category_fk = c.id WHERE m.id = $1 LIMIT 1`, [mealId]);
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