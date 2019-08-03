const express = require("express");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const User = require("../../models/Users");

//@route POST /api/posts
// @desc create a  post
//@access Private

router.post(
  "/",
  [
    auth,
    [
      check("text", "Text data is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).json({ error: errors.array() });

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.messgae);
      res.status(500).send("Server Error");
    }
    res.send("Post route");
  }
);

//@route GET /api/posts
// @desc get all post
//@access Private

router.get("/", auth, async (req, res) => {
  try {
    const allPost = await Post.find().sort({ date: -1 });
    res.json(allPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route GET /api/posts/:id
// @desc get post by id
//@access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Post not found" });

    res.status(500).send("Server Error");
  }
});

//@route Delete /api/posts/
// @desc get all post
//@access Private

router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findOneAndDelete(req.params);

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //check if user own post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized to delete post" });
    }
    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Post not found" });

    res.status(500).send("Server Error");
  }
});

//@route put /api/posts/like/:id
// @desc  like a post
//@access Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // check to see if posted was liked by user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route put /api/posts/unlike/:id
// @desc  like a post
//@access Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // check to see if posted was not  liked by user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has yet been liked" });
    }

    // get like index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    // remove like index from array
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST /api/posts/comment/:id
// @desc comment on a post
//@access Private

router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text data is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).json({ error: errors.array() });

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      //add comment to a post
      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.messgae);
      res.status(500).send("Server Error");
    }
    res.send("Post route");
  }
);

//@route delete /api/posts/comment/:id/:comment_id
// @desc delete comment on a post
//@access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    //make sure comment exist
    if (!comment)
      return res.status(404).json({ msg: "Comment does not exist" });

    //check user
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "USer not authorized" });

    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
