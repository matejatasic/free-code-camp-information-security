const crypto = require("crypto");

const { Stock, StockLike } = require("./models.js")

class StockService {
    constructor() {
        this.hashService = new HashService();
    }

    async getDataForSingleStock(stock, like, ipAddress) {
        let stockLowerCase = stock.toLowerCase();

        const stockApiResponse = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockLowerCase}/quote`);
        const apiResponseBody = await stockApiResponse.json();

        if (apiResponseBody === "Invalid symbol") {
            return {
                "error": "invalid symbol",
                "likes": 0
            };
        }

        if (!await this.stockExists(stockLowerCase)) {
            if (!await this.addStockToDatabase(stockLowerCase)) {
                return {
                    error: "There was an error while creating the stock"
                };
            }
        }

        if (like) {
            if (!await this.likeStock(stockLowerCase, ipAddress)) {
                return {
                    error: "There was an error while liking the stock"
                };
            }
        }

        return {
            stockData: {
                stock: apiResponseBody.symbol,
                price: apiResponseBody.latestPrice,
                likes: await this.getNumberOfLikes(stockLowerCase)
            }
        };
    }

    async getDataForTwoStocks(stocks, like, ipAddress) {
        const responses = [];

        for (let stock of stocks) {
            let stockLowerCase = stock.toLowerCase();

            const stockApiResponse = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockLowerCase}/quote`);
            const apiResponseBody = await stockApiResponse.json();

            if (apiResponseBody === "Invalid symbol") {
                responses.push({
                    error: "invalid symbol",
                    likes: 0
                });

                continue;
            }

            if (!await this.stockExists(stockLowerCase)) {
                if (!await this.addStockToDatabase(stockLowerCase)) {
                    return {
                        error: "There was an error while creating the stock"
                    };
                }
            }

            if (like) {
                if (!await this.likeStock(stockLowerCase, ipAddress)) {
                    return {
                        error: "There was an error while liking the stock"
                    };
                }
            }
            
            responses.push({
                stock: apiResponseBody.symbol,
                price: apiResponseBody.latestPrice,
                likes: await this.getNumberOfLikes(stockLowerCase)
            });
        }

        const firstStock = responses[0];
        const secondStock = responses[1];
        const firstRelLikes = firstStock.likes - secondStock.likes;
        const secondRelLikes = secondStock.likes - firstStock.likes;
        
        firstStock.rel_likes = firstRelLikes;
        secondStock.rel_likes = secondRelLikes;
        delete firstStock.likes;
        delete secondStock.likes;

        return {
            stockData: [
                firstStock,
                secondStock
            ]
        }
    }

    async stockExists(name) {
        return await Stock.exists({ name })
    }

    async addStockToDatabase(name) {
        return await Stock.create(
            {
                name,
            },
        )
            .then(response => {
                return true;
            })
            .catch((error) => {
                console.error(error);

                return false;
            });
    }

    async likeStock(name, ipAddress) {
        const stockDocument = await this.getStockByName(name)
        const hashedIpAddress = this.hashService.hash(ipAddress);

        if (await this.hasUserAlreadyLikedStock(stockDocument._id, hashedIpAddress)) {
            return true;
        }

        return await StockLike.create({
            ipAddress: hashedIpAddress,
            stock: stockDocument._id
        })
            .then(response => {
                return true;
            })
            .catch(error => {
                return false;
            })
    }

    async hasUserAlreadyLikedStock(stockId, ipAddress) {
        return await StockLike.exists({ stock: stockId, ipAddress })
    }

    async getNumberOfLikes(name) {
        const stockDocument = await this.getStockByName(name)

        return await StockLike.countDocuments({
            stock: stockDocument._id
        })
    }

    async getStockByName(name) {
        return await Stock.findOne({ name });
    }
}

class HashService {
    constructor() {
        this.secretKey = process.env.HMAC_SECRET_KEY || "secret-key";
    }

    hash(text) {
        return crypto.createHmac("sha256", this.secretKey).update(text).digest("hex");
    }
}

module.exports = StockService;