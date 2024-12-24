const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

const StockLikeSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
    },
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
        required: true
    }
});


const Stock = mongoose.model("Stock", StockSchema);
const StockLike = mongoose.model("StockLike", StockLikeSchema);

module.exports = { Stock, StockLike }