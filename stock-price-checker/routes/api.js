"use strict";

const StockService = require("../services.js");

const stockService = new StockService();

module.exports = function (app) {

    app.route("/api/stock-prices")
        .get(async function (request, response) {
            const { stock, like } = request.query;

            if (typeof stock === "string") {
                return response.send(await stockService.getDataForSingleStock(stock, like, request.ip));
            }

            return response.send(await stockService.getDataForTwoStocks(stock, like, request.ip));
        });

};