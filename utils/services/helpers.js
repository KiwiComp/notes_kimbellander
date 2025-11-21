const { NOTES_TABLE } = require("./constants");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

function checkBodyFormat(body) {
    const allowedFields = ["title", "category", "textContent"]; 
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
    } else if(filteredBody.textContent.length > 300) {
        throw new Error("Text is too long, max 300 characters.");
    };

    return filteredBody;
}

function parseBody(body) {
    try {
        return JSON.parse(body);
    } catch (err) {
        throw new Error(err.message);
    };
}

async function getSingleNote(noteId, prefixSK) {
    const SK = `${prefixSK}${noteId}`
    const getNote = new GetCommand({
        TableName: NOTES_TABLE,
        Key: {PK: "PK", SK: SK}
    });

    let fetchedNote;

    try {
        const result = await db.send(getNote);
        fetchedNote = result.Item;
        return fetchedNote;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function getAllNotes(prefixSK) {
    const queryAllNotes = new QueryCommand({
        TableName: NOTES_TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
            ":pk": "PK",
            ":prefix": prefixSK
        }
    })

    try {
        const { Items } = await db.send(queryAllNotes);
        return Items;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function deleteSingleNote(noteToDelete) {
    try {
        await db.send(new DeleteCommand({
            TableName: NOTES_TABLE,
            Key: {PK: "PK", SK: noteToDelete.SK}
        }));
    } catch(err) {
        throw new Error(err.message);
    };
}

module.exports = { checkBodyFormat, parseBody, getSingleNote, getAllNotes, deleteSingleNote };