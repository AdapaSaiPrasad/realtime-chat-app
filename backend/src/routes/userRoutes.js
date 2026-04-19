const express = require("express");
const router = express.Router();
const authMiddleware=require("../middleware/authMiddleware")
const { registerUser, loginUser,getUsers } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/",authMiddleware,getUsers)
module.exports = router;