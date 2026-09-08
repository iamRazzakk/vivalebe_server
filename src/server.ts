import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { errorLogger, logger } from "./shared/logger";
import colors from "colors";
import { socketHelper } from "./helpers/socketHelper";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import seedSuperAdmin from "./DB";
import redisClient, { RedisClient } from "./config/redis.config";
import { bootstrap } from "./handlers/rabbitmq.wrapper";
import ApiError from "./errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { startLikeFlushJob } from "./jobs/like.flush";
import { startSubscriptionExpiryJob } from "./jobs/subscription.expiry";

//uncaught exception
process.on("uncaughtException", (error) => {
  errorLogger.error("uncaughtException Detected", error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    startLikeFlushJob();
    startSubscriptionExpiryJob();
    const redisConnected = await RedisClient.connect();
    if (!redisConnected) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Redis connection failed",
      );
    }

    await import("./worker/email.worker");

    await mongoose.connect(config.database_url as string);
    logger.info(colors.green("🚀 Database connected successfully"));
    await seedSuperAdmin();

    await bootstrap();

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`),
      );
    });

    // socket.io shares the HTTP server; path stays default `/socket.io/`
    const io = new Server(server, {
      pingTimeout: 60000,
      pingInterval: 25000,
      cors: {
        origin: "*",
      },
    });

    // 4 instances: emit via Redis so getMessage / get-notification reach every client
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter(redisClient, subClient));

    socketHelper.socket(io);
    //@ts-ignore
    global.io = io;
  } catch (error: any) {
    console.log(error.message);
    errorLogger.error(colors.red("🤢 Application startup failed"), {
      message: error?.message || error,
      stack: error?.stack,
    });
    process.exit(1);
  }

  //handle unhandledRejection
  process.on("unhandledRejection", (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error("UnhandledRejection Detected", error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

//SIGTERM
process.on("SIGTERM", async () => {
  logger.info("SIGTERM IS RECEIVE");
  if (server) {
    server.close();
  }
  await RedisClient.disconnect();
});
