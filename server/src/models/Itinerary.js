import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    location: { type: String, trim: true, maxlength: 200 },
    dayNumber: { type: Number, default: 1, min: 1 },
    position: { type: Number, default: 0, min: 0 },
    startTime: { type: String }, // HH:mm
    notes: { type: String, maxlength: 2000 },
  },
  { _id: true },
);

const itinerarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    destination: { type: String, required: true, trim: true, maxlength: 200 },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String, maxlength: 4000 },
    tags: { type: [String], default: [] },
    coverEmoji: { type: String, default: "✈️", maxlength: 4 },
    activities: { type: [activitySchema], default: [] },
  },
  { timestamps: true },
);

export const Itinerary = mongoose.model("Itinerary", itinerarySchema);
