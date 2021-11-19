const UserController = require("../../controllers/userDB");
const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.getAllUsers);

router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.updateUser); //TODO: middleware pour qu'un user ne puisse update que son user ?

router.post("/", UserController.insertUser);
router.post("/login", UserController.login);

router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.deleteUser);

module.exports = router;