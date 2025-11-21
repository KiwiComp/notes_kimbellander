const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { buildUpdateExpression, updateNote } = require("../../utils/services/patchNoteService");
const { sendResponse } = require("../../utils/responses");
const { parseBody, getSingleNote } = require("../../utils/services/helpers");
const { ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");

const patchNote = async (event, context) => {
    const { noteId } = event.pathParameters;

    let updateAttributes;

    try {
        updateAttributes = parseBody(event.body);
    } catch(err) {
        console.error(err.message);
        return sendResponse(400, {message: "Could not parse body for patch note: ", error: err.message});
    };

    updateAttributes.modifiedAt = new Date().toISOString();

    let fetchedNote;

    try {
        fetchedNote = await getSingleNote(noteId, ACTIVE_NOTES_PREFIX);
    } catch(err) {
        return sendResponse(400, {message: "Could not get note to edit from database.", error: err.message});
    };

    const { updateExpression, expressionAttributeValues } = buildUpdateExpression(updateAttributes);

    try {
        const updatedNote = await updateNote(fetchedNote, updateExpression, expressionAttributeValues);
        return sendResponse(200, {message: "Note updated successfully", updatedNote});
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Could not update note: ", error: err.message});
    };
}

exports.handler = middy(patchNote).use(validateToken);