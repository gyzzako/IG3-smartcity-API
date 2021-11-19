const routerV1 = require("./V1/index");
const router = require("express").Router();

router.use("/v1", routerV1);

module.exports = router; 