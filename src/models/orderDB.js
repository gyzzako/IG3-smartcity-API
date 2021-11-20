module.exports.createOrder = async (client, userId) => {
    return await client.query(`
    INSERT INTO "order"(order_date, user_fk) VALUES (NOW(), $1)`, [userId]);
}

module.exports.updateOrder = async (client, orderId, orderDate, userId) => {
    return await client.query(`
    UPDATE "order" SET order_date = $2, user_fk = $3
    WHERE id = $1`, [orderId, orderDate, userId]);
}

module.exports.getAllOrders = async (client) => {
    return await client.query(`SELECT *, TO_CHAR(order_date::DATE, 'dd-mm-yyyy') as order_date FROM "order" ORDER BY id`);
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