const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    const queryActiveNotes = new QueryCommand({
        TableName: NOTES_TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
            ":pk": "PK",
            ":prefix": ACTIVE_NOTES_PREFIX
        }
    })

    try {
        const { Items } = await db.send(queryActiveNotes);
        return sendResponse(200, Items);
    } catch (err) {
        console.error(err);
        return sendResponse(400, {message: "Could not get notes from query."})
    }
}