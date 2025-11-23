const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getAllNotes } = require("../../utils/services/helpers");
const { DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");


const getAllDeletedNotes = async () => {
    try {
        const result = await getAllNotes(DELETED_NOTES_PREFIX);
        return sendResponse(200, result);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not get deleted notes for query: ", error: err.message});
    } 
}

exports.handler = middy(getAllDeletedNotes).use(validateToken);