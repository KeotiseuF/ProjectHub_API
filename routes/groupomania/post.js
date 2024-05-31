const express = require("express");
const postCtrl = require("../../controllers/groupomania/post");
const auth = require("../../middlewares/groupomania/auth");
const multer = require("../../middlewares/multer-config");

const router = express.Router();

router.post("/", auth, multer, postCtrl.newPost);
router.put("/:id", auth, multer, postCtrl.modifyPost);
router.delete("/:id", auth, postCtrl.deletePost);
router.get("/:id", auth, postCtrl.getOnePost);
router.get("/", auth, postCtrl.getAllPosts);
router.post("/:id/like", auth, postCtrl.likePost);

module.exports = router;
