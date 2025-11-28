const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { ACCOUNTS_TABLE } = require("./constants");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

async function validateExistingUser(username) {
    try {
        const { Item } = await db.send(new GetCommand({
            TableName: ACCOUNTS_TABLE,
            Key: { username }
        }));

        if(Item) return true;

        return false;
    } catch (err) {
        console.error(err);
        throw new Error("Error fetching user to check existing user.")
    }
}

async function createUser(username, hashedPassword, firstName, lastName, userId) {

    if(await validateExistingUser(username)) {
        const err = new Error(`User with username ${username} already exists.`);
        err.statusCode = 400;
        throw err;
    }

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
        const createdUser = {userId: userId, username: username}
        return createdUser;
    } catch(err) {
        console.error(err);
        throw new Error("Could not create account for new user.")
    }
}

async function signUp(username, password, firstName, lastName) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const createdUser = await createUser(username, hashedPassword, firstName, lastName, userId);
    return createdUser;
}

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

module.exports = { createUser, signUp, getUser, signIn }