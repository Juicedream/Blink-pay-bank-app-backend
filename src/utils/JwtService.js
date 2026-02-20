const jwt = require("jsonwebtoken");
const JWT_SECRET= "myownsecretchaiinawaooo"
class JWTService {
    static generateToken(_id){
     const token =  jwt.sign({_id}, JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: "1d"
        });
        return token
    }

    static validateToken(token){
        const data = jwt.verify(token, JWT_SECRET);
        return data
    }
}


module.exports = JWTService