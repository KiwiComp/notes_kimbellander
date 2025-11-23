
const { ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getAllNotes } = require("../../utils/services/helpers");


const getAllActiveNotes = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    try {
        const result = await getAllNotes(ACTIVE_NOTES_PREFIX, userId);
        return sendResponse(200, result);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not get active notes from query: ", error: err.message});
    } 
}

exports.handler = middy(getAllActiveNotes).use(validateToken);