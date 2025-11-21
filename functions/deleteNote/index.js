const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getActiveNote } = require("../../utils/services/helpers");
const { sendResponse } = require("../../utils/responses");
const { deleteNoteCommand, storeDeletedNote } = require("../../utils/services/deleteNoteService");


const deleteNote = async (event, context) => {
    const { noteId } = event.pathParameters;

    let noteToDelete;
    try {
        noteToDelete = await getActiveNote(noteId);
    } catch(err) {
        console.error(err);
        return sendResponse(404, {message: "Could not find the requested note to delete: ", error: err.message});
    }

    try {
        await deleteNoteCommand(noteToDelete);
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Could not delete the requested note: ", error: err.message});
    };

    try {
        const deletedNote = await storeDeletedNote(noteToDelete);
        return sendResponse(200, {message: "Note has been successfully deleted and stored as deleted.", deletedNote});
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Deleted note failed to be stored: ", error: err.message});
    };
    
}

exports.handler = middy(deleteNote).use(validateToken);