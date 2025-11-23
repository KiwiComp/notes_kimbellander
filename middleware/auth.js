const { sendResponse } = require("../utils/responses");
const jwt = require('jsonwebtoken');


const validateToken = {
    before: async (request) => {
        try {
            const token = request.event.headers.authorization.replace("Bearer ", "");

            if(!token) throw new Error("Could not retrieve token.");

            const secret = process.env.TOKEN_KEY;
            const data = jwt.verify(token, secret);

            request.event.auth = { userId: data.userId, username: data.username};

            // return request.response;
        } catch(err) {
            console.error(err);
            // throw new Error("Invalid or expired token.")
            return sendResponse(401, {message: "Invalid or expired token."})
        }
    },

    // Hur ska jag göra med request här?
    onError: async (request) => {
        return sendResponse(400, {message: "Middy couldn't run lambda."})
    }
}

module.exports = { validateToken };