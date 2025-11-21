const { sendResponse } = require("../../utils/responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { createNewNote } = require("../../utils/services/postNoteService");
const { checkBodyFormat, parseBody } = require("../../utils/services/helpers");

const postNote = async (event, context) => {
    let body;

    try {
        body = parseBody(event.body);
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Could not parse body: ", error: err.message});
    }

    let title, category, textContent;
    try {
        const filteredBody = checkBodyFormat(body);
        title = filteredBody.title;
        category = filteredBody.category;
        textContent = filteredBody.textContent;
    } catch (err) {
        console.error(err);
        return sendResponse(400, {message: err.message});
    };

    const result = await createNewNote(title, category, textContent);

    if(!result) return sendResponse(400, {success: false, message: "Could not store new note to database."});

    return sendResponse(200, result);
}


exports.handler = middy(postNote).use(validateToken);