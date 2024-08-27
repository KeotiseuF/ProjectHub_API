const Sauce = require("../../models/piiquante/Sauce");
const fs = require("fs");

exports.newSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  sauce.save()
  .then(() => res.status(201).json({message: "Sauce enregistrée"}))
  .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res) => {
  const sauceObject = req.file ? { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    if(sauce.userId != req.auth.userId) throw new Error("User can't modify this sauce.");

    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
    .then(() =>  {
      if(!sauceObject.imageUrl) return res.status(201).json({message: "Détails sauce remplacés !"});
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => res.status(201).json({message : "Détails sauce et/ou image remplacés !"}));
    })
    .catch(error => res.status(401).json({ error }));
  })
  .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => {
    if(sauce.userId != req.auth.userId) throw new Error("User can't delete this sauce.");

    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id})
      .then(() => res.status(200).json({message : 'Sauce supprimé !'}))
      .catch(error => res.status(401).json({ error }));
    })
  })
  .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({error}));
};

exports.getAllSauces = (req, res) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}));
};

exports.likeSauce = (req, res) => {
  if(req.body.like === 1) {
    delete req.body._userId;
    Sauce.findOne({_id: req.params.id})
    .then(() => {
      const like = {
        $addToSet: {usersLiked: req.auth.userId},
        $inc: {likes: req.body.like}, 
      };

      Sauce.updateOne({ _id: req.params.id}, like)
      .then(() => res.status(201).json("Like sauce"))
      .catch(error => res.status(401).json({ error }));   
    })
    .catch((error) => res.status(400).json({ error }));

  } else if(req.body.like === -1) {
    delete req.body._userId;
    Sauce.findOne({_id: req.params.id})
    .then(() => {            
      const dislike = { 
        $addToSet: {usersDisliked: req.auth.userId},
        $inc: {dislikes: 1},
      };
      Sauce.updateOne({ _id: req.params.id}, dislike)
      .then(() => res.status(201).json("Dislike sauce"))
      .catch(error => res.status(401).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));

  } else {
    delete req.body._userId;
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      const idDislikes = sauce.usersDisliked.find(id => id == req.auth.userId);
  
      if(idDislikes) {
        const dislike = { 
          $pull: {usersDisliked: req.auth.userId},
          $inc: {dislikes: -1},
        };

        Sauce.updateOne({ _id: req.params.id}, dislike)
        .then(() => res.status(201).json("Dislike enlevé"))
        .catch(error => res.status(401).json({ error }));

      } else {
        const like = { 
          $pull: {usersLiked: req.auth.userId},
          $inc: {likes: -1},
        };

        Sauce.updateOne({ _id: req.params.id}, like)
        .then(() => res.status(201).json("Like enlevé"))
        .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
  };
};