const router = require("express").Router();


const { logIn, register } = require("./auth.controller");

router.post("/login", async (request, response) => {
    const { userId, password } = request.body;
    if (!userId || !password) {
        return response.status(400).send({
            success: false,
            message: "UserId and password both should be provided"})
    }
    const token = await logIn(userId, password);
    if (token) {
        return response.status(200).send({ success: true, token });
    }
    return response.status(401).send({ 
        success: false, 
        message: "User credentials are invalid!"
    });
});

router.post("/register", async (request, response) => {
    const { userId, password, firstName, middleName, lastName, gender, dateOfBirth } = request.body;
    if (!userId || !password || !firstName || !lastName || !gender || !dateOfBirth) {
        return response.status(400).send({
            success: false,
            message: "All fields should be provided."
        });
    }
    const userDetails = await register({ userId, password, firstName, middleName, lastName, gender, dateOfBirth });
    if (userDetails) {
        return response.status(200).send({ success: true, userDetails });
    }
    return response.status(500).send({ 
        success: false, 
        message: "Error occured while creating new user!"
    });
});


module.exports = router;