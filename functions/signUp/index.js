const { sendResponse } = require("../../utils/responses");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { ACCOUNTS_TABLE } = require("../../utils/services/constants");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);


async function createUser(username, hashedPassword, firstName, lastName, userId) {
    const newUser = {
        userId: userId,
        username: username,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName
    };

    const putNewUser = new PutCommand({
        TableName: ACCOUNTS_TABLE,
        Item: newUser
    });

    try {
        await db.send(putNewUser);
        return {success: true, createdUser: {userId: userId, username: username}};
    } catch(err) {
        console.error(err);
        return {success: false, message: "Could not create account for new user."}
    }
}

async function signUp(username, password, firstName, lastName) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const result = await createUser(username, hashedPassword, firstName, lastName, userId);

    return result;
}

exports.handler = async (event, context) => {
    let username, password, firstName, lastName;

    try {
        ({ username, password, firstName, lastName} = JSON.parse(event.body));
    } catch (err) {
        console.error(err);
        return sendResponse(400, {message: "Could not parse body for signup."})
    }

    const result = await signUp(username, password, firstName, lastName);

    if(result.success) return sendResponse(200, result);
    if(!result.success) return sendResponse(400, result);
}
