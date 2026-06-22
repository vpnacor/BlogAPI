const jwt = require('jsonwebtoken')
require('dotenv').config();


module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        username: user.username,
        email: user.email
    }

    return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};

module.exports.verify = (req, res, next) => {


    let token = req.headers.authorization;


    if (typeof token === "undefined"){

        return res.status(403).send({auth: "Failed. No Token."}) 


    } else {
    
        token = token.slice(7);
       
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
          
                if (err) {
                    return res.status(401).send({
                        auth: "Failed",
                        message: err.message
                    })
                    
                } else {
            
                req.user = decodedToken;
                    
                  
                    next();


                        
                }
        })
    }
}


module.exports.verifyAdmin = (req, res, next) => {
    if (req.user?.isAdmin) {
        next();
    } else {
        return res.status(403).json({
            auth: "Failed",
            message: "Action Forbidden"
        });
    }
};


module.exports.errorHandler = (err, req, res, next) => {

    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: 'Failed in Find',
        details: err
    })
}