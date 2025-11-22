const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { getAllNotes } = require("../../utils/services/helpers");
const { DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { deleteAllDeletedNotes, restoreAllDeletedNotes } = require("../../utils/services/restoreNoteService");


const restoreAllNotes = async (event) => {
    let allNotes;

    try {
        allNotes = await getAllNotes(DELETED_NOTES_PREFIX);
    } catch(err) {
        console.error(err);
        return sendResponse(404, {message: "Could not fetch all deleted notes: ", error: err.message});
    };

    try {
        await deleteAllDeletedNotes(allNotes);
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Some notes failed to delete: ", error: err.errors});
    }

    try {
        const restoredNotes = await restoreAllDeletedNotes(allNotes);
        return sendResponse(200, {message: "Deleted notes successfully restored: ", restoredNotes}); 
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Some notes failed to be restored: ", error: err.errors});
    };
}

exports.handler = middy(restoreAllNotes).use(validateToken);