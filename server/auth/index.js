const { Router: router } = require("express");

const { logIn } = require("./controller");

router.post("/login", async (request, response) => {
    const { userId, password } = request.body;
    const token = await logIn(userId, password);
    if (token) {
        return response.status(200).send({ success: true, token });
    }
    return response.status(400).send({ 
        success: false, 
        message: "User credentials are invalid!"
    });
});

module.exports = router;