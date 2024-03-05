import { deleteNote, updateNote } from "@/server/db/actions/NoteAction";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import { UserDoesNotExistException } from "@/utils/exceptions/user";
import { noteSchema } from "@/utils/types";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id as string;
  const noteId = req.query.noteId as string;

  switch (req.method) {
    case "PUT":
      const updateData = noteSchema.safeParse(JSON.parse(req.body));
      if (!updateData.success) {
        return res.status(422).send({
          error: updateData.error.format(),
        });
      }
      return await updateNote(id, noteId, updateData.data).then(() => {
        return res.status(200).send({
          message: "Note successfully edited!",
        });
      });
    case "DELETE":
      try {
        const result = await deleteNote(id, noteId);
        return res.status(201).send({
          data: { id: result },
        });
      } catch (e: unknown) {
        if (e instanceof UserDoesNotExistException) {
          res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
            error: (e as Error).message,
          });
          return;
        }
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
          error: (e as Error).message,
        });
      }
      break;
    default:
      res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).json({
        error: `Request method ${req.method} is not allowed`,
      });
  }
}
