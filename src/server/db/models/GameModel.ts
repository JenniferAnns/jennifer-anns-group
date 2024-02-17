import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { gameSchema } from "../../../utils/types";
import { ObjectId } from "mongodb";
export interface IGame extends z.infer<typeof gameSchema> {}
//You must use mongoose.Schema.Types.ObjectId when defining Schemas that contain an ObjectId.
const GameSchema = new Schema<IGame>({
  name: { type: String, required: true, unique: true },
  themes: { type: [mongoose.Schema.Types.ObjectId], required: false },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    required: false,
  },
  multiClass: { type: Boolean, required: true },
  description: { type: String },
  game: { type: String, required: true },
  lesson: { type: String },
  parentingGuide: { type: String },
});

const GameModel =
  (mongoose.models.Game as mongoose.Model<IGame>) ?? //will need to comment this out and restart to reload the game schema
  mongoose.model("Game", GameSchema);

export default GameModel;
