const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE } = require("./constants");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

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

async function updateNote(fetchedNote, updateExpression, expressionAttributeValues) {
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

module.exports = { buildUpdateExpression, updateNote };