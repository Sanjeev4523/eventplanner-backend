const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    const { email, password } = args.userInput;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User Already Exists");
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        password: hashedPassword,
      });
      const result = await newUser.save();

      return { ...result._doc, _id: result.id, password: null };
    } catch (err) {
      console.log("USER CREEATION FAILED");
      console.log(err);
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User Does Not Exist!");
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Password is Incorrect");
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      "dogecoinToTheMoon",
      {
        expiresIn: "1h",
      }
    );
    return {
      userId: user.id,
      token,
      tokenExpiration: 1,
    };
  },
};
