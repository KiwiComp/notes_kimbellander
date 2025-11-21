const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, ACTIVE_NOTES_PREFIX } = require("./constants");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function getNoteForPatch(noteId) {
    const SK = `${ACTIVE_NOTES_PREFIX}${noteId}`
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

function buildUpdateExpression(updateAttributes) {
    const updateExpression = "set " + Object.keys(updateAttributes)
        .map(attributeToMap => `${attributeToMap} = :${attributeToMap}`)
        .join(", ");

    const expressionAttributeValues = Object.keys(updateAttributes).reduce((accumulator, currentValue) => {
        accumulator[`:${currentValue}`] = updateAttributes[currentValue];
        return accumulator;
    }, {});

    return { updateExpression, expressionAttributeValues };
};

async function updateNote(fetchedNote, updateAttributes, updateExpression, expressionAttributeValues) {
    const updatePatchedNote = new UpdateCommand({
        TableName: NOTES_TABLE,
        Key: {
            PK: "PK", 
            SK: fetchedNote.SK
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
    });

    try {
        const result = await db.send(updatePatchedNote);
        return result.Attributes;
    } catch(err) {
        throw new Error(err.message);
    };
}

module.exports = { getNoteForPatch, buildUpdateExpression, updateNote };