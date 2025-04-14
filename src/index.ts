import { Elysia } from "elysia";
import server from "./server";
import logger from "./server/middleware/logger";
import swagger from "@elysiajs/swagger";

const app = new Elysia()
  .use(swagger())
  .use(server)
  .listen(Bun.env.PORT || 3000, ({ hostname, port }) => {
    console.log(`🦊 Server is running at ${hostname}:${port}`);
  });
