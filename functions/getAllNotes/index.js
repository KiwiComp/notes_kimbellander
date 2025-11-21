const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function getNotes() {
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
        return Items;
    } catch (err) {
        console.error(err);
        return false;
    }
}

const getAllNotes = async (event, context) => {
    const result = await getNotes();

    if(!result) return sendResponse(400, {message: "Could not get notes from query."});

    return sendResponse(200, result);
}

exports.handler = middy(getAllNotes).use(validateToken);