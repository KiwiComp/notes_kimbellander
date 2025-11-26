const { sendResponse } = require("../utils/responses");
const jwt = require('jsonwebtoken');


const validateToken = {
    before: async (request) => {
        const authHeader = request.event.headers?.authorization;
        if (!authHeader) throw new Error("Authorization header missing.");

        const token = authHeader.replace("Bearer ", "").trim();
        if(!token) throw new Error("Could not retrieve token.");

        const secret = process.env.TOKEN_KEY;
        if (!secret) throw new Error("Server misconfiguration: TOKEN_KEY not set.");

        try {
            const data = jwt.verify(token, secret);
            request.event.auth = { userId: data.userId, username: data.username};
        } catch(err) {
            console.error(err);
            throw new Error("Invalid or expired token.")
        };
    },

    onError: async (request) => {
        console.error(request.error);
        return sendResponse(401, {message: "Invalid or expired token."});
    }
};

module.exports = { validateToken };