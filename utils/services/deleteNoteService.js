const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, DELETED_NOTES_PREFIX } = require("./constants");


const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function deleteNoteCommand(noteToDelete) {
    try {
        await db.send(new DeleteCommand({
            TableName: NOTES_TABLE,
            Key: {PK: "PK", SK: noteToDelete.SK}
        }));
    } catch(err) {
        throw new Error(err.message);
    };
}

async function storeDeletedNote(noteToDelete) {
    const SK = `${DELETED_NOTES_PREFIX}${noteToDelete.id}`;
    const deletedNote = {
        ...noteToDelete,
        SK: SK
    }
    try {
        await db.send(new PutCommand({
            TableName: NOTES_TABLE,
            Item: deletedNote
        }));
        return deletedNote;
    } catch(err) {
        throw new Error(err.message);
    };
}

module.exports = { deleteNoteCommand, storeDeletedNote };