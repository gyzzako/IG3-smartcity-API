const OrderController = require("../../controllers/orderDB");
const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.getAllOrders);
router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.updateOrder);
router.post("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.insertOrder); //TODO: middleware créer une commande que pour lui (user) et pas les autres users ?
router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.deleteOrder);

module.exports = router;