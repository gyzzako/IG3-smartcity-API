const userRouter = require("./user");
const mealRouter = require("./meal");
const categoryRouter = require("./category");
const orderRouter = require("./order");
const router = require("express").Router();

router.use("/V1/user", userRouter);
router.use("/V1/meal", mealRouter);
router.use("/V1/category", categoryRouter);
router.use("/V1/order", orderRouter);

module.exports = router; 