const { logIn } = require("./auth.controller");
const { closeDatabase } = require("../database");

(async () => {
	try {
		await logIn("FyfMCnIC", "rohan2060");
	} finally {
		await closeDatabase();
	}
})();