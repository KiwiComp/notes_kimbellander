const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, USER_PK_PREFIX, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function createNewNote(title, category, textContent, userId) {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const SK = `${ACTIVE_NOTES_PREFIX}${id}`;
    const PK = `${USER_PK_PREFIX}${userId}`

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