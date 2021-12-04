const UserController = require("../../controllers/userDB");
const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

router.get("/backoffice-authorization", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, (req, res) => {res.sendStatus(200)}) //autorisation pour accéder au backoffice

router.get("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.getAllUsers);
router.get("/count", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.getUsersCount);
router.get("/:id", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAuthorizedUserRoute, UserController.getUserById);

router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAuthorizedUserRoute, UserController.updateUser);

router.post("/", UserController.insertUser);
router.post("/login", UserController.login);

router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, UserController.deleteUser);

module.exports = router;