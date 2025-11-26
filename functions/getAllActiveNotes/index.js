
const { ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getAllNotes } = require("../../utils/services/helpers");


const getAllActiveNotes = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    try {
        const activeNotes = await getAllNotes(ACTIVE_NOTES_PREFIX, userId);
        if (!Array.isArray(activeNotes)) throw new Error("Invalid response from getAllNotes()");
        if(activeNotes.length === 0) {
            return sendResponse(200, {message: `No active notes found for user ${userId}. Nothing to fetch.`, notes: []})
        }
        return sendResponse(200, {notes: activeNotes});
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not get active notes from query.", error: err.message});
    } 
}

exports.handler = middy(getAllActiveNotes).use(validateToken);