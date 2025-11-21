const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getAllNotes } = require("../../utils/services/helpers");
const { DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");


const getAllDeletedNotes = async (event) => {
    const result = await getAllNotes(DELETED_NOTES_PREFIX);

    if(!result) return sendResponse(404, {message: "Could not get deleted notes for query."});

    return sendResponse(200, result);
}

exports.handler = middy(getAllDeletedNotes).use(validateToken);