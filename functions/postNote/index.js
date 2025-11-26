const { sendResponse } = require("../../utils/responses");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");
const { createNewNote } = require("../../utils/services/postNoteService");
const { checkBodyFormat } = require("../../utils/services/helpers");

const postNote = async (event) => {
    const userId = event?.auth?.userId; 
    if(!userId) return sendResponse(401, {message: "No authenticated user found."});

    let title, category, textContent;
    try {
        const body = JSON.parse(event.body);
        const filteredBody = checkBodyFormat(body, "post");
        title = filteredBody.title;
        category = filteredBody.category;
        textContent = filteredBody.textContent;
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Could not parse body.", error: err.message});
    }

    try {
        const createdNote = await createNewNote(title, category, textContent, userId);
        if(!createdNote) {
            return sendResponse(500, {message: "Could not store new note to database."});
        };
        return sendResponse(200, {message: `Successfully created new note for user ${userId}.`, createdNote: createdNote});
    } catch(err) {
        console.error(err);
        return sendResponse(500, {message: `Database error while creating note for user ${userId}.`, error: err.message});
    };
}


exports.handler = middy(postNote).use(validateToken);