const { sendResponse } = require("../utils/responses");
const jwt = require('jsonwebtoken');


const validateToken = {
    before: async (request) => {
        try {
            const token = request.event.headers.authorization.replace("Bearer ", "");

            if(!token) throw new Error("Could not retrieve token.");

            const secret = process.env.TOKEN_KEY;
            const data = jwt.verify(token, secret);

            request.event.id = data.id;
            request.event.username = data.username;

            return request.response;
        } catch(err) {
            console.error(err);
            return sendResponse(401, {message: "Invalid or expired token."})
        }
    },

    onError: async (request) => {
        // Om lambdan går fel.
        return sendResponse(400, {message: "Middy couldn't run lambda."})
    }
}

module.exports = { validateToken };