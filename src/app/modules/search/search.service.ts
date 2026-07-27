import { Types } from "mongoose";
import { ISearch } from "./search.interface";
import { Search } from "./search.model";

const createSearchIntoDB = async (payload: ISearch) => {
  const result = await Search.findOneAndUpdate(
    {
      user: payload.user,
      searchTerm: payload.searchTerm,
    },
    {
      $set: {
        updatedAt: new Date(),
      },
      $setOnInsert: {
        user: payload.user,
        searchTerm: payload.searchTerm,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return result;
};

const getMySearchesFromDB = async (userId: string) => {
  const result = await Search.find({
    user: new Types.ObjectId(userId),
  })
    .sort({ updatedAt: -1 })
    .lean();

  return result;
};

export const SearchServices = {
  createSearchIntoDB,
  getMySearchesFromDB,
};
