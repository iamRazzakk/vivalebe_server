import { PostReport } from "../../post_report/post_report.model";
import { Subscription } from "../../subscription/subscription.model";
import { Swipe } from "../../swipe/swipe.model";
import { User } from "../../user/user.model";

// total user, active today, new signup user, total matches user, open report
const getOverviewDataFromDB = async () => {
  const totalUser = await User.countDocuments();
  const activeToday = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
  });
  //   this month signup user
  const newSignupUser = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    },
  });
  const totalMatchesUser = await Swipe.countDocuments({
    $or: [
      { isLiked: true },
      { toUser: { $exists: true } },
      { fromUser: { $exists: true } },
    ],
  });
  const openReport = await PostReport.countDocuments();
  return {
    totalUser,
    activeToday,
    newSignupUser,
    totalMatchesUser,
    openReport,
  };
};

// base the swipe create and updated at data i need to show current month user activity from d1 to d end date. return like d1 active count, d2 active count total
const getUserActivityFromDB = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const currentDay = now.getUTCDate();

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month, currentDay + 1));

  const activity = await Swipe.aggregate<{
    _id: string;
    activeCount: number;
  }>([
    {
      $match: {
        $or: [
          { createdAt: { $gte: startDate, $lt: endDate } },
          { updatedAt: { $gte: startDate, $lt: endDate } },
        ],
      },
    },
    {
      $project: {
        activityDays: {
          $setUnion: [
            {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startDate] },
                    { $lt: ["$createdAt", endDate] },
                  ],
                },
                [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$createdAt",
                    },
                  },
                ],
                [],
              ],
            },
            {
              $cond: [
                {
                  $and: [
                    { $gte: ["$updatedAt", startDate] },
                    { $lt: ["$updatedAt", endDate] },
                  ],
                },
                [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$updatedAt",
                    },
                  },
                ],
                [],
              ],
            },
          ],
        },
      },
    },
    { $unwind: "$activityDays" },
    {
      $group: {
        _id: "$activityDays",
        activeCount: { $sum: 1 },
      },
    },
  ]);

  const activityByDate = new Map(
    activity.map((item) => [item._id, item.activeCount]),
  );

  return Array.from({ length: currentDay }, (_, index) => {
    const day = index + 1;
    const date = new Date(Date.UTC(year, month, day))
      .toISOString()
      .slice(0, 10);

    return {
      day: `D${day}`,
      activeCount: activityByDate.get(date) ?? 0,
    };
  });
};

// need to return current month user activity from d1 to d end date. return like d1 newUser, d2 newUser total

const getNewUserActivityFromDB = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const currentDay = now.getUTCDate();

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month, currentDay + 1));

  const activity = await User.aggregate<{
    _id: string;
    newUser: number;
  }>([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        newUser: { $sum: 1 },
      },
    },
  ]);

  const usersByDate = new Map(activity.map((item) => [item._id, item.newUser]));

  return Array.from({ length: currentDay }, (_, index) => {
    const day = index + 1;
    const date = new Date(Date.UTC(year, month, day))
      .toISOString()
      .slice(0, 10);

    return {
      day: `D${day}`,
      newUser: usersByDate.get(date) ?? 0,
    };
  });
};

// recent 10 sign up user
const getRecent10SignUpUserFromDB = async () => {
  const recent10SignUpUser = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return recent10SignUpUser;
};

// recent 10 report
const getRecent10ReportFromDB = async () => {
  const recent10Report = await PostReport.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return recent10Report;
};

// recent 10 subscription user
const getRecent10SubscriptionUserFromDB = async () => {
  const recent10SubscriptionUser = await Subscription.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return recent10SubscriptionUser;
};

export const OverviewService = {
  getOverviewDataFromDB,
  getUserActivityFromDB,
  getNewUserActivityFromDB,
  getRecent10SignUpUserFromDB,
  getRecent10ReportFromDB,
  getRecent10SubscriptionUserFromDB,
};
