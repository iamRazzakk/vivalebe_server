import QueryBuilder from "../../../builder/queryBuilder";
import { PostReport } from "../../post_report/post_report.model";

const getAllReportsFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(PostReport.find(), query)
    .filter()
    .sort()
    .search(["reason", "description", "status"])
    .paginate();
  const [data, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    data,
    meta,
  };
};

// single report details
const getSingleReportFromDB = async (id: string) => {
  const report = await PostReport.findById(id).lean();
  return report;
};

// update report status
const updateReportStatusFromDB = async (id: string, payload: any) => {
  const report = await PostReport.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();
  return report;
};

// delete report
const deleteReportFromDB = async (id: string) => {
  const report = await PostReport.findByIdAndDelete(id).lean();
  return report;
};

export const ReportsService = {
  getAllReportsFromDB,
  getSingleReportFromDB,
  updateReportStatusFromDB,
  deleteReportFromDB,
};
