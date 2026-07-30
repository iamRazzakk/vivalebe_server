import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { ReportsService } from "./reports.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const reports = await ReportsService.getAllReportsFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reports fetched successfully",
    pagination: reports.meta,
    data: reports.data,
  });
});

// single report details
const getSingleReport = catchAsync(async (req: Request, res: Response) => {
  const report = await ReportsService.getSingleReportFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Report fetched successfully",
    data: report,
  });
});

// update report status
const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const report = await ReportsService.updateReportStatusFromDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Report status updated successfully",
    data: report,
  });
});

// delete report
const deleteReport = catchAsync(async (req: Request, res: Response) => {
  const report = await ReportsService.deleteReportFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Report deleted successfully",
    data: report,
  });
});

export const ReportsController = {
  getAllReports,
  getSingleReport,
  updateReportStatus,
  deleteReport,
};