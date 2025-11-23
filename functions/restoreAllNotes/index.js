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
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not fetch all deleted notes: ", error: err.message});
    };

    try {
        await deleteMultipleNotes(allNotes, userId);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to delete: ", errors: err.details});
    }

    try {
        const restoredNotes = await storeNotesWithNewPrefixSK(allNotes, ACTIVE_NOTES_PREFIX);
        return sendResponse(200, {message: "Deleted notes successfully restored: ", restoredNotes}); 
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to be restored: ", error: err.errors});
    };
}

exports.handler = middy(restoreAllNotes).use(validateToken);