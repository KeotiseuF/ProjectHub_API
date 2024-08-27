const fs = require("fs");
const Post = require("../../models/groupomania/Post");
const User = require("../../models/groupomania/User");

exports.newPost = (req, res) => {
  const postObject = JSON.parse(req.body.post);
  delete postObject._id;
  delete postObject._userId;
  const post = new Post({
    ...postObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  post.save()
  .then(() => res.status(201).json({ message: "Post enregistré" }))
  .catch((error) => res.status(400).json({ error }));
};

exports.modifyPost = (req, res) => {
  const postObject = req.file ? {
    ...JSON.parse(req.body.post),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  } :
  { ...req.body };

  delete postObject._userId;

  User.findOne({ _id: req.auth.userId })
  .then((user) => {
    Post.findOne({ _id: req.params.id })
    .then((post) => {
      if(post.userId != req.auth.userId && user.role != "admin") throw new Error("User can't modify this post.");

      Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
      .then(() => {
        if(!postObject.imageUrl) return res.status(201).json({message: "Détails post remplacés !"});
        
        const filename = post.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => res.status(201).json({message: "Détails post et/ou image remplacés !"}));
      })
      .catch((error) => res.status(401).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
  })
  .catch((err) => res.status(400).json(err));
};

exports.deletePost = (req, res) => {
  User.findOne({ _id: req.auth.userId })
  .then((user) => {
    Post.findOne({ _id: req.params.id })
    .then((post) => {
      if(post.userId != req.auth.userId && user.role != "admin") throw new Error("User can't delete this post.");

      const filename = post.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Post.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Post supprimé !" }))
        .catch((error) => res.status(401).json({ error }));
      });
    })
    .catch((error) => res.status(400).json({ error }));
  })
  .catch((err) => res.status(400).json(err));
};

exports.getOnePost = (req, res) => {
  Post.findOne({ _id: req.params.id })
  .then((post) => res.status(200).json(post))
  .catch((error) => res.status(404).json({ error }));
};

exports.getAllPosts = (req, res) => {
  Post.find()
  .then((posts) => res.status(200).json(posts))
  .catch((error) => res.status(400).json({ error }));
};

exports.likePost = (req, res) => {
  if(req.body.like === 1) {
  delete req.body._userId;

  Post.findOne({ _id: req.params.id })
  .then((post) => {
    const userLiked = post.usersLiked.find((user) => user == req.auth.userId);
    const userDisliked = post.usersDisliked.find((user) => user == req.auth.userId);
    
    if(userLiked && userDisliked) throw new Error("User can't like and dislike the same post.");

    const like = {
      $addToSet: { usersLiked: req.auth.userId },
      $inc: { likes: req.body.like },
    };
    Post.updateOne({ _id: req.params.id }, like)
    .then(() => res.status(201).json("Like post"))
    .catch((error) => res.status(401).json({ error }));
  })
  .catch((error) => res.status(400).json({ error }));

  } else if(req.body.like === -1) {
    delete req.body._userId;
    Post.findOne({ _id: req.params.id })
    .then((post) => {
      const userDisliked = post.usersDisliked.find((user) => user == req.auth.userId);
      const userLiked = post.usersLiked.find((user) => user == req.auth.userId);

      if(userDisliked && userLiked) throw new Error("User can't like and dislike the same post.");

      const dislike = {
        $addToSet: { usersDisliked: req.auth.userId },
        $inc: { dislikes: 1 },
      };
      Post.updateOne({ _id: req.params.id }, dislike)
      .then(() => res.status(201).json("Dislike post"))
      .catch((error) => res.status(401).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));

  } else {
    delete req.body._userId;
    Post.findOne({ _id: req.params.id })
    .then((post) => {
      const idDislikes = post.usersDisliked.find((id) => id == req.auth.userId);
      const idLikes = post.usersLiked.find((id) => id == req.auth.userId);

      if(idDislikes) {
        const dislike = {
          $pull: { usersDisliked: req.auth.userId },
          $inc: { dislikes: -1 },
        };
        Post.updateOne({ _id: req.params.id }, dislike)
        .then(() => res.status(201).json("Dislike enlevé"))
        .catch((error) => res.status(401).json({ error }));

      } else if(idLikes) {
        const like = {
          $pull: { usersLiked: req.auth.userId },
          $inc: { likes: -1 },
        };
        Post.updateOne({ _id: req.params.id }, like)
        .then(() => res.status(201).json("Like enlevé"))
        .catch((error) => res.status(401).json({ error }));

      } else {
        throw new Error("Error like/dislike post");
      }
    })
    .catch((error) => res.status(400).json({ error }));
  }
};