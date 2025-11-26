const { sendResponse } = require("../../../utils/responses");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { ACCOUNTS_TABLE } = require("../../../utils/services/constants");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateAuthBodyFormat } = require("../../../utils/services/helpers");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);


async function getUser(username) {
    const getUserCommand = new GetCommand({
        TableName: ACCOUNTS_TABLE,
        Key: {username: username}
    });

    try {
        const fetchedUser = await db.send(getUserCommand);
        if(!fetchedUser?.Item) throw new Error("Incorrect username or password.");
        return fetchedUser.Item;
    } catch(err) {
        if(err.message === "Incorrect username or password.") throw err;
        console.error(err);
        throw new Error("Database error.");
    };
    
}

async function signIn(username, password) {
    const fetchedUser = await getUser(username);

    const correctPassword = await bcrypt.compare(password, fetchedUser.password);
    if(!correctPassword) throw new Error("Incorrect username or password.");

    const secret = process.env.TOKEN_KEY;
    if(!secret) throw new Error("JWT secret not configured");

    const token = jwt.sign(
        {userId: fetchedUser.userId, username: fetchedUser.username},
        secret,
        {expiresIn: 3600}
    );

    return {token};
}

exports.handler = async (event) => {
    let username, password;

    try {
        const body = JSON.parse(event.body);
        ({username, password} = validateAuthBodyFormat(body, "signIn"));
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: err.message});
    };

    try {
        const result = await signIn(username, password);
        return sendResponse(200, result);
    } catch(err) {
        console.error(err);
        if(err.message === "Incorrect username or password.") return sendResponse(401, {message: err.message});
        return sendResponse(500, {message: err.message || "Internal server error."});
    };
}