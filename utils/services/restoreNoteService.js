const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { ACTIVE_NOTES_PREFIX, NOTES_TABLE } = require("./constants");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function restoreSingleNote(noteToRestore) {
    const SK = `${ACTIVE_NOTES_PREFIX}${noteToRestore.id}`;
    const restoredNote = {
        ...noteToRestore,
        SK: SK
    }
    try {
        await db.send(new PutCommand({
            TableName: NOTES_TABLE,
            Item: restoredNote
        }));
        return restoredNote;
    } catch(err) {
        throw new Error(err.message);
    };
}

module.exports = { restoreSingleNote };