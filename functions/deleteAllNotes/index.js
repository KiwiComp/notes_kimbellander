const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { ACTIVE_NOTES_PREFIX, DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { getAllNotes, deleteMultipleNotes } = require("../../utils/services/helpers");
const { storeNotesWithNewPrefixSK } = require("../../utils/services/deleteAndRestoreNoteService");


const deleteAllNotes = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    let allNotes;

    try {
        allNotes = await getAllNotes(ACTIVE_NOTES_PREFIX, userId);
        if (!Array.isArray(allNotes)) throw new Error("Invalid response from getAllNotes()");
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not fetch notes to delete: ", error: err.message});
    };

    if(allNotes.length === 0) {
        return sendResponse(200, {message: `No active notes found for user ${userId}. Nothing to delete.`})
    }

    try {
        await deleteMultipleNotes(allNotes, userId);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to delete: ", errors: err.details || err.message || err});
    }

    try {
        const deletedNotes = await storeNotesWithNewPrefixSK(allNotes, DELETED_NOTES_PREFIX);
        return sendResponse(200, {message: `Notes successfully deleted for user ${userId}.`, notes: deletedNotes}); 
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to be deleted: ", error: err.errors || err.message || err});
    };
}


exports.handler = middy(deleteAllNotes).use(validateToken);