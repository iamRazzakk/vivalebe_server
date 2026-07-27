import rateLimit from "express-rate-limit";

const skipInTest = () =>
  process.env.NODE_ENV === "test" || process.env.NODE_TEST_ENV === "test";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Too many requests, please try again later",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, //TODO: change to 10
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: {
    message: "Too many auth attempts, please try again later",
  },
});
