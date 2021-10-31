const orderController = require("../../controllers/orderDB");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", orderController.getAllOrders);
router.patch("/", orderController.updateOrder);
router.post("/", orderController.insertOrder);
router.delete("/", orderController.deleteOrder);

module.exports = router;