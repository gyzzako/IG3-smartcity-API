module.exports.createCategory = async (client, name) => {
    return await client.query(`
    INSERT INTO category(name) VALUES($1)`, [name]);
}

module.exports.updateCategory = async (client, categoryId, name) => {
    return await client.query(`
    UPDATE category SET name = $2 WHERE id = $1`, [categoryId, name]);
}

module.exports.getAllCategories = async (client) => {
    return await client.query(`SELECT * FROM category ORDER BY name`);
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