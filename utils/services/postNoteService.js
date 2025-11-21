const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, PK } = require("../../utils/services/constants");
const crypto = require("crypto");

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
        createdAt: timestamp,
        modifiedAt: "",
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

function checkBodyFormat(body) {
    const allowedFields = ["title", "category", "text"]; 
    const filteredBody = {};

    for(const key of Object.keys(body)) {
        if(allowedFields.includes(key)) {
            filteredBody[key] = body[key];
        } else {
            throw new Error(`Field ${key} is not allowed.`);
        }
    }

    if(filteredBody.title.length > 50) {
        throw new Error("Title is too long, max 50 characters.");
    } else if(filteredBody.text.length > 300) {
        throw new Error("Text is too long, max 300 characters.");
    };

    return filteredBody;
}

module.exports = { createNewNote, checkBodyFormat };