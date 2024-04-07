import { z } from "zod";

const verifyObjectId = (value: string) => {
  //Instead of converting to an Object, verify that it can be converted into an ObjectId
  const regex_string: RegExp = /[0-9A-Fa-f]{24}/g;
  if (regex_string.test(value)) {
    return true;
  }
  return false;
};

// Home Page
export const gameBoySchema = z.object({
  gameId: z.string().refine(verifyObjectId).optional(),
  description: z.string(),
});

export const homePageSchema = z.object({
  mdTitle: z.string(),
  mdDescription: z.string(),
  gameBoyTitle: z.string(),
  gameBoys: z.array(gameBoySchema),
  singleton: z.boolean(),
});

export const editHomePageSchema = z.object({
  mdTitle: z.string().optional(),
  mdDescription: z.string().optional(),
  gameBoyTitle: z.string().optional(),
  gameBoys: z.array(gameBoySchema).optional(),
});

// Build
export enum AppType {
  AmazonApp = "Amazon App",
  AndroidApp = "Android App",
  AppStore = "App Store",
  LinuxDownload = "Linux Download",
  MacDownload = "Mac Download",
  WindowsDownload = "Windows Download",
}

export enum AllBuilds {
  amazon = "amazon",
  android = "android",
  appstore = "appstore",
  linux = "linux",
  mac = "mac",
  webgl = "webgl",
  windows = "windows",
}

export enum NonWebGLBuilds {
  amazon = "amazon",
  android = "android",
  appstore = "appstore",
  linux = "linux",
  mac = "mac",
  windows = "windows",
}

export enum GameContentEnum {
  answerKey = "answerKey",
  parentingGuide = "parentingGuide",
  lesson = "lesson",
  videoTrailer = "videoTrailer",
}

export const buildSchema = z.object({
  type: z.nativeEnum(NonWebGLBuilds),
  link: z.string().url(),
  instructions: z.string().optional(),
});

// Theme
export const themeSchema = z.object({
  name: z.string(),
});

// Tag
const tag_types = ["accessibility", "custom"] as const;
export const tagSchema = z.object({
  name: z.string(),
  type: z.enum(tag_types),
});

// Game
//We might need to make two gameSchemas, one for input verification and another

export const gameSchema = z.object({
  //Make sure to modify gameSchema endpoints, as well as editGameSchema I suppose.
  name: z.string().min(3, "Title must be at least 3 characters").max(50),
  lowercaseName: z //Field needs to be included for type, set to optional as frontend won't have it.
    .string()
    .min(3, "Lowercase Title must be at least 3 characters")
    .max(50)
    .optional(),
  themes: z.array(z.string().refine(verifyObjectId)).optional(),
  tags: z.array(z.string().refine(verifyObjectId)).optional(),
  webGLBuild: z.boolean().optional(),
  builds: z.array(buildSchema).optional(),
  description: z.string().min(1, "Description is required"),
  lesson: z.string().url().optional(),
  parentingGuide: z.string().url().optional(),
  answerKey: z.string().url().optional(),
  videoTrailer: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url().optional(),
  ),
  preview: z.boolean(),
});
//Since arrays from req.query are just strings, and need to be converted into arrays.

//For validating game query in the GET endpoint
//Be aware that zod.transform alters the data during parsing.

// For editing game
export const editGameSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  themes: z.array(z.string().refine(verifyObjectId)).optional(),
  tags: z.array(z.string().refine(verifyObjectId)).optional(),
  multiClass: z.boolean().optional(),
  description: z.string().optional(),
  webGLBuild: z.boolean().optional(),
  builds: z.array(buildSchema).optional(),
  lesson: z.string().url().optional(),
  parentingGuide: z.string().url().optional(),
  answerKey: z.string().url().optional(),
  videoTrailer: z.string().url().or(z.literal("")).optional(),
  preview: z.boolean().optional(),
});

// Notes
export const noteSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  description: z.string(),
  gameId: z.string().refine(verifyObjectId).optional(),
});

export enum UserLabel {
  Educator = "educator",
  Student = "student",
  Parent = "parent",
  Administrator = "administrator",
}

// User
export const userSchema = z.object({
  email: z.string().email("Not a valid email"),
  hashedPassword: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  notes: z.array(noteSchema),
  label: z.nativeEnum(UserLabel),
});

// Admin
export const adminSchema = z.object({
  email: z.string().email("Not a valid email"),
  lowercaseEmail: z.string().email("Not a valid email").optional(),
});

// Email Format
export const emailSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  message: z.string(),
  gameName: z.string(),
});

export type ExtendId<T extends any> = T & { _id: string };
// For changing password
export const changePWSchema = z.object({
  oldpassword: z.string(),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  passwordConfirm: z.string(),
});
