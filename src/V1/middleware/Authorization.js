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