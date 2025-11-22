const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
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

async function deleteAllDeletedNotes(deletedNotes) {
    let errors = [];
    for(const note of deletedNotes) {
        try {
            await db.send(new DeleteCommand({
                TableName: NOTES_TABLE,
                Key: {PK: "PK", SK: note.SK}
            }));
        } catch(err) {
            errors.push({SK: note.SK, message: err.message});
        };
    };

    if (errors.length > 0) {
        throw {errors};
    };
}

async function restoreAllDeletedNotes(notesToRestore) {
    let errors = [];
    let restoredNotes = [];
    for(const note of notesToRestore) {

        const SK = `${ACTIVE_NOTES_PREFIX}${note.id}`;
        const item = {
            ...note,
            SK: SK
        };

        try {
            await db.send(new PutCommand({
                TableName: NOTES_TABLE,
                Item: item
            }));
            restoredNotes.push(item);
        } catch(err) {
            errors.push({SK: note.SK, message: err.message});
        };
    };

    if (errors.length > 0) {
        throw {errors};
    };

    return restoredNotes;
}

module.exports = { restoreSingleNote, deleteAllDeletedNotes, restoreAllDeletedNotes };