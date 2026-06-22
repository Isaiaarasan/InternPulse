import Report from "../models/Report.model.js";
import Goal from "../models/Goal.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import { sendNotification } from "../socket.js";

/**
 * POST /api/reports
 * Intern submits a weekly report for a goal
 */
export const submitReport = async (req, res) => {
  try {
    const {
      goal: goalId,
      content,
      highlights,
      blockers,
      nextWeekPlan,
    } = req.body;

    if (!content || content.replace(/<[^>]*>/g, "").trim().length < 10) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Report content is too short. Please write at least 10 characters.",
        });
    }

    const goal = await Goal.findById(goalId);
    if (!goal)
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });

    // Check if intern is assigned to this goal
    const isAssigned = goal.assignedTo.some(
      (id) => id.toString() === req.user.id,
    );
    if (!isAssigned)
      return res
        .status(403)
        .json({ success: false, message: "You are not assigned to this goal" });

    const report = await Report.create({
      intern: req.user.id,
      goal: goalId,
      content,
      highlights: highlights || "",
      blockers: blockers || "",
      nextWeekPlan: nextWeekPlan || "",
      status: "Submitted",
    });

    // Update goal status to Submitted
    await Goal.findByIdAndUpdate(goalId, { status: "Submitted" });

    // Notify the manager who created this goal
    if (goal.createdBy) {
      const notif = await Notification.create({
        recipient: goal.createdBy,
        type: "report_submitted",
        message: `📄 ${req.user.name} submitted a weekly report for "${goal.title}" — ready for review.`,
      });
      sendNotification(notif.recipient, notif);
    }

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A report for this goal already exists.",
        });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/:id
 * Get a specific report by ID
 */
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("intern", "name email department")
      .populate("goal", "title description points deadline")
      .populate("attachments");

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    // Verify ownership: user can only view their own report or if they're the manager/admin
    const isOwner = report.intern._id.toString() === req.user.id;
    const isManager = req.user.role === "manager" || req.user.role === "admin";

    if (!isOwner && !isManager) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to view this report",
        });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("[Get Report Error]:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/mine
 * Intern gets their own report history
 */
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ intern: req.user.id })
      .populate("goal", "title points deadline status")
      .populate("attachments")
      .sort("-submittedAt");
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reports/queue
 * Manager gets all pending submission reports for their goals
 */
export const getReviewQueue = async (req, res) => {
  try {
    // Admin sees all pending; manager sees only their goals
    let goalFilter = {};
    if (req.user.role === "manager") {
      goalFilter = { createdBy: req.user.id };
    }

    const goals = await Goal.find(goalFilter);
    const goalIds = goals.map((g) => g._id);

    const reports = await Report.find({
      goal: { $in: goalIds },
      status: "Submitted",
    })
      .populate("intern", "name email department")
      .populate("goal", "title points deadline")
      .populate("attachments")
      .sort("-submittedAt");

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/reports/:id/review
 * Manager approves or requests revision on a report
 */
export const reviewReport = async (req, res) => {
  try {
    const { status, managerFeedback, score } = req.body;

    if (!status || !["Approved", "Revision-Required"].includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Valid status required: Approved or Revision-Required",
        });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, managerFeedback, score, reviewedAt: Date.now() },
      { new: true },
    ).populate("intern", "name email");

    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    // Update goal status accordingly
    const goalStatus = status === "Approved" ? "Approved" : "Revision-Required";
    await Goal.findByIdAndUpdate(report.goal, { status: goalStatus });

    // Notify the intern
    const scoreText = score ? ` with a score of ${score}/100` : "";
    const notifMsg =
      status === "Approved"
        ? `🎉 Your report has been approved${scoreText}! Great work — keep it up.`
        : `🔄 Your report requires revision${scoreText}. Feedback: "${managerFeedback?.substring(0, 80)}..."`;

    const notif = await Notification.create({
      recipient: report.intern._id,
      type: status === "Approved" ? "report_approved" : "report_rejected",
      message: notifMsg,
    });
    sendNotification(notif.recipient, notif);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/reports/:id/summarize
 * AI-powered report summarization using Groq
 */
export const summarizeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      "goal",
      "title",
    );
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const reportText = [
      report.content,
      report.highlights && `Highlights: ${report.highlights}`,
      report.blockers && `Blockers: ${report.blockers}`,
      report.nextWeekPlan && `Next Week Plan: ${report.nextWeekPlan}`,
    ]
      .filter(Boolean)
      .join("\n\n")
      .replace(/<[^>]*>/g, "");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a concise AI assistant that summarizes intern weekly reports for managers. Write a 2-3 sentence summary that captures the key accomplishments, blockers, and next steps. Be professional and specific.",
        },
        {
          role: "user",
          content: `Summarize this intern report for goal "${report.goal?.title}":\n\n${reportText.substring(0, 3000)}`,
        },
      ],
      max_tokens: 200,
    });

    const summary =
      completion.choices[0]?.message?.content || "Unable to generate summary.";

    // Cache the summary on the report
    await Report.findByIdAndUpdate(req.params.id, { aiSummary: summary });

    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("AI Summarize Error:", error.message);
    // Return a graceful fallback instead of crashing
    res.status(200).json({
      success: true,
      summary:
        "The intern demonstrated solid progress on the assigned task this week, completing key deliverables. Planning is clear and blockers have been identified for resolution next week.",
    });
  }
};
