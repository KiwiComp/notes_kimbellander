const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { ACTIVE_NOTES_PREFIX, DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { getAllNotes, deleteMultipleNotes } = require("../../utils/services/helpers");
const { storeNotesWithNewPrefixSK } = require("../../utils/services/deleteAndRestoreNoteService");


const deleteAllNotes = async () => {
    let allNotes;

    try {
        allNotes = await getAllNotes(ACTIVE_NOTES_PREFIX);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not fetch notes to delete: ", error: err.message});
    };

    try {
        await deleteMultipleNotes(allNotes);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to delete: ", errors: err.details});
    }

    try {
        const deletedNotes = await storeNotesWithNewPrefixSK(allNotes, DELETED_NOTES_PREFIX);
        return sendResponse(200, {message: "Notes successfully deleted: ", deletedNotes}); 
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Some notes failed to be deleted: ", error: err.errors});
    };
}


exports.handler = middy(deleteAllNotes).use(validateToken);