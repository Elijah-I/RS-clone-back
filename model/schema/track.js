import mongoose from "mongoose";

const Track = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  media: { type: String, required: true }
});

export default mongoose.model("Track", Track);
