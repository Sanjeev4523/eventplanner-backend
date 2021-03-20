const bcrypt = require("bcryptjs");

const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    const { email, password } = args.userInput;
    // Check if user already exists
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
};
