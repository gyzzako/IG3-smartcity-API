module.exports.createOrder = async (client, userId, orderDate) => {
    if(orderDate !== undefined){
        return await client.query(`
        INSERT INTO "order"(order_date, user_fk) VALUES ($2, $1) RETURNING id`, [userId, orderDate]);
    }else{
        return await client.query(`
        INSERT INTO "order"(order_date, user_fk) VALUES (NOW(), $1) RETURNING id`, [userId]);
    }

}

module.exports.updateOrder = async (client, orderId, orderDate, userId) => {
    return await client.query(`
    UPDATE "order" SET order_date = $2, user_fk = $3
    WHERE id = $1`, [orderId, orderDate, userId]);
}

module.exports.getAllOrders = async (client, rowLimit, offset, searchElem) => {
    let params = [];
    let query = `SELECT *, TO_CHAR(order_date::DATE, 'dd-mm-yyyy') as order_date FROM "order"`;

    if(searchElem !== undefined){
        params.push("%" + searchElem + "%");
        query += ` WHERE CAST(id AS TEXT) LIKE $${params.length} OR CAST(TO_CHAR(order_date::DATE, 'dd-mm-yyyy') AS TEXT) LIKE $${params.length}`;
    }

    query += ` ORDER BY id DESC`;

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

module.exports.getOrdersCount = async (client, searchElem) => {
    if(searchElem === undefined){
        return await client.query(`SELECT COUNT(*) FROM "order"`);
    }else{
        return await client.query(`SELECT COUNT(*) FROM "order" WHERE CAST(id AS TEXT) LIKE $1 OR CAST(TO_CHAR(order_date::DATE, 'dd-mm-yyyy') AS TEXT) LIKE $1`, ["%" + searchElem + "%"]);
    }
}

module.exports.getOrderById = async (client, orderId) => {
    return await client.query(`SELECT *, TO_CHAR(order_date::DATE, 'dd-mm-yyyy') as order_date FROM "order" WHERE id = $1 LIMIT 1`, [orderId]);
}

module.exports.deleteOrderById = async (client, orderId) => {
    return await client.query(`DELETE FROM "order" WHERE id = $1`,[orderId]);
}

module.exports.orderExistById = async (client, orderId) => {
    const {rows} = await client.query(
        `SELECT count(id) AS nbr FROM "order" WHERE id = $1`,
        [orderId]
    );
    return rows[0].nbr > 0;
}