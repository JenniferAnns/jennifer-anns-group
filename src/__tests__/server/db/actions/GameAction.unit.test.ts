declare var global: any;
import mongoose, { ConnectOptions } from "mongoose";
import { randomTags } from "@/server/db/actions/__mocks__/TagAction";
import { randomThemes } from "@/server/db/actions/__mocks__/ThemeAction";
import { randomGames } from "@/server/db/actions/__mocks__/GameAction";
import { createTag } from "@/server/db/actions/TagAction";
import TagModel from "@/server/db/models/TagModel";
import ThemeModel from "@/server/db/models/ThemeModel";
import GameModel from "@/server/db/models/GameModel";
import * as connectMongoDB from "@/server/db/mongodb";
import { createTheme } from "@/server/db/actions/ThemeAction";
import { ExtendId } from "@/utils/types";
import { ITag } from "@/server/db/models/TagModel";
import { ITheme } from "@/server/db/models/ThemeModel";
import {
  RESULTS_PER_PAGE,
  getSelectedGames,
} from "@/server/db/actions/GameAction";
import { IGame } from "@/server/db/models/GameModel";
import { GameContentEnum, GameQuery } from "@/pages/api/games";
import { AppType } from "@/utils/types";
import { faker } from "@faker-js/faker";
import { GameNotFoundException } from "@/utils/exceptions/game";
import { TagNotFoundException } from "@/utils/exceptions/tag";
import { ThemeNotFoundException } from "@/utils/exceptions/theme";
import { CreateTagInput } from "@/pages/api/tags";
import { CreateThemeInput } from "@/pages/api/themes";
jest.mock("../../../../server/db/mongodb");
jest.spyOn(connectMongoDB, "default").mockImplementation(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  } as ConnectOptions);
});

//Only testing getSelectedGames for now
//Will directly populate games, themes and tags through mongodb

const NUM_GAMES = 300;
//Let's make new games and tags for each test.
let generatedGames: ExtendId<IGame>[];
let tagInputs: ExtendId<CreateTagInput>[];
let themeInputs: ExtendId<CreateThemeInput>[];

describe("MongodDB Game - Unit Test", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    } as ConnectOptions);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    generatedGames = randomGames(NUM_GAMES);
    await GameModel.insertMany(generatedGames);
    const gameIds = generatedGames.map((game) => game._id.toString());
    //Create random themes and tags. These have preset ids as well.
    tagInputs = randomTags(gameIds, 10);
    themeInputs = randomThemes(gameIds, 10);
    //Adds all themes to games
    themeInputs.forEach((themeInput) => {
      const gameIDs = themeInput.games;
      //Go through every game and add the proper theme.
      //Appears to add themes that do not exist.
      generatedGames.forEach((game) => {
        if (gameIDs.includes(game._id)) {
          game.themes ?? [];
          //The nullish coalescing operators ensures game.themes is defined
          game.themes = [...game.themes!, themeInput._id];
        }
      });
    });
    //Adds all tags to games (not seperated by type in game)
    tagInputs.forEach((tag) => {
      const gameIDs = tag.games;
      generatedGames.forEach((game) => {
        if (gameIDs.includes(game._id)) {
          game.tags ?? [];
          //The nullish coalescing operators ensures game.themes is defined
          game.tags = [...game.tags!, tag._id];
        }
      });
    });

    //Adds Tags and Themes to database.
    await Promise.all(
      tagInputs.map(async (tag) => {
        return await createTag(tag);
      }),
    );
    await Promise.all(
      themeInputs.map(async (theme) => {
        return await createTheme(theme);
      }),
    );
  });

  afterEach(async () => {
    await GameModel.deleteMany({});
    await ThemeModel.deleteMany({});
    await TagModel.deleteMany({});
  });

  describe("getSelectedGames", () => {
    test("[pagination] page out of range: expect exception", async () => {
      //TODO: Expect an exception or an empty list?
      const numPages = Math.ceil(NUM_GAMES / RESULTS_PER_PAGE);
      await expect(getSelectedGames({ page: numPages + 1 })).rejects.toThrow(
        GameNotFoundException,
      );
    });
    test("[pagination] no repeats in paginated results: expect success", async () => {
      const numPages = Math.ceil(NUM_GAMES / RESULTS_PER_PAGE);
      const set = new Set();
      for (let i = 0; i < numPages; i++) {
        const games = await getSelectedGames({ page: i + 1 });
        games.games.forEach((game) => {
          expect(set.has(game)).toBe(false);
          set.add(game);
        });
      }
      expect(set.size).toBe(NUM_GAMES);
    });
    test("[pagination] number of results in each page: expect success", async () => {
      const numPages = Math.ceil(NUM_GAMES / RESULTS_PER_PAGE);
      for (let i = 0; i < numPages; i++) {
        const games = await getSelectedGames({ page: i + 1 });
        expect(games.games.length).toBe(
          i < numPages - 1
            ? RESULTS_PER_PAGE
            : NUM_GAMES - RESULTS_PER_PAGE * (numPages - 1),
        );
      }
    });
    test("[tag] nonexistent tag: expect exception", async () => {
      //Create a non-existent tag name
      const tag = faker.string.alphanumeric({ length: 40 });
      //The alphanumeric numeric string is a list of 40 random characters, while the tags are actual names.
      //There is almost no change this tag will be present in the games.
      await expect(getSelectedGames({ page: 1, tags: [tag] })).rejects.toThrow(
        TagNotFoundException,
      );
      //Call the API and expect an exception
      //
    });
    test("[tag] in-out groups: expect success", async () => {
      //Ensure that the length of the in-group is the same as the one of the in group.
      const tag = faker.helpers.arrayElement(tagInputs);
      //Loop through all pages to make a list of all games with that tag
      let query: GameQuery = {
        page: 1,
      };
      //Filter generated gams
      if (tag.type == "custom") {
        query.tags = [tag.name];
      } else {
        query.accessibility = [tag.name];
      }

      let results = await getSelectedGames(query);
      let games = results.games;
      const numPages = Math.ceil(results.count / RESULTS_PER_PAGE) - 1; //-1 Since one page has already ben traversed.
      for (let page = 2; page < 2 + numPages; page++) {
        query.page = page;
        const result = await getSelectedGames(query);
        games = [...games, ...result.games];
      }
      //Ensure that the lists of objectids with that tag matches exactly what the tag has in the games array.
      const gameIds = games.map((game) => game._id.toString());
      gameIds.sort();
      tag.games.sort();
      expect(gameIds).toStrictEqual(tag.games);
    });
    test("[theme] nonexistent theme: expect exception", async () => {
      //Create a non-existent tag name
      const theme = faker.string.alphanumeric({ length: 40 });
      //The alphanumeric numeric string is a list of 40 random characters, while the themes are actual names.
      //There is almost no change this theme will be present in the games.
      await expect(getSelectedGames({ page: 1, theme: theme })).rejects.toThrow(
        ThemeNotFoundException,
      );
    });
    test("[theme] in-out groups: expect success", async () => {
      const theme = faker.helpers.arrayElement(themeInputs);
      //Loop through all pages to make a list of all games with that tag
      let query: GameQuery = {
        page: 1,
        theme: theme.name,
      };

      let results = await getSelectedGames(query);
      let games = results.games;
      const numPages = Math.ceil(results.count / RESULTS_PER_PAGE) - 1; //-1 Since one page has already ben traversed.
      for (let page = 2; page < 2 + numPages; page++) {
        query.page = page;
        const result = await getSelectedGames(query);
        games = [...games, ...result.games];
      }
      //Ensure that the lists of objectids with that tag matches exactly what the tag has in the games array.
      const gameIds = games.map((game) => game._id.toString());
      gameIds.sort();
      theme.games.sort();
      expect(gameIds).toStrictEqual(theme.games);
    });
    test("[name] regex case insensitivity in-exact match: expect success", async () => {
      //Randomly pick the name of a game from generatedGames
      //Take a random subslice of that game, with random capitilization
      //Call the action and expect that game to be in generated Games.
      const randomGame = faker.helpers.arrayElement(generatedGames);
      const randomName = randomGame.name;
      const substring = randomlyCapitalizeSubString(randomName);
      let results = await getSelectedGames({ name: substring, page: 1 });
      let games = results.games;
      const numPages = Math.ceil(results.count / RESULTS_PER_PAGE) - 1; //-1 Since one page has already ben traversed.
      for (let page = 2; page < 2 + numPages; page++) {
        const result = await getSelectedGames({
          name: substring,
          page: page,
        });
        games = [...games, ...result.games];
      }
      const selectedNames = games.map((game) => game.name);
      expect(selectedNames).toContain(randomName);
    });
    // ...
    test("happy: expect success", async () => {
      //
      const customTags = await TagModel.find({ type: "custom" });
      const randomCustomTag =
        customTags[Math.floor(Math.random() * customTags.length)];
      const accessibilityTags = await TagModel.find({
        type: "accessibility",
      });
      const randomAccessibilityTag =
        accessibilityTags[Math.floor(Math.random() * accessibilityTags.length)];

      const themes = await ThemeModel.find({});
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const query = {
        page: 1,
        tags: [randomCustomTag.name],
        accessibility: [randomAccessibilityTag.name],
        theme: randomTheme.name,
        name: faker.string.alpha({ length: 1 }),
        gameBuilds: [
          AppType.amazon,
          AppType.appstore,
          AppType.mac,
          AppType.webgl,
        ],
        gameContent: [GameContentEnum.parentingGuide],
      };

      // ids determined at runtime, omit for assertion
      //Removing this cuz ids are now no longer determined at runtime.
      const modifiedQuery = query;
      if (query.tags != undefined) {
        modifiedQuery.tags = [randomCustomTag._id.toString()];
      }

      if (query.accessibility != undefined) {
        modifiedQuery.accessibility = [randomAccessibilityTag._id.toString()];
      }
      if (query.theme != undefined) {
        modifiedQuery.theme = randomTheme._id.toString();
      }
      const expected = filterGeneratedGames(generatedGames, modifiedQuery);
      console.log("Expected Games", expected);
      let actual: {
        games: ExtendId<IGame>[];
        count: number;
      };
      if (expected.length == 0) {
        await expect(getSelectedGames(modifiedQuery)).rejects.toThrow(
          GameNotFoundException,
        );
      } else {
        actual = await getSelectedGames(modifiedQuery);
        actual.games.forEach((game) => {
          expect(game).toHaveProperty("_id");
        });
        console.log("Actual games", actual.games);
        expect(actual.games).toEqual(expected);
        console.log(query);
        console.log(query.tags);
      }
    });
  });

  type QueryFieldHandlers<T> = {
    [K in keyof T]: (
      games: IGame[],
      field: T[K],
      resultsPerPage: number,
    ) => IGame[];
  };

  const QUERY_FIELD_HANDLER_MAP: QueryFieldHandlers<Required<GameQuery>> = {
    page: (games, page, resultsPerPage) => {
      const startIndex = (page - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      return games.slice(startIndex, endIndex);
    },
    name: (games, name, _) =>
      games.filter((game) =>
        game.name.toLowerCase().includes(name.toLowerCase()),
      ),
    tags: (games, customTags, _) => {
      console.log("games passed to Tags", games.length);
      const filteredGames = games.filter((game) => {
        if (game.tags !== undefined) {
          return customTags.every((tag) => game.tags!.includes(tag));
        }
        return false;
      });
      console.log("games from Tags", filteredGames.length);
      return filteredGames;
    }, //TODO: rework. should ensure that games contains at least one of that tag.
    accessibility: (games, accessibilityTags, _) =>
      games.filter((game) =>
        accessibilityTags.every((tag) => game.tags?.includes(tag)),
      ), //TODO: rework
    theme: (games, themeName, _) =>
      games.filter((game) => game.themes?.includes(themeName)),
    gameBuilds: (games, gameBuilds, _) =>
      games.filter((game) => {
        const builds = game.builds?.map((build) => build.type);
        return builds?.some((build) => gameBuilds.includes(build));
      }),
    gameContent: (games, gameContent, _) =>
      games.filter((game) => gameContent.every((document) => document in game)),
  };

  function filterGeneratedGames(
    games: IGame[],
    query: GameQuery,
    resultsPerPage = RESULTS_PER_PAGE,
  ) {
    const { page, ...filterSteps } = query;

    let filteredGames = games;
    console.log("Before:", filteredGames.length);
    for (const [key, value] of Object.entries(filterSteps)) {
      filteredGames = QUERY_FIELD_HANDLER_MAP[key as keyof typeof filterSteps](
        filteredGames,
        value as any,
        resultsPerPage,
      );
      console.log("Filtered games:", key, filteredGames.length);
    }
    filteredGames = QUERY_FIELD_HANDLER_MAP["page"](
      filteredGames,
      page,
      RESULTS_PER_PAGE,
    );
    return filteredGames;
  }

  function randomlyCapitalizeSubString(name: string) {
    name = name
      .split(" ")
      .map((char) =>
        Math.random() > 0.5 ? char.toLowerCase() : char.toUpperCase(),
      )
      .join(" ");
    const start = faker.number.int({ min: 0, max: name.length - 2 });
    const end = faker.number.int({ min: start + 1, max: name.length });
    return name.substring(start, end);
  }
});
