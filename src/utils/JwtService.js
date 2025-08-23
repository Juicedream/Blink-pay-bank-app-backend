const jwt = require("jsonwebtoken");
const JWT_SECRET= "myownsecretchaiinawaooo"
class JWTService {
    static generateToken(user){
     const token =  jwt.sign({user}, JWT_SECRET, {
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