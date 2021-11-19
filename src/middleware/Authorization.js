module.exports.mustBeAdmin = (req, res, next) =>{
    if(req.session !== undefined && req.session.authLevel === "admin"){
        next();
    }else{
        res.sendStatus(403);
    }
}