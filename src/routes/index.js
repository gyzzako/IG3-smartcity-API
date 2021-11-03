const routerV1 = require("./V1/index");
const router = require("express").Router();


//TODO: a voir avec le prof car son tuto pour accéder à notre api depuis react ne fonctionne pas -> donc ça en attentant
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.use("/v1", routerV1);

module.exports = router; 