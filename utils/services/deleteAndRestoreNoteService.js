const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE } = require("./constants");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function storeNoteWithNewPrefixSK(noteToStore, prefixSK) {
    const SK = `${prefixSK}${noteToStore.id}`;
    const savedNote = {
        ...noteToStore,
        SK: SK
    }
    try {
        await db.send(new PutCommand({
            TableName: NOTES_TABLE,
            Item: savedNote
        }));
        return savedNote;
    } catch(err) {
        throw new Error(err.message);
    };
}

async function storeNotesWithNewPrefixSK(notesToStore, prefixSK) {
    let errors = [];
    let savedNotes = [];
    for(const note of notesToStore) {

        const SK = `${prefixSK}${note.id}`;
        const item = {
            ...note,
            SK: SK
        };

        try {
            await db.send(new PutCommand({
                TableName: NOTES_TABLE,
                Item: item
            }));
            savedNotes.push(item);
        } catch(err) {
            errors.push({SK: note.SK, message: err.message});
        };
    };

    if (errors.length > 0) {
        throw {errors};
    };

    return savedNotes;
}

module.exports = { storeNoteWithNewPrefixSK, storeNotesWithNewPrefixSK };