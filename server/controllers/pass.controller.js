// controllers/pass.controller.js
import Pass from "../models/pass.model.js";

export const myPasses = async (req, res) => {
  try {
    const userId = req.user?._id;
    const passes = await Pass.find({ user: userId }).sort("-createdAt").lean();
    res.json({ success: true, data: passes });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPassById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const pass = await Pass.findOne({ _id: id, user: userId }).lean();
    if (!pass)
      return res
        .status(404)
        .json({ success: false, message: "Pass not found" });
    res.json({ success: true, data: pass });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
