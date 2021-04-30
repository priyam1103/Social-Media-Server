const User = require("../model/user");
const AWS = require("aws-sdk");
const Post = require("../model/posts");

const Username = require("../model/username");
const config = require("../service/config");
const s3 = new AWS.S3({
  accessKeyId: config.ACCESSKEY,
  secretAccessKey: config.SECRETACCESS,
  region: "us-east-2",
});
const s3link = "https://duskygram.s3.us-east-2.amazonaws.com/";
exports.updateUser = async function (req, res) {
  try {
    const { name, username, website, bio, emailId, mobileNo } = req.body;
    console.log(req.body);
    const file = req.files;
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });

    if (!user) {
      res.status(401).json({ message: "Invalid session " });
    } else {
      if (file) {
        var params = {
          Bucket: "duskygram",
          Key: id + "-" + Math.random().toFixed(2) * 10000000,
          Body: file.file.data,
          ContentType: file.file.mimetype,
          ACL: "public-read",
        };
        s3.upload(params, async function (err, data) {
          if (err) {
            console.log(err);
          } else {
            await Username.findOneAndUpdate(
              {
                username: user.username,
              },
              { username: username, name: name, image: data.Location }
            );

            let user_ = await User.findOneAndUpdate(
              { _id: id },
              {
                name,
                username,
                website,
                bio,
                emailId,
                mobileNo,
                image: data.Location,
              },
              { new: true }
            );

            res.status(200).json({ user_ });
          }
        });
      } else {
        if (username !== user.username) {
          await Username.findOneAndUpdate(
            {
              username: user.username,
            },
            { username: username, name: name }
          );
        }
        let user_ = await User.findOneAndUpdate(
          { _id: id },
          {
            name,
            username,
            website,
            bio,
            emailId,
            mobileNo,
          },
          { new: true }
        );

        res.status(200).json({ user_ });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getUsers = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    const { uname } = req.params;
    console.log(uname);
    const users = await Username.find();
    const user_data = await users.filter(
      (index) => index.username !== user.username
    );
    //index.name.toLowerCase().includes(uname.toLowerCase())
    if (uname.trim().length > 3) {
      const fdata = user_data.filter(
        (index) =>
          index.username.toLowerCase().includes(uname.toLowerCase()) 
      );
      res.status(200).json({ fdata });
    } else res.status(400).json({ message: "No users found." });
  } catch (err) {
  console.log(err)
    res.status(400).json({ message: "Error" });
  }
};

exports.getProfile = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    const { uname } = req.params;
    const current_user = await User.findOne({ username: uname });
    let myprofile = false;
    let following_this_user;

    if (current_user) {
      if (user.username === uname) {
        myprofile = true;
      } else {
        if (user.following.indexOf(current_user._id) != -1) {
          following_this_user = true;
        } else {
          following_this_user = false;
        }
      }
      var posts = [];

      if (current_user.posts.length > 0) {
        await current_user.posts.map(async (item, index) => {
          posts.push(await Post.findById(item));
          console.log(index, user.posts.length);
          if (index == current_user.posts.length - 1) {
            console.log(posts);
            res.status(200).json({
              current_user_profile: current_user,
              following_this_user: following_this_user,
              posts: posts,
              myprofile: myprofile,
            });
          }
        });
      } else {
        res.status(200).json({
          current_user_profile: current_user,
          following_this_user: following_this_user,
          posts: posts,
          myprofile: myprofile,
        });
      }
    } else {
      res.status(200).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Error" });
  }
};

exports.followunfollow = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    const { query, u_id } = req.body;
    console.log(req.body);
    const secondary_user = await User.findOne({ _id: u_id });
    let update_followers;
    let update_following;
    let user_;
    if (secondary_user) {
      if (query === "follow") {
        update_following = user.following.concat(secondary_user._id);
        update_followers = secondary_user.followers.concat(user._id);
       
        user_ = await User.findOneAndUpdate(
          {
            _id: id,
          },
          {
            following: update_following,
          },
          { new: true }
        );
        var noti = {
          body: `${user_.username} started following you.`,
          image: user_.image,
          type: 'follow',
        }
        const user_notification = secondary_user.notifications.concat(noti)
        await User.findOneAndUpdate(
          { _id: u_id },
          { followers: update_followers,notifications:user_notification }
        );
        
        
  
        res.status(200).json({ user_ });
      } else if (query === "unfollow") {
        user.following.splice(user.following.indexOf(secondary_user._id), 1);
        secondary_user.followers.splice(
          secondary_user.followers.indexOf(user._id),
          1
        );
        console.log(user.following);
        user_ = await User.findOneAndUpdate(
          {
            _id: id,
          },
          {
            following: user.following,
          },
          { new: true }
        );
        await User.findOneAndUpdate(
          { _id: u_id },
          { followers: secondary_user.followers }
        );
        res.status(200).json({ user_ });
      }
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error" });
  }
};

