const OrderController = require("../controllers/orderDB");
const AuthorizationMiddleware = require("../middleware/Authorization");
const JWTMiddleWare = require("../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.getAllOrders);
router.get("/count", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.getOrdersCount);
router.get("/:id", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.getOrderById); //TODO: demander prof si on peut appaler méthode controller depuis middleware -> pour faire en sorte qu'un user puisse get que ses comamndes à lui

router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.updateOrder);

router.post("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAuthorizedOrderRoute, OrderController.insertOrder);

router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, OrderController.deleteOrder);

module.exports = router;