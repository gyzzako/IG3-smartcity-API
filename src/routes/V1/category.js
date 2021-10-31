const categoryController = require("../../controllers/categoryDB");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", categoryController.getAllCategories);
router.patch("/", categoryController.updateCategory);
router.post("/", categoryController.insertCategory);
router.delete("/", categoryController.deleteCategory);

module.exports = router;