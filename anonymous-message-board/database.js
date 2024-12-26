const mongoose = require("mongoose");

class Database {
    connect() {
        mongoose
            .connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then(() => {
                console.log("Database connection successful");
            })
            .catch((err) => {
                console.error("Database connection error");
            });
    }
}

module.exports = new Database();