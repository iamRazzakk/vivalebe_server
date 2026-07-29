import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PostsRoutes } from "../modules/posts/posts.route";
import { LikeRoutes } from "../modules/like/like.route";
import { CommentsRoutes } from "../modules/comments/comments.route";
import { WinkRoutes } from "../modules/wink/wink.route";
import { BlogsRoutes } from "../modules/blogs/blogs.route";
import { BlogCommentsRoutes } from "../modules/blogcomments/blogcomments.route";
import { BlogLikeRoutes } from "../modules/blog_like/blog_like.route";
import { EventsRoutes } from "../modules/events/events.route";
import { FirstDateIdeasRoutes } from "../modules/first_date_ideas/first_date_ideas.route";
import { SwipeRoutes } from "../modules/swipe/swipe.route";
import { ViewMeRoutes } from "../modules/viewme/viewme.route";
import { PackageRoutes } from "../modules/package/package.routes";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { PrivateAlbumRoutes } from "../modules/private_album/private_album.route";
import { ChatRoutes } from "../modules/chat/chat.routes";
import { MessageRoutes } from "../modules/message/message.routes";
import { FeedbackRoutes } from "../modules/feedback/feedback.route";
import { FeedRoutes } from "../modules/feed/feed.route";
import { PostReportRoutes } from "../modules/post_report/post_report.route";
import { BlockRoutes } from "../modules/block/block.route";
import { PrivateFileAccessRoutes } from "../modules/privateFileAccess/privateFileAccess.routes";
import { SearchRoutes } from "../modules/search/search.route";
import { ruleRoutes } from "../modules/rule/rule.route";
import { SuccessStoryRoutes } from "../modules/success_story/success_story.route";
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
  { path: "/blog-likes", route: BlogLikeRoutes },
  { path: "/events", route: EventsRoutes },
  { path: "/first-date-ideas", route: FirstDateIdeasRoutes },
  { path: "/swipe", route: SwipeRoutes },
  { path: "/view-me", route: ViewMeRoutes },
  { path: "/block", route: BlockRoutes },
  { path: "/package", route: PackageRoutes },
  { path: "/subscription", route: SubscriptionRoutes },
  { path: "/private-albums", route: PrivateAlbumRoutes },
  { path: "/chat", route: ChatRoutes },
  { path: "/message", route: MessageRoutes },
  { path: "/feedback", route: FeedbackRoutes },
  { path: "/feed", route: FeedRoutes },
  { path: "/post-report", route: PostReportRoutes },
  { path: "/private-file-access", route: PrivateFileAccessRoutes },
  { path: "/search", route: SearchRoutes },
  { path: "/rule", route: ruleRoutes },
  { path: "/success-story", route: SuccessStoryRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
