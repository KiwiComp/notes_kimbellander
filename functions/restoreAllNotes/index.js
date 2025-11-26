const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getAllNotes, deleteMultipleNotes } = require("../../utils/services/helpers");
const { DELETED_NOTES_PREFIX, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { storeNotesWithNewPrefixSK } = require("../../utils/services/deleteAndRestoreNoteService");


const restoreAllNotes = async (event) => {
    const userId = event?.auth?.userId;
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    let allNotes;

    try {
        allNotes = await getAllNotes(DELETED_NOTES_PREFIX, userId);
        if (!Array.isArray(allNotes)) throw new Error("Invalid response from getAllNotes()");
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not fetch all deleted notes.", error: err.message});
    };

    if(allNotes.length === 0) {
        return sendResponse(200, {message: `No deleted notes found for user ${userId}. Nothing to restore.`})
    }

    try {
        await deleteMultipleNotes(allNotes, userId);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to delete.", errors: err.details || err.message || err});
    }

    try {
        const restoredNotes = await storeNotesWithNewPrefixSK(allNotes, ACTIVE_NOTES_PREFIX);
        return sendResponse(200, {message: `Deleted notes successfully restored for user ${userId}`, notes: restoredNotes}); 
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to be restored.", error: err.errors || err.message || err});
    };
}

exports.handler = middy(restoreAllNotes).use(validateToken);