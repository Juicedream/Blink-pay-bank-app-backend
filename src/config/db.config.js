const mongoose = require("mongoose");

exports.ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`The Blink-pay-db is up and connected to: ${mongoose.connection.host}`);
        
    } catch (error) {
        mongoose.disconnect();
        process.exit(1)
    }
}