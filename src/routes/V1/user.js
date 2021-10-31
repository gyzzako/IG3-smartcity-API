const userController = require("../../controllers/userDB");

const Router = require("express-promise-router");
const router = new Router;

router.get("/", userController.getAllUsers);
router.patch("/", userController.updateUser);
router.post("/", userController.insertUser);
router.delete("/", userController.deleteUser);

module.exports = router;