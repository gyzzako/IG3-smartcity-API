const mealController = require("../../controllers/mealDB");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", mealController.getAllMeals);
router.patch("/", mealController.updateMeal);
router.post("/", mealController.insertMeal);
router.delete("/", mealController.deleteMeal);

module.exports = router;