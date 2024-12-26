const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;

const server = require("../server");
const ThreadService = require("../services.js");

chai.use(chaiHttp);

const THREAD_API_ENDPOINT_EXAMPLE = "/api/threads/:board";
const THREAD_API_ENDPOINT = "/api/threads/"
const BOARD = "general";
const THREAD_TEXT = "A text for testing purposes";
const THREAD_DELETE_PASSWORD = "password";
let threadWithReplyId = undefined;

const REPLY_API_ENDPOINT_EXAMPLE = "/api/replies/:board";
const REPLY_API_ENDPOINT = "/api/replies/";
const REPLY_TEXT = "This is a test comment";
const REPLY_DELETE_PASSWORD = "replyPassword";

const threadService = new ThreadService();

suite("Functional Tests", function () {
    suite("Thread Tests", () => {
        test(`POST request to ${THREAD_API_ENDPOINT_EXAMPLE} creates a thread`, (done) => {
            const body = {
                board: BOARD,
                text: THREAD_TEXT,
                delete_password: THREAD_DELETE_PASSWORD
            };

            chai
                .request(server)
                .post(`${THREAD_API_ENDPOINT}${BOARD}`)
                .send(body)
                .end(function (err, response) {
                    assert.equal(response.status, 200);

                    threadService.getThread(body.board, body.text)
                        .then(document => {
                            assert.isDefined(document);

                            done();
                        });

                });
        });

        test(`GET request to ${THREAD_API_ENDPOINT_EXAMPLE} fetches threads`, (done) => {
            const query = {
                board: BOARD
            };

            chai
                .request(server)
                .get(`${THREAD_API_ENDPOINT}${BOARD}`)
                .query(query)
                .end(function (err, response) {
                    assert.equal(response.status, 200);
                    const responseBody = response.body;

                    assert.isBelow(responseBody.length, 11);
                    const firstThread = responseBody[0];

                    assert.isDefined(firstThread._id);
                    assert.isDefined(firstThread.text);
                    assert.isDefined(firstThread.replies);

                    responseBody.forEach(thread => {
                        assert.isBelow(thread.replies.length, 4);
                    })

                    done();
                });
        });

        test(`DELETE request to ${THREAD_API_ENDPOINT_EXAMPLE} with an incorrect password fails`, (done) => {
            const body = {
                board: BOARD,
                delete_password: "password123"
            }

            threadService.getThread(body.board, THREAD_TEXT)
                .then(response => {
                    body.thread_id = response._id;

                    chai
                        .request(server)
                        .delete(`${THREAD_API_ENDPOINT}${BOARD}`)
                        .send(body)
                        .end(function (err, response) {
                            assert.equal(response.status, 200);
                            assert.equal(response.text, "incorrect password");

                            done();
                        });
                });

        });

        test(`DELETE request to ${THREAD_API_ENDPOINT_EXAMPLE} with an correct password succeeds`, (done) => {
            const body = {
                board: BOARD,
                delete_password: THREAD_DELETE_PASSWORD
            }

            threadService.getThread(body.board, THREAD_TEXT)
                .then(response => {
                    body.thread_id = response._id;

                    chai
                        .request(server)
                        .delete(`${THREAD_API_ENDPOINT}${BOARD}`)
                        .send(body)
                        .end(function (err, response) {
                            assert.equal(response.status, 200);
                            assert.equal(response.text, "success");

                            done();
                        });
                });

        });

        test(`PUT request to ${THREAD_API_ENDPOINT_EXAMPLE} with a valid thread id successfully reports the thread`, (done) => {
            const body = {
                board: BOARD,
            }

            
            threadService.create(body.board, THREAD_TEXT, THREAD_DELETE_PASSWORD)
            .then(thread => {
                body.thread_id = thread._id;
    
                chai
                    .request(server)
                    .put(`${THREAD_API_ENDPOINT}${BOARD}`)
                    .send(body)
                    .end(function (err, response) {
                        assert.equal(response.status, 200);
                        assert.equal(response.text, "reported");
    
                        done();
                    });
            });
        });
    });

    suite("Reply Tests", () => {
        test(`POST request to ${REPLY_API_ENDPOINT_EXAMPLE} creates a reply`, (done) => {
            const body = {
                board: BOARD,
                text: REPLY_TEXT,
                delete_password: REPLY_DELETE_PASSWORD
            };

            threadService.getThread(body.board, THREAD_TEXT)
            .then(thread => {
                body.thread_id = thread._id;
                threadWithReplyId = thread._id;

                chai
                    .request(server)
                    .post(`${REPLY_API_ENDPOINT}${BOARD}`)
                    .send(body)
                    .end(function (err, response) {
                        assert.equal(response.status, 200);
    
                        done();
                    });
            });
        });

        test(`GET request to ${REPLY_API_ENDPOINT_EXAMPLE} fetches a thread with replies`, (done) => {
            threadService.getThread(BOARD, THREAD_TEXT)
            .then(thread => {
                const query = {
                    thread_id: thread._id.toString()
                };

                chai
                    .request(server)
                    .get(`${REPLY_API_ENDPOINT}${BOARD}`)
                    .query(query)
                    .end(function (err, response) {
                        assert.equal(response.status, 200);
                        const responseBody = response.body;

                        const firstThread = responseBody;
    
                        assert.isDefined(firstThread._id);
                        assert.isDefined(firstThread.text);
                        assert.isDefined(firstThread.replies);
    
                        done();
                    });
            })

        });

        test(`PUT request to ${REPLY_API_ENDPOINT_EXAMPLE} with a valid thread and reply id successfully reports the reply`, (done) => {
            const body = {
                board: BOARD,
            }

            
            threadService.getThreadById(threadWithReplyId)
            .then(thread => {
                body.thread_id = thread._id;
                body.reply_id = thread.replies[0]._id;
    
                chai
                    .request(server)
                    .put(`${REPLY_API_ENDPOINT}${BOARD}`)
                    .send(body)
                    .end(function (err, response) {
                        assert.equal(response.status, 200);
                        assert.equal(response.text, "reported");
    
                        done();
                    });
            });
        });

        test(`DELETE request to ${REPLY_API_ENDPOINT_EXAMPLE} with an incorrect password fails`, (done) => {
            const body = {
                board: BOARD,
                thread_id: threadWithReplyId,
                delete_password: "password123"
            }

            threadService.getThreadById(threadWithReplyId)
            .then(thread => {
                body.reply_id = thread.replies[0]._id.toString();
    
                chai
                    .request(server)
                    .delete(`${REPLY_API_ENDPOINT}${BOARD}`)
                    .send(body)
                    .end(function (err, response) {
                        assert.equal(response.status, 200);
                        assert.equal(response.text, "incorrect password");
    
                        done();
                    });
            });
        });

        test(`DELETE request to ${REPLY_API_ENDPOINT_EXAMPLE} with an correct password succeeds`, (done) => {
            const body = {
                board: BOARD,
                thread_id: threadWithReplyId,
                delete_password: REPLY_DELETE_PASSWORD
            }

            threadService.getThreadById(threadWithReplyId)
            .then(thread => {
                body.reply_id = thread.replies[0]._id.toString();
    
                chai
                    .request(server)
                    .delete(`${REPLY_API_ENDPOINT}${BOARD}`)
                    .send(body)
                    .end(function (err, response) {
                        assert.equal(response.status, 200);
                        assert.equal(response.text, "success");
    
                        done();
                    });
            });
        });
    });
});