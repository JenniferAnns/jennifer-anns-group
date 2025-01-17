import { deleteBuild } from "@/server/db/actions/BuildAction";
import { editGame, getGameById } from "@/server/db/actions/GameAction";
import {
  GameNotFoundException,
  BuildUploadException,
  GameException,
  GameInvalidInputException,
  BuildNotFoundException,
} from "@/utils/exceptions/game";
import { NextApiResponse } from "next";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import { BucketType, getDirectUploadUrl } from "@/utils/file";
import { authenticate } from "@/pages/api/auth/[...nextauth]";
export default async function handler(req: any, res: NextApiResponse) {
  //Authentication
  const authenticated = await authenticate(
    req,
    res,
    ["POST", "DELETE", "PUT"],
    true,
  ); //For now only admins can interact with builds, not sure what other rules may be allowed to do so
  if (authenticated !== true) {
    return authenticated;
  }
  switch (req.method) {
    case "POST":
      return createBuildHandler(req, res);
    case "DELETE":
      return deleteBuildHandler(req, res);
    case "PUT":
      return editBuildHandler(req, res);
    default:
      return res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).send({
        error: `Request method ${req.method} is not allowed`,
      });
  }
}

async function createBuildHandler(req: any, res: NextApiResponse) {
  try {
    const game = await getGameById(req.query.id);
    if (!game) {
      throw new GameNotFoundException();
    }

    const { uploadUrl, uploadAuthToken } = await getDirectUploadUrl(
      BucketType.WebGLBuilds,
    );
    if (!uploadUrl || !uploadAuthToken) {
      throw new BuildUploadException();
    }
    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .send({ uploadUrl, uploadAuthToken });
  } catch (e: any) {
    if (e instanceof GameException) {
      return res.status(e.code).send({ error: e.message });
    }
    return res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: e.message });
  }
}

async function deleteBuildHandler(req: any, res: NextApiResponse) {
  try {
    const gameId = req.query.id;
    if (!gameId || Array.isArray(gameId)) {
      throw new GameInvalidInputException();
    }

    const deletedBuild = await deleteBuild(gameId);
    if (!deletedBuild) {
      throw new BuildNotFoundException();
    }
    const editedGame = await editGame({
      id: gameId,
      data: { webGLBuild: false },
    });
    if (!editedGame) {
      throw new GameNotFoundException();
    }

    return res.status(HTTP_STATUS_CODE.OK).send(deletedBuild);
  } catch (e: any) {
    if (e instanceof GameException) {
      return res.status(e.code).send({ error: e.message });
    }
    return res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: e.message });
  }
}

async function editBuildHandler(req: any, res: NextApiResponse) {
  try {
    const game = await getGameById(req.query.id);
    if (!game) {
      throw new GameNotFoundException();
    }

    const deletedBuild = await deleteBuild(req.query.id);
    if (!deletedBuild) {
      throw new BuildNotFoundException();
    }
    const { uploadUrl, uploadAuthToken } = await getDirectUploadUrl(
      BucketType.WebGLBuilds,
    );
    if (!uploadUrl || !uploadAuthToken) {
      throw new BuildUploadException();
    }
    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .send({ uploadUrl, uploadAuthToken });
  } catch (e: any) {
    if (e instanceof GameException) {
      return res.status(e.code).send({ error: e.message });
    }
    return res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: e.message });
  }
}
