const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, PK } = require("../../utils/services/constants");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function createNewNote(title, category, textContent) {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const SK = `NOTE_ACTIVE_${id}`;

    const newNote = {
        PK: PK,
        SK: SK,
        id: id,
        title: title,
        category: category,
        textContent: textContent,
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

module.exports = { createNewNote };