import Project from "../models/Project.model.js";

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Project name is required" });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authorized" });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authorized" });
    }

    const projects = await Project.find({
      owner: req.user._id,
    });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};