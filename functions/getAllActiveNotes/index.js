
const { ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getAllNotes } = require("../../utils/services/helpers");


const getAllActiveNotes = async () => {
    try {
        const result = await getAllNotes(ACTIVE_NOTES_PREFIX);
        return sendResponse(200, result);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not get active notes from query: ", error: err.message});
    } 
}

exports.handler = middy(getAllActiveNotes).use(validateToken);