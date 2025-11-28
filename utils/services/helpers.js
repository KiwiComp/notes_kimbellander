const { NOTES_TABLE, USER_PK_PREFIX } = require("./constants");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

function checkBodyFormat(body, method) {
    const allowedFields = ["title", "category", "textContent"]; 
    const filteredBody = {};

    for(const key of Object.keys(body)) {
        if(allowedFields.includes(key)) {
            filteredBody[key] = body[key]?.toString().trim();
        } else {
            throw new Error(`Field ${key} is not allowed.`);
        }
    }

    if(method === "post") {
        for(const key of allowedFields) {
            if(!filteredBody[key]) {
                throw new Error(`Field ${key} is required.`);
            };
        };
    };

    if(filteredBody.title && filteredBody.title.length > 50) {
        throw new Error("Title is too long, max 50 characters.");
    } 
    if(filteredBody.textContent && filteredBody.textContent.length > 300) {
        throw new Error("Text is too long, max 300 characters.");
    };

    return filteredBody;
}

function validateAuthBodyFormat(body, authType) {
    let allowedFields;
    if(authType === "signUp") {
        allowedFields = ["username", "password", "firstName", "lastName"];
    } else if(authType === "signIn") {
        allowedFields = ["username", "password"];
    };
    
    const filteredBody = {};

    for (const key of Object.keys(body)) {
        if(allowedFields.includes(key)) {
            filteredBody[key] = body[key]?.toString().trim();
        } else {
            throw new Error(`Field ${key} is not allowed.`);
        };
    };

    for (const key of allowedFields) {
        if(!filteredBody[key]) {
            throw new Error(`Field ${key} is required.`);
        };
    };

    return filteredBody;
}

async function getSingleNote(noteId, prefixSK, userId) {
    const PK = `${USER_PK_PREFIX}${userId}`
    const SK = `${prefixSK}${noteId}`
    const getNote = new GetCommand({
        TableName: NOTES_TABLE,
        Key: {PK: PK, SK: SK}
    });

    try {
        const result = await db.send(getNote);

        if (!result.Item) {
            throw new Error("Note not found");
        }

        return result.Item;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function getAllNotes(prefixSK, userId) {
    const PK = `${USER_PK_PREFIX}${userId}`;
    const queryAllNotes = new QueryCommand({
        TableName: NOTES_TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
            ":pk": PK,
            ":prefix": prefixSK
        }
    })

    try {
        const { Items = [] } = await db.send(queryAllNotes);
        return Items;

    } catch (err) {
        console.error(err);
        throw new Error(`Failed to fetch notes with prefix ${prefixSK}: ${err.message}`);
    }
}


async function deleteSingleNote(noteToDelete, userId) {
    const PK = `${USER_PK_PREFIX}${userId}`;
    try {
        await db.send(new DeleteCommand({
            TableName: NOTES_TABLE,
            Key: {PK: PK, SK: noteToDelete.SK}
        }));
    } catch(err) {
        throw new Error(err.message);
    };
}

async function deleteMultipleNotes(deletedNotes, userId) {
    const PK = `${USER_PK_PREFIX}${userId}`;
    let errors = [];
    for(const note of deletedNotes) {
        try {
            await db.send(new DeleteCommand({
                TableName: NOTES_TABLE,
                Key: {PK: PK, SK: note.SK}
            }));
        } catch(err) {
            errors.push({SK: note.SK, message: err.message});
        };
    };

    if (errors.length > 0) {
        const err = new Error("Some notes failed to delete");
        err.details = errors;
        throw err;
    }
}

module.exports = { checkBodyFormat, getSingleNote, getAllNotes, deleteSingleNote, deleteMultipleNotes, validateAuthBodyFormat };