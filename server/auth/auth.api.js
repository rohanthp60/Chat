const router = require("express").Router();


const { logIn } = require("./auth.controller");

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


module.exports = router;