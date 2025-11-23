const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getSingleNote, deleteSingleNote } = require("../../utils/services/helpers");
const { sendResponse } = require("../../utils/responses");
const { ACTIVE_NOTES_PREFIX, DELETED_NOTES_PREFIX } = require("../../utils/services/constants");
const { storeNoteWithNewPrefixSK } = require("../../utils/services/deleteAndRestoreNoteService");


const deleteNote = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    const { noteId } = event.pathParameters;
    if(!noteId) return sendResponse(500, {message: "Invalid noteId in call."});

    let noteToDelete;
    try {
        noteToDelete = await getSingleNote(noteId, ACTIVE_NOTES_PREFIX, userId);
    } catch(err) {
        console.error(err);
        return sendResponse(404, {message: "Could not find the requested note to delete: ", error: err.message});
    }

    try {
        await deleteSingleNote(noteToDelete, userId);
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Could not delete the requested note: ", error: err.message});
    };

    try {
        const deletedNote = await storeNoteWithNewPrefixSK(noteToDelete, DELETED_NOTES_PREFIX);
        return sendResponse(200, {message: "Note has been successfully deleted and stored as deleted.", deletedNote});
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Deleted note failed to be stored: ", error: err.message});
    };
    
}

exports.handler = middy(deleteNote).use(validateToken);