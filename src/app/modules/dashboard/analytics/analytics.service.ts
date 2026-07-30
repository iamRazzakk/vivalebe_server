import { genderEnum } from "../../../../enums/gender";
import { USER_ROLES } from "../../../../enums/user";
import { Subscription } from "../../subscription/subscription.model";
import { Swipe } from "../../swipe/swipe.model";
import { User } from "../../user/user.model";
import { Wink } from "../../wink/wink.model";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getWeeklySwipeAnalyticsFromDB = async () => {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - daysFromMonday);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 7);

  const [swipeActivity, matchActivity] = await Promise.all([
    Swipe.aggregate<{
      _id: number;
      likes: number;
      rejects: number;
    }>([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $isoDayOfWeek: "$createdAt" },
          likes: {
            $sum: {
              $cond: [{ $eq: ["$action", "like"] }, 1, 0],
            },
          },
          rejects: {
            $sum: {
              $cond: [{ $eq: ["$action", "reject"] }, 1, 0],
            },
          },
        },
      },
    ]),

    Wink.aggregate<{
      _id: number;
      matchedDocuments: number;
    }>([
      {
        $match: {
          isMatch: true,
          updatedAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $isoDayOfWeek: "$updatedAt" },
          matchedDocuments: { $sum: 1 },
        },
      },
    ]),
  ]);

  const swipeMap = new Map(swipeActivity.map((item) => [item._id, item]));
  const matchMap = new Map(
    matchActivity.map((item) => [
      item._id,
      Math.floor(item.matchedDocuments / 2),
    ]),
  );

  return DAYS.map((day, index) => {
    const dayNumber = index + 1;
    const swipe = swipeMap.get(dayNumber);

    return {
      day,
      likes: swipe?.likes ?? 0,
      rejects: swipe?.rejects ?? 0,
      matches: matchMap.get(dayNumber) ?? 0,
    };
  });
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMonthlyRevenueAnalyticsFromDB = async () => {
  const currentYear = new Date().getUTCFullYear();
  const startDate = new Date(Date.UTC(currentYear, 0, 1));
  const endDate = new Date(Date.UTC(currentYear + 1, 0, 1));
  const revenue = await Subscription.aggregate<{
    _id: number;
    total: number;
  }>([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$price" },
      },
    },
  ]);
  const revenueMap = new Map(revenue.map((item) => [item._id, item.total]));
  return MONTHS.map((period, index) => ({
    period,
    subscriptions: revenueMap.get(index + 1) ?? 0,
  }));
};

const getPlanDistributionAnalyticsFromDB = async () => {
  const stats = await User.aggregate<{ _id: boolean; count: number }>([
    {
      $match: {
        role: { $ne: USER_ROLES.SUPER_ADMIN },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$premiumMembership", false] },
        count: { $sum: 1 },
      },
    },
  ]);
  const countMap = new Map(stats.map((item) => [item._id, item.count]));
  return [
    { name: "Free", value: countMap.get(false) ?? 0 },
    { name: "Premium", value: countMap.get(true) ?? 0 },
  ];
};

const GENDER_LABELS: Record<string, string> = {
  [genderEnum.FEMALE]: "Women",
  [genderEnum.MALE]: "Men",
  [genderEnum.COUPLE]: "Couple",
  NOT_SPECIFIED: "Not specified",
};

const getGenderDistributionAnalyticsFromDB = async () => {
  const stats = await User.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        role: { $ne: USER_ROLES.SUPER_ADMIN },
      },
    },
    {
      $group: {
        _id: {
          $ifNull: ["$gender", "NOT_SPECIFIED"],
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(stats.map((item) => [item._id, item.count]));

  const order = [
    genderEnum.FEMALE,
    genderEnum.MALE,
    genderEnum.COUPLE,
    "NOT_SPECIFIED",
  ];

  return order.map((key) => ({
    name: GENDER_LABELS[key],
    value: countMap.get(key) ?? 0,
  }));
};

const AGE_RANGE_MAP: Record<number, string> = {
  18: "18–24",
  25: "25–34",
  35: "35–44",
  45: "45–54",
  55: "55+",
};

const AGE_ORDER = ["18–24", "25–34", "35–44", "45–54", "55+"];

const getAgeDistributionAnalyticsFromDB = async () => {
  const stats = await User.aggregate<{ _id: number; users: number }>([
    {
      $match: {
        role: { $ne: USER_ROLES.SUPER_ADMIN },
        DOB: { $exists: true, $ne: null },
      },
    },
    {
      $addFields: {
        age: {
          $dateDiff: {
            startDate: "$DOB",
            endDate: "$$NOW",
            unit: "year",
          },
        },
      },
    },
    { $match: { age: { $gte: 18 } } },
    {
      $bucket: {
        groupBy: "$age",
        boundaries: [18, 25, 35, 45, 55, 200],
        default: "OTHER",
        output: { users: { $sum: 1 } },
      },
    },
  ]);

  const countMap = new Map(
    stats
      .filter((item) => typeof item._id === "number")
      .map((item) => [AGE_RANGE_MAP[item._id], item.users]),
  );

  return AGE_ORDER.map((range) => ({
    range,
    users: countMap.get(range) ?? 0,
  }));
};

export const AnalyticsService = {
  getWeeklySwipeAnalyticsFromDB,
  getMonthlyRevenueAnalyticsFromDB,
  getPlanDistributionAnalyticsFromDB,
  getGenderDistributionAnalyticsFromDB,
  getAgeDistributionAnalyticsFromDB,
};
