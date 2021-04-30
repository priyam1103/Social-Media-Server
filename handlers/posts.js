const User = require("../model/user");
const Post = require("../model/posts");
const Stories = require("../model/stories");
const AWS = require("aws-sdk");
const config = require("../service/config");
const s3 = new AWS.S3({
  accessKeyId: config.ACCESSKEY,
  secretAccessKey: config.SECRETACCESS,
  region: "us-east-2",
});
exports.addPost = async function (req, res) {
  try {
    const { caption } = req.body;
    const file = req.files;
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });

    if (!user) {
      res.status(401).json({ message: "Invalid session " });
    } else {
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
          let post = new Post({
            image: data.Location,
            caption: caption,
            ofUser: id,
          });
          await post.save();

          const update_posts = user.posts.concat(post._id);

          let user_ = await User.findOneAndUpdate(
            {
              _id: id,
            },
            {
              posts: update_posts,
            },
            { new: true }
          );

          res.status(200).json({ post, user_ });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.addStory = async function (req, res) {
  try {
    const { caption } = req.body;
    const file = req.files;
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });

    if (!user) {
      res.status(401).json({ message: "Invalid session " });
    } else {
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
          let post = new Stories({
            image: data.Location,
            caption: caption,
            ofUser: id,
            user_image: user.image,
            user_name: user.username,
          });
          await post.save();

          const update_posts = user.stories.concat(post._id);

          let user_ = await User.findOneAndUpdate(
            {
              _id: id,
            },
            {
              stories: update_posts,
            },
            { new: true }
          );

          res.status(200).json({ post, user_ });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getPosts = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(401).json({ message: "Invalid session " });
    } else {
      var posts = [];

      await user.posts.map(async (item, index) => {
        posts.push(await Post.findById(item));
        console.log(await Post.findById(item));
        if (index == user.posts.length - 1) {
          res.status(200).json({ posts, user });
        }
      });
    }
  } catch (err) {}
};

exports.getStories = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(401).json({ message: "Invalid session " });
    } else {
      var stories = [];

      if (user.stories.length > 0) {
        var s = [];
        for (var k = 0; k < user.stories.length; k++) {
          s.push(await Stories.findById(user.stories[k]));

          if (k == user.stories.length - 1) {
            stories.push({
              username: user.username,
              userimage: user.image,
              stories: s,
            });
            if (user.following.length > 0) {
              for (var i = 0; i < user.following.length; i++) {
                const cu = await User.findById(user.following[i]);

                if (cu.stories.length > 0) {
                  s = [];

                  for (var j = 0; j < cu.stories.length; j++) {
                    await s.push(await Stories.findById(cu.stories[j]));
                    if (j == cu.stories.length - 1) {
                      stories.push({
                        username: cu.username,
                        userimage: cu.image,
                        stories: s,
                      });
                      if (i == user.following.length - 1) {
                        res.status(200).json({ stories });
                      }
                    }
                  }
                } else if (i == user.following.length - 1) {
                  res.status(200).json({ stories });
                }
              }
            } else res.status(200).json({ stories });
          }
        }
      } else if (user.following.length > 0) {
        for (var i = 0; i < user.following.length; i++) {
          const cu = await User.findById(user.following[i]);

          if (cu.stories.length > 0) {
            var s = [];

            for (var j = 0; j < cu.stories.length; j++) {
              s.push(await Stories.findById(cu.stories[j]));
              if (j == cu.stories.length - 1) {
                stories.push({
                  username: cu.username,
                  userimage: cu.image,
                  stories: s,
                });
                if (i == user.following.length - 1) {
                  res.status(200).json({ stories });
                }
              }
            }
          } else if (i == user.following.length - 1) {
            res.status(200).json({ stories });
          }
        }
      } else {
        res.status(200).json({ stories });
      }

    }
  } catch (err) {}
};

exports.getWallPosts = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(401).json({ message: "Invalid session " });
    } else {
      var posts = [];
      if (user.following.length > 0) {
        for (var i = 0; i < user.following.length; i++) {
          const cu = await User.findById(user.following[i]);

          if (cu.posts.length > 0) {
            //console.log(cu.posts.length)
            for (var j = 0; j < cu.posts.length; j++) {
              await posts.push({
                post: await Post.findById(cu.posts[j]),
                postedbyusername: cu.username,
                postedbyimg: cu.image,
              });
              if (i == user.following.length - 1 && j == cu.posts.length - 1) {
                res.status(200).json({ posts });
              }
            }
          } else if (i == user.following.length - 1) {
            //console.log(cu.posts)
            res.status(200).json({ posts });
          }
        }

      } else {
        res.status(200).json({ posts });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getPostById = async function (req, res) {
  try {
    const { postid } = req.params;
    const post = await Post.findOne({ _id: postid });
    if (post) {
      const user = await User.findOne({ _id: post.ofUser });
      const post_ = {
        post,
        postedbyimg: user.image,
        postedbyusername: user.username,
      };
      res.status(200).json({ post_ });
    } else {
      res.status(400).json({ message: "Post not found" });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.likePost = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    const { postid } = req.params;
    const post__ = await Post.findById(postid);
    const likes = parseInt(post__.likes) + 1;

    const post = await Post.findOneAndUpdate(
      {
        _id: postid,
      },
      { likes: likes },
      { new: true }
    );
    const user__ = await User.findOne({ _id: post.ofUser });

    const post_ = {
      post,
      postedbyimg: user__.image,
      postedbyusername: user__.username,
    };
    const user_likedposts = user.likedposts.concat(postid);

    if (user__.username !== user.username) {
      var noti = {
        body: `${user.username} liked your post.`,
        image: user.image,
        postimage: post__.image,
        type: "likepost",
        postid: postid,
      };
      const user_notification = user__.notifications.concat(noti);
      await User.findOneAndUpdate(
        { _id: user__._id },
        { $set: { notifications: user_notification } },
        { new: true }
      );
    }
    const user_ = await User.findOneAndUpdate(
      { _id: id },
      { $set: { likedposts: user_likedposts } },
      { new: true }
    );
    console.log(user_);
    res.status(200).json({ post_, user_ });
  } catch (err) {
    console.log(err);
  }
};

exports.dislikePost = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    const { postid } = req.params;
    const post__ = await Post.findById(postid);
    const likes = parseInt(post__.likes) - 1;

    const post = await Post.findOneAndUpdate(
      {
        _id: postid,
      },
      { likes: likes },
      { new: true }
    );
    const user__ = await User.findOne({ _id: post.ofUser });
    const post_ = {
      post,
      postedbyimg: user__.image,
      postedbyusername: user__.username,
    };
    user.likedposts.splice(user.likedposts.indexOf(postid), 1);
    if (user__.username !== user.username) {
      var noti = {
        body: `${user.username} disliked your post.`,
        image: user.image,
        postimage: post__.image,
        type: "dislikepost",
        postid: postid,
      };
      const user_notification = user__.notifications.concat(noti);
      await User.findOneAndUpdate(
        { _id: user__._id },
        { $set: { notifications: user_notification } },
        { new: true }
      );
    }
    const user_ = await User.findOneAndUpdate(
      { _id: id },
      { $set: { likedposts: user.likedposts } },
      { new: true }
    );

    console.log(user_);
    res.status(200).json({ post_, user_ });
  } catch (err) {
    console.log(err);
  }
};

exports.addComment = async function (req, res) {
  try {
    const id = res.locals._id;
    const user = await User.findOne({ _id: id });
    const { postid, comment } = req.body;
    const post__ = await Post.findById(postid);
    const comment_ = {
      body: comment,
      postedbyimg: user.image,
      postedbyusername: user.username,
    };

    const post = await Post.findOneAndUpdate(
      {
        _id: postid,
      },
      { comments: post__.comments.concat(comment_) },
      { new: true }
    );
    const user__ = await User.findOne({ _id: post.ofUser });
    if (user__.username !== user.username) {
      var noti = {
        body: `${user.username} commented on your post.`,
        image: user.image,
        postimage: post__.image,
        comment_body: comment,
        type: "commentpost",
        postid: postid,
      };
      console.log(noti);
      const user_notification = user__.notifications.concat(noti);
      await User.findOneAndUpdate(
        { _id: user__._id },
        { $set: { notifications: user_notification } },
        { new: true }
      );
    }
    const post_ = {
      post,
      postedbyimg: user__.image,
      postedbyusername: user__.username,
    };
    console.log(post_);
    res.status(200).json({ post_ });
  } catch (err) {
    console.log(err);
  }
};
