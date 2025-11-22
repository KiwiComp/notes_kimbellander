const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { getAllNotes, deleteMultipleNotes } = require("../../utils/services/helpers");
const { storeAllDeletedNotes } = require("../../utils/services/deleteNoteService");


const deleteAllNotes = async () => {
    let allNotes;

    try {
        allNotes = await getAllNotes(ACTIVE_NOTES_PREFIX);
    } catch(err) {
        console.error(err);
        return sendResponse(404, {message: "Could not fetch notes to delete: ", error: err.message});
    };

    try {
        await deleteMultipleNotes(allNotes);
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Some notes failed to delete: ", error: err.errors});
    }

    try {
        const deletedNotes = await storeAllDeletedNotes(allNotes);
        return sendResponse(200, {message: "Notes successfully deleted: ", deletedNotes}); 
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Some notes failed to be deleted: ", error: err.errors});
    };
}


exports.handler = middy(deleteAllNotes).use(validateToken);