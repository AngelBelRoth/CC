const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//Post Routes - simplified for now

router.get('/favorites', ensureAuth, postsController.getFavorites);

router.get("/:id", ensureAuth, postsController.getPost);

router.post("/createPost", upload.single("file"), postsController.createPost);

router.post("/updatePost/:id", upload.single("file"), postsController.updatePost);

router.post("/search", postsController.search);

router.put("/likePost/:id", postsController.likePost);

router.delete("/deletePost/:id", postsController.deletePost);

// router.put("/favoritePost/:id", postsController.favoritePost);

// router.get('/post/:id/is-favorited', postsController.isFavorited);

router.post("/:id/toggle-favorite", postsController.toggleFavorite);

router.post("/:id/review", ensureAuth, postsController.addReview);

router.delete("/:postId/review/:reviewId", ensureAuth, postsController.deleteReview);

module.exports = router;
