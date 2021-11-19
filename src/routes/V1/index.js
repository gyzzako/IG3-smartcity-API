const userRouter = require("./user");
const mealRouter = require("./meal");
const categoryRouter = require("./category");
const orderRouter = require("./order");
const router = require("express").Router();

const AuthorizationMiddleware = require("../../middleware/Authorization");
const JWTMiddleWare = require("../../middleware/IdentificationJWT");

router.get("/backoffice-authorization", JWTMiddleWare.identification, AuthorizationMiddleware.mustBeAdmin, (req, res) => {res.sendStatus(200)})

router.use("/user", userRouter);
router.use("/meal", mealRouter);
router.use("/category", categoryRouter);
router.use("/order", orderRouter);

module.exports = router; 