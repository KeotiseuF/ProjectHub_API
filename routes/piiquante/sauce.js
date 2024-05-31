const express = require("express");
const sauceCtrl = require("../../controllers/piiquante/sauce");
const auth = require("../../middlewares/piiquante/auth");
const multer = require("../../middlewares/multer-config");

const router = express.Router();

router.post("/", auth, multer, sauceCtrl.newSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.get("/", auth, sauceCtrl.getAllSauces);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;