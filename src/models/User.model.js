const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const schema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lower: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    acc_type: {
        type: String,
        required: true,
        enum: ["savings", "current"],
        defualt: "savings"
    }
}, {timestamps: true})

schema.pre("save", async function(next) {
    const user = this;
    if(user.isModified("password")){
        this.password = await bcryptjs.hash(user.password, 10);
    }
    next()
})

const model = mongoose.model("user", schema);

exports.UserModel = model