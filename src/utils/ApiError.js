const crypto = require("crypto")
class ApiError extends Error{
    constructor(code, msg){
        super(msg)
        this.statusCode = code
    }
}

module.exports = ApiError



// const key = crypto.randomBytes(32);
// console.log(key)