module.exports.createCategory = async (client, name) => {
    return await client.query(`
    INSERT INTO category(name) VALUES($1)`, [name]);
}

module.exports.updateCategory = async (client, categoryId, name) => {
    return await client.query(`
    UPDATE category SET name = $2 WHERE id = $1`, [categoryId, name]);
}

module.exports.getAllCategories = async (client, rowLimit, offset, searchElem) => {
    const params = [];
    let query = `SELECT * FROM category`;

    if(searchElem !== undefined){
        params.push("%" + searchElem + "%");
        query += ` WHERE CAST(id AS TEXT) LIKE $${params.length} OR LOWER(name) LIKE $${params.length}`;
    }

    query += ` ORDER BY name`;

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

module.exports.getCategoryCount = async (client, searchElem) => {
    if(searchElem === undefined){
        return await client.query(`SELECT COUNT(*) FROM category`);
    }else{
        return await client.query(`SELECT COUNT(*) FROM category WHERE CAST(id AS TEXT) LIKE $1 OR LOWER(name) LIKE $1`, ["%" + searchElem + "%"]);
    }
}

module.exports.getCategoryById = async (client, categoryId) => {
    return await client.query(`SELECT * FROM category WHERE id = $1 LIMIT 1`, [categoryId]);
}

module.exports.getCategoryByName = async (client, name) => {
    return await client.query(`SELECT * FROM category WHERE name = $1 LIMIT 1`, [name]);
}

module.exports.deleteCategoryById = async (client, categoryId) => {
    return await client.query(`DELETE FROM category WHERE id = $1`, [categoryId]);
}

module.exports.categoryExistByName = async (client, name) => {
    const {rows} = await client.query(
        `SELECT count(name) AS nbr FROM category WHERE name = $1`,
        [name]
    );
    return rows[0].nbr > 0;
}

module.exports.categoryExistById = async (client, categoryId) => {
    const {rows} = await client.query(
        `SELECT count(id) AS nbr FROM category WHERE id = $1`,
        [categoryId]
    );
    return rows[0].nbr > 0;
}