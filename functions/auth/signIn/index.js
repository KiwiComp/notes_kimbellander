const { sendResponse } = require("../../../utils/responses");
const { signIn } = require("../../../utils/services/authService");
const { validateAuthBodyFormat } = require("../../../utils/services/helpers");


exports.handler = async (event) => {
    let username, password;

    try {
        const body = JSON.parse(event.body);
        ({username, password} = validateAuthBodyFormat(body, "signIn"));
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: err.message});
    };

    try {
        const result = await signIn(username, password);
        return sendResponse(200, result);
    } catch(err) {
        console.error(err);
        if(err.message === "Incorrect username or password.") return sendResponse(401, {message: err.message});
        return sendResponse(500, {message: err.message || "Internal server error."});
    };
}