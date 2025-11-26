const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getAllNotes } = require("../../utils/services/helpers");
const { DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");


const getAllDeletedNotes = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    try {
        const deletedNotes = await getAllNotes(DELETED_NOTES_PREFIX, userId);
        if (!Array.isArray(deletedNotes)) throw new Error("Invalid response from getAllNotes()");
        if(deletedNotes.length === 0) {
            return sendResponse(200, {message: `No deleted notes found for user ${userId}. Nothing to fetch.`, notes: []})
        }
        return sendResponse(200, {notes: deletedNotes});
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not get deleted notes for query: ", error: err.message});
    } 
}

exports.handler = middy(getAllDeletedNotes).use(validateToken);