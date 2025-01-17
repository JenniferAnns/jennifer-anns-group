import { NextApiResponse, NextApiRequest } from "next";
import { deleteTheme } from "@/server/db/actions/ThemeAction";
import { ObjectId } from "mongodb";
import {
  ThemeInvalidInputException,
  ThemeNotFoundException,
  ThemeException,
} from "@/utils/exceptions/theme";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import { authenticate } from "../../auth/[...nextauth]";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //Authentication
  const authenticated = await authenticate(req, res, ["DELETE"], true);
  if (authenticated !== true) {
    return authenticated;
  }
  switch (req.method) {
    case "DELETE":
      return deleteThemeHandler(req, res);
    default:
      return res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).send({
        error: `Request method ${req.method} is not allowed`,
      });
  }
}

async function deleteThemeHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const potential_id = req.query.id;
    if (!potential_id || Array.isArray(potential_id)) {
      throw new ThemeInvalidInputException();
    }

    const id: string = potential_id;
    if (!ObjectId.isValid(id)) {
      throw new ThemeNotFoundException();
    }

    const deletedTheme = await deleteTheme(id);
    return res.status(HTTP_STATUS_CODE.OK).send(deletedTheme);
  } catch (e: any) {
    if (e instanceof ThemeException) {
      return res.status(e.code).send({ error: e.message });
    }
    return res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: e.message });
  }
}
