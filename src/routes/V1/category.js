const categoryController = require("../../controllers/categoryDB");
const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", categoryController.getAllCategories);
router.get("/count", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.getCategoryCount);
router.get("/:id", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.getCategoryById);

router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.updateCategory);

router.post("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.insertCategory);

router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, categoryController.deleteCategory);

module.exports = router;