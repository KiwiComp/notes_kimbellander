

function checkBodyFormat(body) {
    const allowedFields = ["title", "category", "textContent"]; 
    const filteredBody = {};

    for(const key of Object.keys(body)) {
        if(allowedFields.includes(key)) {
            filteredBody[key] = body[key];
        } else {
            throw new Error(`Field ${key} is not allowed.`);
        }
    }

    if(filteredBody.title.length > 50) {
        throw new Error("Title is too long, max 50 characters.");
    } else if(filteredBody.textContent.length > 300) {
        throw new Error("Text is too long, max 300 characters.");
    };

    return filteredBody;
}

function parseBody(body) {
    try {
        return JSON.parse(body);
    } catch (err) {
        throw new Error(err.message);
    };
}

module.exports = { checkBodyFormat, parseBody };