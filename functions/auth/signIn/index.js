const { sendResponse } = require("../../../utils/responses");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { ACCOUNTS_TABLE } = require("../../../utils/services/constants");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);


async function getUser(username) {
    const getUserCommand = new GetCommand({
        TableName: ACCOUNTS_TABLE,
        Key: {username: username}
    });

    try {
        const fetchedUser = await db.send(getUserCommand);

        if(fetchedUser?.Item) {
            return fetchedUser.Item;
        } else {
            return false;
        }
    } catch(err) {
        console.error(err);
        return false;
    }
    
}

async function signUp(username, password) {
    const fetchedUser = await getUser(username);

    if(!fetchedUser) return {success: false, message: "Incorrect username or password."}

    const correctPassword = await bcrypt.compare(password, fetchedUser.password);

    if(!correctPassword) return {success: false, message: "Incorrect username or password."};

    const secret = process.env.TOKEN_KEY;
    const token = jwt.sign(
        {id: fetchedUser.id, username: fetchedUser.username},
        secret,
        {expiresIn: 3600}
    );

    return {success: true, token: token};
}

exports.handler = async (event, context) => {
    let username, password;

    try {
        ({username, password} = JSON.parse(event.body));
    } catch(err) {
        console.error(err);
        return sendResponse(400, {message: "Could not parse body for sign up"});
    };

    const result = await signUp(username, password);

    if(result.success) return sendResponse(200, result);
    if(!result.success) return sendResponse(400, result);
}