import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PostsRoutes } from "../modules/posts/posts.route";
import { LikeRoutes } from "../modules/like/like.route";
import { CommentsRoutes } from "../modules/comments/comments.route";
import { WinkRoutes } from "../modules/wink/wink.route";
import { BlogsRoutes } from "../modules/blogs/blogs.route";
import { BlogCommentsRoutes } from "../modules/blogcomments/blogcomments.route";
const router = Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/posts", route: PostsRoutes },
  { path: "/likes", route: LikeRoutes },
  { path: "/comments", route: CommentsRoutes },
  { path: "/winks", route: WinkRoutes },
  { path: "/blogs", route: BlogsRoutes },
  { path: "/blog-comments", route: BlogCommentsRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
