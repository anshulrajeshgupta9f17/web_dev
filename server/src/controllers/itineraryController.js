import { Itinerary } from "../models/Itinerary.js";

export const list = async (req, res, next) => {
  try {
    const items = await Itinerary.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const it = await Itinerary.findOne({ _id: req.params.id, userId: req.userId });
    if (!it) return res.status(404).json({ error: "Not found" });
    res.json(it);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const it = await Itinerary.create({ ...req.body, userId: req.userId });
    res.status(201).json(it);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const it = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!it) return res.status(404).json({ error: "Not found" });
    res.json(it);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const r = await Itinerary.deleteOne({ _id: req.params.id, userId: req.userId });
    if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) { next(e); }
};
