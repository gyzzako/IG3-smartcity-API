const mealController = require("../../controllers/mealDB");
const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;


router.get("/", JWTMiddleWare.identification, mealController.getAllMeals);
router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.updateMeal);
router.post("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.insertMeal); //TODO: middleware pour qu'un user puisse poster un repas sur son compte mais pas créer un repas sur le compte d'un autre ??
router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.deleteMeal);

module.exports = router;