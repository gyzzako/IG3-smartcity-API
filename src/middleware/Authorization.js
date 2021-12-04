/**
 *@swagger
 * components:
 *  responses:
 *      mustBeAdmin:
 *          description: This request can only be done by an administrator
 */
module.exports.mustBeAdmin = (req, res, next) =>{
    if(req.session !== undefined && req.session.authLevel === "admin"){
        next();
    }else{
        res.sendStatus(403);
    }
}

module.exports.mustBeAuthorizedUserRoute = (req, res, next) => {
    if(req.session !== undefined){
        if(req.session.authLevel === "admin"){
            next();
        }else{
            const {id: activeUserId} = req.session;
            if(req.method === "PATCH" && req.route.path === "/"){
                if(req.body?.id === undefined){
                    res.sendStatus(400);
                }else{
                    if(activeUserId === req.body.id){
                        req.body.is_admin = false;
                        next();
                    }else{
                        res.sendStatus(403);
                    }
                }
            }else if(req.method === "GET" && req.route.path === "/:id"){
                if(activeUserId === parseInt(req.params.id)){
                    next();
                }else{
                    res.sendStatus(403);
                }
            }else{
                res.sendStatus(403);
            }
        }
    }
}

module.exports.mustBeAuthorizedOrderRoute = (req, res, next) => {
    if(req.session !== undefined){
        if(req.session.authLevel === "admin"){
            next();
        }else{
            const {id: activeUserId} = req.session;
            if(req.method === "POST" && req.route.path === "/"){
                if(req.body?.user?.id === undefined){
                    res.sendStatus(400);
                }else{
                    if(activeUserId === req.body.user?.id){
                        next();
                    }else{
                        res.sendStatus(403);
                    }
                }
            }else{
                res.sendStatus(403);
            }
        }
    }
}

module.exports.mustBeAuthorizedMealRoute = (req, res, next) => {
    if(req.session !== undefined){
        if(req.session.authLevel === "admin"){
            next();
        }else{
            const {id: activeUserId} = req.session;
            if(req.method === "POST" && req.route.path === "/"){
                if(req.body?.user_fk === undefined){
                    res.sendStatus(400);
                }else{
                    if(activeUserId === req.body?.user_fk){
                        next();
                    }else{
                        res.sendStatus(403);
                    }
                }
            }else{
                res.sendStatus(403);
            }
        }
    }
}