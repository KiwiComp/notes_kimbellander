const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, DELETED_NOTES_PREFIX } = require("./constants");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

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

async function storeAllDeletedNotes(notesToStore) {
    let errors = [];
    let deletedNotes = [];
    for(const note of notesToStore) {

        const SK = `${DELETED_NOTES_PREFIX}${note.id}`;
        const item = {
            ...note,
            SK: SK
        };

        try {
            await db.send(new PutCommand({
                TableName: NOTES_TABLE,
                Item: item
            }));
            deletedNotes.push(item);
        } catch(err) {
            errors.push({SK: note.SK, message: err.message});
        };
    };

    if (errors.length > 0) {
        throw {errors};
    };

    return deletedNotes;
}

module.exports = { storeDeletedNote, storeAllDeletedNotes };