const { sendResponse } = require("../../utils/responses");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, PK } = require("../../utils/services/constants");
const crypto = require("crypto");
const middy = require("@middy/core");
const { validateToken } = require("../../middleware/auth");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function createNewNote(title, category, text) {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const SK = `NOTE_ACTIVE_${id}`;

    const newNote = {
        PK: PK,
        SK: SK,
        title: title,
        category: category,
        text: text,
        createdAt: timestamp
    };

    const putNote = new PutCommand({
        TableName: NOTES_TABLE,
        Item: newNote
    });

    try {
        await db.send(putNote);
        return newNote;
    } catch (err) {
        console.error(err);
        return false;
    };
}

const postNote = async (event, context) => {
    let title, category, text;
    try {
        ({ title, category, text } = JSON.parse(event.body));
    } catch (err) {
        console.error(err);
        return sendResponse(400, {message: "Could not parse body: ", error: err.message});
    };

    const result = await createNewNote(title, category, text);

    if(!result) return sendResponse(400, {success: false, message: "Could not store new note to database."});

    return sendResponse(200, result);
}

exports.handler = middy(postNote).use(validateToken);