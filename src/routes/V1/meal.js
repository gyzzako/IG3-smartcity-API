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
router.get("/:id", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.getMealById);

router.patch("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, upload.fields([
    {name: 'image', maxCount: 1}
]), mealController.updateMeal);

router.post('/', JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, upload.fields([  //TODO: middleware pour qu'un user puisse poster un repas sur son compte mais pas créer un repas sur le compte d'un autre ??
    {name: 'image', maxCount: 1}
]), mealController.insertMeal);

router.delete("/", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, mealController.deleteMeal);

module.exports = router;