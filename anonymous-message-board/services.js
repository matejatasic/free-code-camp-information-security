const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const Thread = require("./models.js");

class ThreadService {
    constructor() {
        this.hashService = new HashService();
    }

    async create(board, text, deletePassword) {
        const hashedDeletePassword = this.hashService.hash(deletePassword);

        const result = await Thread.create({
            board,
            text,
            delete_password: hashedDeletePassword,
            created_on: new Date(),
            bumped_on: new Date()
        });

        return result;
    }

    async getThreads(board) {
        const threads = await Thread.aggregate([
            { $match: { board } },
            { $sort: { bumped_on: -1 } },
            { $limit: 10 },
            {
                $project: {
                    text: 1,
                    created_on: 1,
                    bumped_on: 1,
                    replies: {
                        $slice: [
                            {
                                $map: {
                                    input: { $reverseArray: "$replies" },
                                    as: "reply",
                                    in: {
                                        _id: "$$reply._id",
                                        text: "$$reply.text",
                                        created_on: "$$reply.created_on"
                                    }
                                }
                            },
                            3
                        ]
                    }
                }
            }
        ]);
        
        return threads;
    }

    async getThread(board, text) {
        return await Thread.findOne({
            board,
            text
        })
    }

    async getThreadById(id) {
        return await Thread.findOne(
            {
                _id: id
            },
            {
                delete_password: 0,
                reported: 0,
                "replies.delete_password": 0,
                "replies.reported": 0
            }
        );
    }

    async report(board, threadId) {
        return await Thread.updateOne({
            board,
            _id: threadId
        }, {
            reported: true
        });
    }

    async delete(board, threadId, deletePassword) {
        const thread = await Thread.findOne({
            board,
            _id: threadId
        }).select("delete_password").exec();
        
        if (!this.hashService.compare(deletePassword, thread.delete_password)) {
            return false;
        }

        return await Thread.deleteOne({
            board,
            _id: threadId
        });
    }

    async createReply(board, text, threadId, delete_password) {
        const reply = {
            _id: new mongoose.Types.ObjectId(),
            text,
            delete_password: this.hashService.hash(delete_password),
            created_on : new Date(),
            reported   : false
        }
        
        const result = await Thread.updateOne(
            { _id: threadId },
            {
                $push: { replies: reply },
                $set: { bumped_on: reply.created_on }
            }
        )
        
        return result

    }

    async deleteReply(board, threadId, replyId, deletePassword) {        
        threadId = new mongoose.Types.ObjectId(threadId);
        replyId = new mongoose.Types.ObjectId(replyId);

        const thread = await Thread.findOne(
            { _id: threadId, "replies._id": replyId },
            { "replies.$": 1 }
        );
        const reply = thread.replies[0];

        if (!this.hashService.compare(deletePassword, reply.delete_password)) {
            return false;
        }

        return await Thread.updateOne(
            { _id: threadId, "replies._id": replyId },
            {
                $set: { "replies.$.text": "[deleted]" }
            }
        );
    }

    async reportReply(board, threadId, replyId) {
        return await Thread.updateOne(
            {
                _id: threadId,
                "replies._id": replyId
            },
            {
                $set: { "replies.$.reported": true }
            }
        );
    }
}

class HashService {
    salt = 12;

    hash(text) {
        return bcrypt.hashSync(text, this.salt);
    }

    compare(text, hash) {
        return bcrypt.compareSync(text, hash);
    }
}

module.exports = ThreadService;