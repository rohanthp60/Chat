const router = require('express').Router();
const { Users } = require('../database');

router.get('/', async (req, res) => {
    const userId = req?.userId;
    if (!userId) {
        return res.status(401).send({ success: false, message: "User ID missing" });
    }

    try {
        const user = await Users.findOne({
            where: { userId },
            attributes: ['userId', 'firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth']
        });

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        return res.status(200).send({ success: true, user: user.dataValues });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

module.exports = router;