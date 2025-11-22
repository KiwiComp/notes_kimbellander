
const { NOTES_TABLE, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getAllNotes } = require("../../utils/services/helpers");


const getAllActiveNotes = async () => {
    const result = await getAllNotes(ACTIVE_NOTES_PREFIX);

    if(!result) return sendResponse(400, {message: "Could not get active notes from query."});

    return sendResponse(200, result);
}

exports.handler = middy(getAllActiveNotes).use(validateToken);