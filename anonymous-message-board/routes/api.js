"use strict";

const ThreadService = require("../services.js");

const threadService = new ThreadService();

module.exports = function (app) {
    app.route("/api/threads/:board")
        .get(async (request, response) => {
            const { board } = request.params;

            return response.send(await threadService.getThreads(board));
        })
        .post(async (request, response) => {
            const { board } = request.params;
            const { text, delete_password } = request.body;

            try {
                await threadService.create(board, text, delete_password);
            }
            catch (error) {
                console.error(error);
                return response.send("There was an error while creating the thread");
            }

            return response.redirect(`/b/${board}`);
        })
        .put(async (request, response) => {
            const { board } = request.params;
            const { thread_id } = request.body;

            try {
                await threadService.report(board, thread_id);
            }
            catch (error) {
                console.error(error);
                return response.send("There was an error while reporting the thread");
            }

            return response.send("reported");
        })
        .delete(async (request, response) => {
            const { board } = request.params;
            const { thread_id, delete_password } = request.body;

            try {
                if (!await threadService.delete(board, thread_id, delete_password)) {
                    return response.send("incorrect password");
                }
            }
            catch (error) {
                console.error(error)
                return response.send("There was an error while deleting the thread");
            }

            return response.send("success");
        });

    app.route("/api/replies/:board")
        .get(async (request, response) => {
            const { board } = request.params;
            const { thread_id } = request.query;

            return response.send(await threadService.getThreadById(thread_id));
        })
        .post(async (request, response) => {
            const { board } = request.params;
            const { text, thread_id, delete_password } = request.body;

            try {
                await threadService.createReply(board, text, thread_id, delete_password);
            }
            catch(error) {
                console.error(error);
                return response.send("There was an error while creating the reply");
            }

            return response.redirect(`/b/${board}/${thread_id}`);
        })
        .put(async (request, response) => {
            const { board } = request.params;
            const { reply_id, thread_id } = request.body;

            try {
                await threadService.reportReply(board, thread_id, reply_id);
            }
            catch (error) {
                console.error(error);
                return response.send("There was an error while reporting the reply");
            }

            return response.send("reported");
        })
        .delete(async (request, response) => {
            const { board } = request.params;
            const { thread_id, reply_id, delete_password } = request.body;

            try {
                if (!await threadService.deleteReply(board, thread_id, reply_id, delete_password)) {
                    return response.send("incorrect password");
                }
            }
            catch (error) {
                console.error(error)
                return response.send("There was an error while deleting the reply");
            }

            return response.send("success");
        });

};