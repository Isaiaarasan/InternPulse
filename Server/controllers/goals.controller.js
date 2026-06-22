import Goal from "../models/Goal.model.js";
import Notification from "../models/Notification.model.js";
import { sendNotification } from "../socket.js";

export const createGoal = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const goal = await Goal.create(req.body);

    // Create notifications for assigned interns
    const notifications = req.body.assignedTo.map((internId) => ({
      recipient: internId,
      type: "goal_assigned",
      message: `New goal assigned: ${goal.title}`,
    }));
    const createdNotifs = await Notification.insertMany(notifications);
    createdNotifs.forEach(notif => sendNotification(notif.recipient, notif));

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    let query;
    if (req.user.role === "intern") {
      query = Goal.find({ assignedTo: req.user.id });
    } else {
      query = Goal.find({ createdBy: req.user.id });
    }
    const goals = await query.populate("assignedTo", "name email");
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/goals/intern/:internId
 * Get all goals assigned to a specific intern
 */
export const getInternGoals = async (req, res) => {
  try {
    const { internId } = req.params;
    const goals = await Goal.find({ assignedTo: internId })
      .populate("createdBy", "name email")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    console.error("[Get Intern Goals Error]:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateGoalStatus = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name email");

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    }

    // Verify authorization: intern can view their assigned goals, managers can view their created goals
    const isAssigned = goal.assignedTo.some(
      (a) => a._id.toString() === req.user.id,
    );
    const isCreator = goal.createdBy._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAssigned && !isCreator && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this goal" });
    }

    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    console.error("[Get Goal Error]:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    }

    // Only creator or admin can delete
    if (
      goal.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal",
      });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    console.error("[Delete Goal Error]:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
