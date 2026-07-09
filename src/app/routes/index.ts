import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PostsRoutes } from "../modules/posts/posts.route";
const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/posts", route: PostsRoutes }
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
