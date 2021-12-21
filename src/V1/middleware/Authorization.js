const jwt = require('jsonwebtoken');

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

/* check si c'est un admin qui veut créer un utilisateur en admin */
module.exports.mustBeAuthorizedToCreateUser = (req, res, next) => {
    if(req.body.is_admin){
        const headerAuth = req.get('authorization');
        if(headerAuth !== undefined && headerAuth.includes("Bearer")){
            const jwtToken =  headerAuth.split(' ')[1];
            try{
                const decodedJwtToken = jwt.verify(jwtToken, process.env.SECRET_TOKEN);
                if(decodedJwtToken.value.status === "admin"){
                    req.session = decodedJwtToken.value;
                    req.session.authLevel = decodedJwtToken.value.status;
                    next();
                }else{
                    res.sendStatus(403);
                }
            }
            catch (e) {
                if(e.expiredAt !== undefined){
                    res.status(400).json({error: "jwt token expiré"});
                }else{
                    console.error(e);
                    res.sendStatus(400);
                }
            }
        } else {
            res.sendStatus(401);
        }
    }else{
        next();
    }
}

/* Check si un user voulant modifier un user est soit admin soit modifie son profil */
module.exports.mustBeAuthorizedToUpdateUser = (req, res, next) => {
    const userIdInBody = isNaN(req.body?.id) || req.body.id === "" ? undefined : parseInt(req.body.id);
    if(userIdInBody !== undefined){
        if(req.session !== undefined){
            if(req.session.authLevel === "admin"){
                next();
            }else{
                const {id: activeUserId} = req.session;
                if(activeUserId === userIdInBody){
                    req.body.is_admin = false; // pour ne pas qu'un client puisse se changer en admin
                    next();
                }else{
                    res.sendStatus(403);
                }
            }
        }else{
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(400);
    }
}

/* Check si un user veut récupérer son profil est soit lui même soit un admin */
module.exports.mustBeAuthorizedToGetUser = (req, res, next) => {
    const userIdInParams = isNaN(req.params.id) ? undefined : parseInt(req.params.id);
    if(userIdInParams !== undefined){
        if (req.session !== undefined && (req.session.id === userIdInParams || req.session.authLevel === "admin")) {
            next();
        } else {
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(400);
    }
}

/* Check si c'est un admin ou si un user créé bien une commande pour lui */
module.exports.mustBeAuthorizedToCreateOrder = (req, res, next) => {
    const userIdInBody = isNaN(req.body?.user?.id) || req.body.user.id === "" ? undefined : parseInt(req.body.user.id);
    if(userIdInBody !== undefined){
        if (req.session !== undefined && (req.session.id === userIdInBody || req.session.authLevel === "admin")) {
            next();
        } else {
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(400);
    }
}


/* Check si c'est un admin ou si un user créé bien un repas pour lui */
module.exports.mustBeAuthorizedToCreateMeal = (req, res, next) => {
    const userIdInBody = isNaN(req.body?.user_fk) || req.body.user_fk === "" ? undefined : parseInt(req.body.user_fk);
    if(userIdInBody !== undefined){
        if (req.session !== undefined && (req.session.id === userIdInBody || req.session.authLevel === "admin")) {
            next();
        } else {
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(400);
    }
}



