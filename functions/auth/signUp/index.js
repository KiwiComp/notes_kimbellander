const { sendResponse } = require("../../../utils/responses");
const { signUp } = require("../../../utils/services/authService");
const { validateAuthBodyFormat } = require("../../../utils/services/helpers");


exports.handler = async (event) => {
    let body;
    let username, password, firstName, lastName;

    try {
        body = JSON.parse(event.body);
        ({ username, password, firstName, lastName} = validateAuthBodyFormat(body, "signUp"));
    } catch (err) {
        console.error(err);
        return sendResponse(400, {message: err.message});
    };

    try {
        const createdUser = await signUp(username, password, firstName, lastName);
        return sendResponse(200, {message: "Successfully signed up new user.", user: createdUser});
    } catch (err) {
        console.error(err);
        const status = err.statusCode || 500;
        return sendResponse(status, {message: "Failed to create user.", error: err.message});
    };
}