import { Model, Types } from "mongoose";

export type IPrivateAlbum = {
  user: Types.ObjectId;
  protectedImages: string[];
  images: string[];
  media: string[];
  aboutMe: string;
  bodyShape: string;
  motivateMe: string;
  myCondition: string;
  favorites?: string;
  canEnjoyThem?: string;
  languages?: string;
  education?: string;
  occupation?: string;
  smoking?: "never" | "social" | "tryToQuit" | "regularly";
  drinking?: "never" | "social" | "tryToQuit" | "regularly";
  haveChildren?: "yes-one" | "yes-two" | "yes-three-or-more" | "no";
  wantChildren?: "yes" | "no" | "maybe" | "have-already";
  astrologicalSign?:
    | "aries"
    | "taurus"
    | "gemini"
    | "cancer"
    | "leo"
    | "virgo"
    | "libra"
    | "scorpio"
    | "sagittarius"
    | "capricorn"
    | "aquarius"
    | "pisces";
  annualIncome?:
    | "preferNotToSay"
    | "lessThan10000"
    | "10000-20000"
    | "20000-30000"
    | "30000-40000"
    | "40000-50000"
    | "50000-60000"
    | "60000-70000"
    | "70000-80000"
    | "80000-90000"
    | "90000-100000"
    | "100000-150000"
    | "150000-200000"
    | "200000-250000"
    | "250000-300000"
    | "300000-350000"
    | "350000-400000"
    | "400000-450000"
    | "450000-500000"
    | "500000-550000"
    | "550000-600000"
    | "600000-650000"
    | "650000-700000"
    | "700000-750000"
    | "750000-800000"
    | "800000-850000"
    | "850000-900000"
    | "900000-950000"
    | "950000-1000000"
    | "1000000-1500000"
    | "1500000-2000000"
    | "2000000-2500000"
    | "2500000-3000000"
    | "3000000-3500000"
    | "3500000-4000000"
    | "4000000-4500000"
    | "4500000-5000000"
    | "5000000-5500000"
    | "5500000-6000000"
    | "6000000-6500000"
    | "6500000-7000000"
    | "7000000-7500000"
    | "7500000-8000000"
    | "8000000-8500000"
    | "8500000-9000000"
    | "9000000-9500000"
    | "9500000-10000000";
  politicalViews?:
    | "liberal"
    | "conservative"
    | "moderate"
    | "apolitical"
    | "other";
  religion?: "christian" | "muslim" | "hindu" | "buddhist" | "other";
  havePets?: "yes-dog" | "yes-cat" | "yes-other" | "no";
  myHobbiesAndInterests?: string[];
  myFavoriteMusic?: string[];
  personality?: string;
};

export type PrivateAlbumModel = Model<IPrivateAlbum>;
