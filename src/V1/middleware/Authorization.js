/**
 *@swagger
 * components:
 *  responses:
 *      mustBeAdmin:
 *          description: This request can only be done by an administrator
 *      mustBeAuthorizedOnRoute:
 *          description: This request can only be done by an administrator or an authorized user
 */
module.exports.mustBeAdmin = (req, res, next) =>{
    if(req.session !== undefined && req.session.authLevel === "admin"){
        next();
    }else{
        res.sendStatus(403);
    }
}

/*vérifie que c'est soit 
                    un admin,
                    un utilisateur qui modifie sont "profil",
                    un utilisateur qui récupère son profil
*/
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


/*vérifie que c'est soit 
                    un administrateur,
                    ou que l'utilisateur qui fait une commande, la réalise bien pour lui et pas pour un autre user
*/
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
                    if(activeUserId === req.body.user.id){
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

/*vérifie que c'est soit 
                    un administrateur,
                    ou que l'utilisateur qui créé un repas, le créé bien pour lui et pas pour un autre user
*/
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
                    if(activeUserId === req.body.user_fk){
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