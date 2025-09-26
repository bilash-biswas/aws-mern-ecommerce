import express from "express";
import Newsletter from "../models/Newsletter";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "This email is already subscribed" });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();
    res.status(201).json({ message: "Successfully subscribed to newsletter!" });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;