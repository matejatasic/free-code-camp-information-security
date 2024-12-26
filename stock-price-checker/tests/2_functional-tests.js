const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { StockLike } = require("../models.js");

chai.use(chaiHttp);

const API_ENDPOINT = "/api/stock-prices"

suite("Functional Tests", function () {
    suite("Fetching one stock", () => {
        test(`${API_ENDPOINT} fetches data for valid stock`, (done) => {
            const query = {
                stock: "GOOG"
            }

            chai
                .request(server)
                .keepOpen()
                .get(API_ENDPOINT)
                .query(body)
                .end(function (err, response) {
                    assert.equal(response.status, 200);
                    const responseBody = response.body

                    assert.isDefined(responseBody.stockData);
                    const stockData = responseBody.stockData;

                    assert.isDefined(stockData.stock);
                    assert.isDefined(stockData.price);
                    assert.isDefined(stockData.likes);

                    done();
                });
        });

        test(`${API_ENDPOINT} fetches data for valid stock`, (done) => {
            const query = {
                stock: "GOOG",
                like: true
            }

            StockLike.deleteMany({
                name: body.stock
            })
                .then(response => {
                    chai
                        .request(server)
                        .keepOpen()
                        .get(API_ENDPOINT)
                        .query(body)
                        .end(function (err, response) {
                            assert.equal(response.status, 200);
                            const responseBody = response.body
                            
                            assert.isDefined(responseBody.stockData);
                            const stockData = responseBody.stockData;

                            assert.isDefined(stockData.stock);
                            assert.isDefined(stockData.price);
                            assert.isDefined(stockData.likes);
                            assert.equal(stockData.likes, 1);

                            done()
                        });
                })

        });

        test(`${API_ENDPOINT} fetches data for valid stock and likes it`, (done) => {
            const query = {
                stock: "GOOG",
                like: true
            }

            chai
                .request(server)
                .keepOpen()
                .get(API_ENDPOINT)
                .query(body)
                .end(function (err, response) {
                    assert.equal(response.status, 200);
                    const responseBody = response.body

                    assert.isDefined(responseBody.stockData);
                    const stockData = responseBody.stockData;

                    assert.isDefined(stockData.stock);
                    assert.isDefined(stockData.price);
                    assert.isDefined(stockData.likes);
                    assert.equal(stockData.likes, 1);

                    done()
                });
        });
    });

    suite("Fetching two stocks", () => {
        test(`${API_ENDPOINT} fetches data for two valid stocks`, (done) => {
            const query = {
                stock: ["GOOG", "MSFT", "NASDAQ"]
            }

            StockLike.deleteMany({
                name: {$in: body.stock}
            })
                .then(response => {
                    chai
                        .request(server)
                        .keepOpen()
                        .get(API_ENDPOINT)
                        .query(body)
                        .end(function (err, response) {
                            assert.equal(response.status, 200);
                            const responseBody = response.body

                            assert.isDefined(responseBody.stockData);
                            const stockData = responseBody.stockData;
                            
                            assert.lengthOf(stockData, 2);
                            
                            assert.isDefined(stockData[0].stock);
                            assert.isDefined(stockData[0].price);
                            assert.isDefined(stockData[0].rel_likes);

                            assert.isDefined(stockData[1].stock);
                            assert.isDefined(stockData[1].price);
                            assert.isDefined(stockData[1].rel_likes);

                            done()
                        });
                })
        });

        test(`${API_ENDPOINT} fetches data for two valid stocks and likes them`, (done) => {
            const query = {
                stock: ["GOOG", "MSFT", "NASDAQ"],
                like: true
            }

            StockLike.deleteMany({
                name: {$in: body.stock}
            })
                .then(response => {
                    chai
                        .request(server)
                        .keepOpen()
                        .get(API_ENDPOINT)
                        .query(body)
                        .end(function (err, response) {
                            assert.equal(response.status, 200);
                            const responseBody = response.body

                            assert.isDefined(responseBody.stockData);
                            const stockData = responseBody.stockData;
                            
                            assert.lengthOf(stockData, 2);

                            assert.isDefined(stockData[0].stock);
                            assert.isDefined(stockData[0].price);
                            assert.isDefined(stockData[0].rel_likes);
                            assert.equal(stockData[0].rel_likes, 0);

                            assert.isDefined(stockData[1].stock);
                            assert.isDefined(stockData[1].price);
                            assert.isDefined(stockData[1].rel_likes);
                            assert.equal(stockData[0].rel_likes, 0);

                            done()
                        });
                })
        });
    });
});