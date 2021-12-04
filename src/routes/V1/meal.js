const mealController = require("../../controllers/mealDB");
const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

const Router = require("express-promise-router");
const router = new Router;

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    limits: {
        fileSize: 5000000 // 5Mo
    },
    storage: storage
});


router.get("/", JWTMiddleWare.identification, mealController.getAllMeals);
router.get("/count", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.getMealsCount);
router.get("/:id", JWTMiddleWare.identification, mealController.getMealById);

router.patch("/", JWTMiddleWare.identification, upload.fields([
    {name: 'image', maxCount: 1}
]), AuthorizationMiddleware.mustBeAdmin, mealController.updateMeal); //TODO: demander prof si on peut appaler méthode controller depuis middleware -> pour faire en sorte qu'un user puisse modif que ses repas à lui

router.post('/', JWTMiddleWare.identification, upload.fields([
{name: 'image', maxCount: 1}
]), AuthorizationMiddleware.mustBeAuthorizedMealRoute, mealController.insertMeal);

router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.deleteMeal);

module.exports = router;