import GameModel from "../models/GameModel";
import ThemeModel from "../models/ThemeModel";
import TagModel from "../models/TagModel";
import connectMongoDB from "../mongodb";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { editGameSchema } from "@/utils/types";
import { IGame } from "../models/GameModel";
import { GameNotFoundException } from "@/utils/exceptions/game";
import { ThemeNotFoundException } from "@/utils/exceptions/theme";
import { TagNotFoundException } from "@/utils/exceptions/tag";

const RESULTS_PER_PAGE = 6;

export async function createGame(data: IGame) {
  await connectMongoDB();
  const session = await TagModel.startSession();
  session.startTransaction();

  // add theme and tag IDs to the game
  try {
    if (data && data.themes) {
      const themePromises = data.themes.map((theme) =>
        ThemeModel.findById(theme)
      );
      const themeResults = await Promise.all(themePromises);
      themeResults.forEach((result) => {
        if (!result) {
          throw new ThemeNotFoundException();
        }
      });
    }
    if (data && data.tags) {
      const tagPromises = data.tags.map((tag) => TagModel.findById(tag));
      const tagResults = await Promise.all(tagPromises);
      tagResults.forEach((result) => {
        if (!result) {
          throw new TagNotFoundException();
        }
      });
    }
  } catch (e) {
    await session.abortTransaction();
    throw e;
  }

  // create the game
  try {
    const game = (await GameModel.create([data], { session }))[0];
    await session.commitTransaction();
    return game.toObject();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  }
}

export async function deleteGame(data: ObjectId) {
  await connectMongoDB();
  try {
    const deletedGame = await GameModel.findByIdAndDelete(data.toString());
    if (!deletedGame) {
      throw new GameNotFoundException();
    }
    return deletedGame.toObject();
  } catch (e) {
    throw e;
  }
}
interface IEditGame extends z.infer<typeof editGameSchema> {}
interface nextEditGame {
  data: IEditGame;
  id: string;
}
export async function editGame(allData: nextEditGame) {
  await connectMongoDB();
  const data: IEditGame = allData.data;
  try {
    if (data && data.themes) {
      const themePromises = data.themes.map((theme) =>
        ThemeModel.findById(theme)
      );
      const themeResults = await Promise.all(themePromises);
      themeResults.forEach((result, index) => {
        if (!result) {
          throw new ThemeNotFoundException();
        }
      });
    }
    if (data && data.tags) {
      const tagPromises = data.tags.map((tag) => TagModel.findById(tag));
      const tagResults = await Promise.all(tagPromises);
      tagResults.forEach((result, index) => {
        if (!result) {
          throw new TagNotFoundException();
        }
      });
    }
  } catch (e) {
    throw e;
  }
  try {
    const newGame = await GameModel.findByIdAndUpdate(allData.id, allData.data, {
      new: true,
    });
    if (!newGame) {
      throw new GameNotFoundException();
    }
    return newGame;
  } catch (e) {
    throw e;
  }
}

export async function getAllGames() {
  await connectMongoDB();
  try {
    const games = await GameModel.find();
    if (games == null) {
      return [];
    }
    return games;
  } catch (e) {
    throw e;
  }
}

export async function getGameById(id: string) {
  await connectMongoDB();
  try {
    const game = await GameModel.findById(id)
      .populate("themes")
      .populate("tags");
    return game;
  } catch (e) {
    throw e;
  }
}
