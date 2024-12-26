const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema(
    {
        board: {
            type: String,
            require: true,
            index: true
        },
        text: {
            type: String,
            required: true,
        },
        created_on: {
            type: Date
        },
        bumped_on: {
            type: Date
        },
        delete_password: {
            type: String,
            required: true
        },
        replies: {
            type: Array,
            default: []
        },
        reported: {
            type: Boolean,
            default: false
        }
    }
);

const Thread = mongoose.model("Thread", ThreadSchema);

module.exports = Thread