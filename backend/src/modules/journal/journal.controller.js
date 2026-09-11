import {
  createJournalEntry as createJournalEntryService,
  getMyJournalEntries as getMyJournalEntriesService,
  getJournalEntryById as getJournalEntryByIdService,
  updateJournalOutcome as updateJournalOutcomeService,
} from "./journal.service.js";

export const createJournalEntry = async (req, res, next) => {
  try {
    const journalEntry = await createJournalEntryService(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Journal entry created successfully",
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyJournalEntries = async (req, res, next) => {
  try {
    const journalEntries = await getMyJournalEntriesService(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: journalEntries,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalEntryById = async (req, res, next) => {
  try {
    const journalEntry = await getJournalEntryByIdService(
      req.user.userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJournalOutcome = async (req, res, next) => {
  try {
    const journalEntry = await updateJournalOutcomeService(
      req.user.userId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Journal outcome updated successfully",
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};