// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { NOTES_TABLE, ACTIVE_NOTES_PREFIX } = require("../../utils/services/constants");
const { sendResponse } = require("../../utils/responses");
const { validateToken } = require("../../middleware/auth");
const middy = require("@middy/core");
const { getAllNotes } = require("../../utils/services/helpers");

// const client = new DynamoDBClient({});
// const db = DynamoDBDocumentClient.from(client);

// async function getActiveNotes() {
//     const queryActiveNotes = new QueryCommand({
//         TableName: NOTES_TABLE,
//         KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
//         ExpressionAttributeValues: {
//             ":pk": "PK",
//             ":prefix": ACTIVE_NOTES_PREFIX
//         }
//     })

//     try {
//         const { Items } = await db.send(queryActiveNotes);
//         return Items;
//     } catch (err) {
//         console.error(err);
//         return false;
//     }
// }

const getAllActiveNotes = async (event, context) => {
    // const result = await getActiveNotes();
    const result = await getAllNotes(ACTIVE_NOTES_PREFIX);

    if(!result) return sendResponse(400, {message: "Could not get active notes from query."});

    return sendResponse(200, result);
}

exports.handler = middy(getAllActiveNotes).use(validateToken);