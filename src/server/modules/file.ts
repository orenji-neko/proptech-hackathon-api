import { Elysia, file, t } from "elysia";

export default new Elysia({ name: "file", prefix: "/files" })
  /**
   * [GET] /files/:fileName
   * Get file from server.
   */
  .get("/:fileName", async ({ params }) => {
    const { fileName } = params;
    return file("public/" + fileName);
  })
  /**
   * [POST] /files
   * Upload multiple files to server
   */
  .post(
    "/",
    async ({ body }) => {
      const { files } = body;

      files.forEach((file) => {
        Bun.write(`public/${file.name}`, file);
      });

      return {
        message: "success"
      }
    },
    {
      body: t.Object({
        files: t.Files(),
      }),
    }
  );
