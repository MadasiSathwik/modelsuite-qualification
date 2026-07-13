const Submission = require("../models/Submission");
const Task = require("../models/Task");

// Submit Task
// POST /api/submissions/:taskId
const submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { notes } = req.body;

  try {
    const fileUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : req.body.fileUrl || null;

    let submission = await Submission.findOne({
      taskId,
      talentId: req.user._id,
    });

    if (submission) {
      submission.fileUrl = fileUrl;
      submission.notes = notes;
      await submission.save();
    } else {
      submission = await Submission.create({
        taskId,
        talentId: req.user._id,
        fileUrl,
        notes,
      });
    }

    await Task.findByIdAndUpdate(taskId, {
      status: "Submitted",
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get One Submission
// GET /api/submissions/:taskId
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      taskId: req.params.taskId,
    }).populate("talentId", "name email");

    if (!submission) {
      return res.status(404).json({
        message: "No submission found for this task",
      });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get All Submissions (Admin)
// GET /api/submissions/admin/all
const getAllSubmissions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalSubmissions = await Submission.countDocuments();

    const submissions = await Submission.find({})
      .populate("taskId", "title dueDate status")
      .populate("talentId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pending = await Submission.countDocuments({
      reviewStatus: "Pending",
    });

    const approved = await Submission.countDocuments({
      reviewStatus: "Approved",
    });

    const rejected = await Submission.countDocuments({
      reviewStatus: "Rejected",
    });

    res.json({
      submissions,
      page,
      totalPages: Math.ceil(totalSubmissions / limit),
      totalSubmissions,
      stats: {
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Review Submission
// PUT /api/submissions/:id/review
const reviewSubmission = async (req, res) => {
  const { reviewStatus } = req.body;

  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        reviewStatus,
      },
      {
        new: true,
      }
    )
      .populate("taskId", "title status")
      .populate("talentId", "name email");

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Update Task Status also
    await Task.findByIdAndUpdate(submission.taskId._id, {
      status: reviewStatus,
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  submitTask,
  getSubmission,
  getAllSubmissions,
  reviewSubmission,
};