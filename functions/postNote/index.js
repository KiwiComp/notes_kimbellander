const { sendResponse } = require("../../utils/responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { createNewNote } = require("../../utils/services/postNoteService");
const { checkBodyFormat } = require("../../utils/services/helpers");

const postNote = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    let body;

    try {
        body = JSON.parse(event.body);
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

    const result = await createNewNote(title, category, textContent, userId);

    if(!result) return sendResponse(400, {success: false, message: "Could not store new note to database."});

    return sendResponse(200, result);
}


exports.handler = middy(postNote).use(validateToken);