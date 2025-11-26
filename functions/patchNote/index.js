const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { buildUpdateExpression, updateNote } = require("../../utils/services/patchNoteService");
const { sendResponse } = require("../../utils/responses");
const { getSingleNote, checkBodyFormat } = require("../../utils/services/helpers");
const { ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");

const patchNote = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    const { noteId } = event.pathParameters;
    if(!noteId) return sendResponse(400, {message: "Invalid noteId in call."});

    let updateAttributes;

    try {
        const body = JSON.parse(event.body);
        updateAttributes = checkBodyFormat(body, "patch");
    } catch(err) {
        console.error(err.message);
        return sendResponse(400, {message: "Could not parse body for patch note.", error: err.message});
    };

    if(!updateAttributes || Object.keys(updateAttributes).length === 0) {
        return sendResponse(400, {message: "No attributes provided to update."});
    };

    updateAttributes.modifiedAt = new Date().toISOString();

    let fetchedNote;

    try {
        fetchedNote = await getSingleNote(noteId, ACTIVE_NOTES_PREFIX, userId);
        if(!fetchedNote) {
            return sendResponse(404, {message: `Note with id ${noteId} not found for user ${userId}`});
        };
    } catch(err) {
        return sendResponse(500, {message: "Could not get note to edit from database.", error: err.message});
    };

    const { updateExpression, expressionAttributeValues } = buildUpdateExpression(updateAttributes);

    try {
        const updatedNote = await updateNote(fetchedNote, updateExpression, expressionAttributeValues, userId);
        return sendResponse(200, {message: "Note updated successfully.", updatedNote});
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: "Could not update note.", error: err.message});
    };
}

exports.handler = middy(patchNote).use(validateToken);