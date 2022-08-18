const express = require("express");
const router = express.Router();

const appController = require("../controllers/app");

router.get("/", appController.getMain);

router.post("/add-item", appController.postAddItem);

router.post("/add-list", appController.postAddList);

router.post("/delete-item", appController.postDeleteItem);

router.post("/delete-list", appController.postDeleteList);

router.post("/login", appController.postLogIn);

router.post("/logout", appController.postLogout);

router.post("/signup", appController.postSignUp);

router.get("/:list", appController.getList);

module.exports = router;
