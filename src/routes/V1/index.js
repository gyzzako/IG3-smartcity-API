const userRouter = require("./user");
const mealRouter = require("./meal");
const categoryRouter = require("./category");
const orderRouter = require("./order");
const router = require("express").Router();

router.use("/user", userRouter);
router.use("/meal", mealRouter);
router.use("/category", categoryRouter);
router.use("/order", orderRouter);

module.exports = router; 