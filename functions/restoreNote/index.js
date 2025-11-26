const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { sendResponse } = require("../../utils/responses");
const { getSingleNote, deleteSingleNote } = require("../../utils/services/helpers");
const { DELETED_NOTES_PREFIX, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { storeNoteWithNewPrefixSK } = require("../../utils/services/deleteAndRestoreNoteService");


const restoreNote = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    const {noteId} = event.pathParameters;
    if(!noteId) return sendResponse(400, {message: "Invalid noteId in call."});

    let noteToRestore;
    try {
        noteToRestore = await getSingleNote(noteId, DELETED_NOTES_PREFIX, userId);
        if(!noteToRestore) {
            return sendResponse(404, {message: `Note with id ${noteId} not found for user ${userId}`});
        };
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: err.message});
    };

    try {
        await deleteSingleNote(noteToRestore, userId);
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not delete note.", error: err.message});
    };

    try {
        const restoredNote = await storeNoteWithNewPrefixSK(noteToRestore, ACTIVE_NOTES_PREFIX);
        return sendResponse(200, {message: "Deleted note successfully restored.", restoredNote: restoredNote});
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not restore note.", error: err.message});
    };

}

exports.handler = middy(restoreNote).use(validateToken);