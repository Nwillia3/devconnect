const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/Users");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");

//@route GET api/profile/me
//@desc   get current user profile
//@access Private

router.get("/me", auth, async (req, res) => {
  try {
    //retrieving the user profile by the user ObjectID and grabbing name and avatar from the user model
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile)
      return res.status(400).json({ msg: "There is no profile for this user" });

    res.send(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@route  Post api/profile
//@desc   Create/ Update Profile for User
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile objects
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills)
      profileFields.skills = skills.split(",").map(skill => skill.trim());

    //build social object
    profileFields.social = {}; // initialize the object first
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (youtube) profileFields.social.youtube = youtube;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        res.json(profile);
      }
      //Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server error ");
    }
  }
);

//@route GET api/profiles
//@desc get all profiles
//@access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("users", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profiles/user/:user_id
//@desc get profile by user id
//@access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("users", ["name", "avatar"]);
    if (!profile) return res.status(404).json({ msg: "Profile not found 1" });
    return res.json(profile);
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }

    return res.status(500).send("Server Error");
  }
});

//@route  DELETE  api/profile
//@desc   Delete profile, user and post
//@access Private

router.delete("/", auth, async (req, res) => {
  try {
    //delete profile
    await Profile.findOneAndDelete({ user: req.user.id });
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ msg: "User removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//@route  Put  api/profile/experience
//@desc   update experience on profile
//@access Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From date  is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title,
      from,
      company,
      current,
      to,
      description,
      location
    } = req.body;

    const newExp = {
      title,
      from,
      company,
      current,
      to,
      description,
      location
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

//@route  DELETE   api/profile/experience/:exp_id
//@desc   delete experience on profile
//@access Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get index of experience to be removed
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//@route  Put  api/profile/education
//@desc   update education on profile
//@access Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of Study is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      school,
      from,
      degree,
      fieldofstudy,
      current,
      to,
      description
    } = req.body;

    const newEdu = {
      school,
      from,
      degree,
      fieldofstudy,
      current,
      to,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

//@route  DELETE   api/profile/education/:edu_id
//@desc   delete education on profile
//@access Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get index of educatiomn to be removed
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//@route  DELETE   api/profile/github/:username
//@desc   get user repo from github
//@access Public

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js " }
    };

    request(options, (err, response, body) => {
      if (err) console.error(err);
      if (response.statusCode !== 200)
        return res.status(404).json({ msg: "NO github user found" });

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = router;
