import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const users = await User.find({});
    console.log("Total users:", users.length);
    console.log("Users:", users);
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
}

run();
