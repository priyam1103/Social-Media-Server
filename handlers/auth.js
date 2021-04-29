const User = require("../model/user");
const Username = require("../model/username");
const bcrypt = require("bcrypt");
const config = require("../service/config");
const { SMTPClient } = require("emailjs");
const client = new SMTPClient({
  user: "priyampoddar89@gmail.com",
  password: "Dusky@7035",
  host: "smtp.gmail.com",
  ssl: true,
});
// client.send(
//   {
//     text: `You otp is `,
//     from: "Duskygram",
//     to: "priyampoddar89@gmail.com",
//     subject: "testing emailjs",
//   },
//   (err, message) => {
//     console.log(err || message);
//   }
// );
exports.me = async function (req, res) {
  try {
    const id = res.locals._id;
    const user_ = await User.findOne({ _id: id });
    if (!user_) {
      res.status(401).json({ message: "Invalid session " });
    } else {
      const token = await user_.generateAuthToken();
      console.log(user_);
      res.status(200).json({ token, user_ });
    }
  } catch (err) {}
};
exports.signUp = async function (req, res) {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({
      $or: [{ emailId: emailId }],
    });
    if (user)
      res.status(401).json({
        type: "emailId",
        message: "Email id already exists.",
      });
    else {
      let hashedpass = await bcrypt.hash(password, 10);
      var username = emailId.split("@")[0];
      const checkuser = await User.findOne({ username: username });
      if (checkuser) {
        username = username + Math.random().toFixed(2) * 100;
      }
      const user_ = new User({
        emailId: emailId,
        password: hashedpass,
        username: username,
      });
      await user_.save();
      const username_ = new Username({
        username: username,
      });
      await username_.save();
      client.send(
        {
          text: `You otp is ${user_.verification.otp}`,
          from: "Duskygram",
          to: user_.emailId,
          subject: "testing emailjs",
        },
        (err, message) => {
          res
            .status(200)
            .json({ token: null, user_, message: "Sign Up Successfull" });
          console.log(err || message);
        }
      );
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again later" });
  }
};

exports.SignIn = async function (req, res) {
  try {
    const { emailId, password } = req.body;
    const user_ = await User.findOne({ emailId: emailId.trim() });
    if (user_) {
      let valid = await bcrypt.compare(password, user_.password);
      if (valid) {
        if (user_.verified) {
          const token = await user_.generateAuthToken();
          res.status(200).json({ token, user_, message: "User logged in" });
        } else {
          client.send(
            {
              text: `You otp is ${user_.verification.otp}`,
              from: "Duskygram",
              to: user_.emailId,
              subject: "testing emailjs",
            },
            (err, message) => {
              console.log(err || message);
            }
          );

          res.status(200).json({
            token: null,
            user_,
            message: "Please verify your account",
          });
        }
      } else {
        res.status(401).json({ type: "password", message: "Invalid password" });
      }
    } else {
      res
        .status(401)
        .json({ type: "emailId", message: "Email Id does not exists" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again later" });
  }
};

exports.verifyUser = async function (req, res) {
  try {
    const { otp, emailId } = req.body;
    const user_ = await User.findOne({ emailId: emailId });
    if (user_) {
      if (user_.verified) {
        res.status(401).json({ message: "User already verified" });
        return;
      }
      if (user_.verification.otp == otp) {
        user_.verified = true;
        user_.verification = {};
        await user_.save();
        const token = await user_.generateAuthToken();
        res.status(200).json({ token, user_, message: "User verified" });
      } else {
        res.status(401).json({ message: "Invalid otp" });
        return;
      }
    } else {
      res.status(400).json({ message: "User does not exists" });
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again later" });
  }
};

exports.ResetPassToken = async function (req, res) {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (user) {
      const resetToken = await user.generateResetPasswordToken();
      client.send(
        {
          text: `http://localhost:3000/auth/reset-password/${resetToken}`,
          from: "Duskygram",
          to: user.emailId,
          subject: "testing emailjs",
        },
        (err, message) => {
          console.log(err || message);
        }
      );
      console.log(user);
      res.status(200).json({ message: "Reset link sent" });
    } else {
      res
        .status(401)
        .json({ type: "emailId", message: "Email id does not exists" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.ResetTokenVerify = async function (req, res) {
  try {
    const resetToken = req.params.resetToken;
    const user = await User.findOne({ "resetPassword.token": resetToken });

    if (user) {
      if (Date.now() > user.resetPassword.expiresIn) {
        res.status(400).json({ message: "Reset Link Expired" });
        user.resetPassword = {};
        await user.save();
      } else {
        res.status(200).json({ status: true, user_emailid: user.emailId });
      }
    } else {
      res.status(401).json({ message: "Invalid Link" });
    }
  } catch (err) {}
};

exports.ResetPass = async function (req, res) {
  try {
    const { resetToken, password } = req.body;
    const user = await User.findOne({ "resetPassword.token": resetToken });
    if (user) {
      if (Date.now() > user.resetPassword.expiresIn) {
        res.status(400).json({ message: "Reset Link Expired" });
        user.ResetPassword = {};
        await user.save();
      } else {
        const hashedpass = await bcrypt.hash(password, 10);

        user.password = hashedpass;

        user.resetPassword = {};

        await user.save();
        res.status(200).json({ message: "Reset done" });
      }
    } else {
      res.status(401).json({ message: "Invalid Link" });
    }
  } catch (err) {}
};

exports.CheckUsername = async function (req, res) {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (user) {
      res.status(403).json({ message: "Username already taken." });
    } else {
      res.status(200).json({ message: "Username available" });
    }
  } catch (err) {}
};
