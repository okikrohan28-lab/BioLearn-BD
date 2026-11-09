const Paper = require('../models/Paper');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');

// ==================== PAPER SERVICES ====================

const getPapers = async (filter = {}) => {
  return await Paper.find(filter).sort({ title: 1 });
};

const getPaperById = async (id, filter = {}) => {
  const paper = await Paper.findOne({ _id: id, ...filter });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }
  return paper;
};

const createPaper = async ({ title, subject, access_level, status, description }) => {
  return await Paper.create({
    title,
    subject: subject || 'Biology',
    access_level: access_level || 'free',
    status: status || 'published',
    description: description || '',
  });
};

const updatePaper = async (id, updateData) => {
  const paper = await Paper.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }
  return paper;
};

const deletePaper = async (id) => {
  // Check if chapters exist under this paper
  const chapterCount = await Chapter.countDocuments({ paper_id: id });
  if (chapterCount > 0) {
    const error = new Error(
      `Cannot delete paper. There are ${chapterCount} chapters associated with it. Please remove or reassign them first.`
    );
    error.statusCode = 400;
    throw error;
  }
  const paper = await Paper.findByIdAndDelete(id);
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }
  return paper;
};

// ==================== CHAPTER SERVICES ====================

const getChapters = async (filter = {}) => {
  return await Chapter.find(filter).populate('paper_id', 'title subject access_level').sort({ chapter_no: 1 });
};

const getChapterById = async (id, filter = {}) => {
  const chapter = await Chapter.findOne({ _id: id, ...filter }).populate('paper_id', 'title subject access_level');
  if (!chapter) {
    const error = new Error('Chapter not found');
    error.statusCode = 404;
    throw error;
  }
  return chapter;
};

const createChapter = async ({ paper_id, chapter_no, title, description, status }) => {
  // Validate parent paper exists
  const paper = await Paper.findById(paper_id);
  if (!paper) {
    const error = new Error('Associated paper not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate duplicate chapter_no within paper
  const existing = await Chapter.findOne({ paper_id, chapter_no });
  if (existing) {
    const error = new Error(`Chapter ${chapter_no} already exists in this paper`);
    error.statusCode = 409;
    throw error;
  }

  return await Chapter.create({
    paper_id,
    chapter_no,
    title,
    description: description || '',
    status: status || 'published',
  });
};

const updateChapter = async (id, updateData) => {
  if (updateData.chapter_no && updateData.paper_id) {
    const existing = await Chapter.findOne({
      _id: { $ne: id },
      paper_id: updateData.paper_id,
      chapter_no: updateData.chapter_no,
    });
    if (existing) {
      const error = new Error(`Chapter ${updateData.chapter_no} already exists in this paper`);
      error.statusCode = 409;
      throw error;
    }
  }

  const chapter = await Chapter.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('paper_id', 'title subject access_level');

  if (!chapter) {
    const error = new Error('Chapter not found');
    error.statusCode = 404;
    throw error;
  }
  return chapter;
};

const deleteChapter = async (id) => {
  // Check if topics exist
  const topicCount = await Topic.countDocuments({ chapter_id: id });
  if (topicCount > 0) {
    const error = new Error(
      `Cannot delete chapter. There are ${topicCount} topics associated with it. Please remove or reassign them first.`
    );
    error.statusCode = 400;
    throw error;
  }
  const chapter = await Chapter.findByIdAndDelete(id);
  if (!chapter) {
    const error = new Error('Chapter not found');
    error.statusCode = 404;
    throw error;
  }
  return chapter;
};

// ==================== TOPIC SERVICES ====================

const getTopics = async (filter = {}) => {
  return await Topic.find(filter).populate('chapter_id', 'title chapter_no paper_id').sort({ topic_no: 1 });
};

const getTopicById = async (id, filter = {}) => {
  const topic = await Topic.findOne({ _id: id, ...filter }).populate('chapter_id', 'title chapter_no paper_id');
  if (!topic) {
    const error = new Error('Topic not found');
    error.statusCode = 404;
    throw error;
  }
  return topic;
};

const createTopic = async ({ chapter_id, topic_no, title, description, status }) => {
  // Validate parent chapter exists
  const chapter = await Chapter.findById(chapter_id);
  if (!chapter) {
    const error = new Error('Associated chapter not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate duplicate topic_no within chapter
  const existing = await Topic.findOne({ chapter_id, topic_no });
  if (existing) {
    const error = new Error(`Topic ${topic_no} already exists in this chapter`);
    error.statusCode = 409;
    throw error;
  }

  return await Topic.create({
    chapter_id,
    topic_no,
    title,
    description: description || '',
    status: status || 'published',
  });
};

const updateTopic = async (id, updateData) => {
  if (updateData.topic_no && updateData.chapter_id) {
    const existing = await Topic.findOne({
      _id: { $ne: id },
      chapter_id: updateData.chapter_id,
      topic_no: updateData.topic_no,
    });
    if (existing) {
      const error = new Error(`Topic ${updateData.topic_no} already exists in this chapter`);
      error.statusCode = 409;
      throw error;
    }
  }

  const topic = await Topic.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('chapter_id', 'title chapter_no paper_id');

  if (!topic) {
    const error = new Error('Topic not found');
    error.statusCode = 404;
    throw error;
  }
  return topic;
};

const deleteTopic = async (id) => {
  const topic = await Topic.findByIdAndDelete(id);
  if (!topic) {
    const error = new Error('Topic not found');
    error.statusCode = 404;
    throw error;
  }
  return topic;
};

// ==================== HIERARCHICAL CATALOGUE SERVICE ====================

const getFullCatalogue = async (isAdmin = false) => {
  const paperFilter = isAdmin ? {} : { status: 'published' };
  const chapterFilter = isAdmin ? {} : { status: 'published' };
  const topicFilter = isAdmin ? {} : { status: 'published' };

  const [papers, chapters, topics] = await Promise.all([
    Paper.find(paperFilter).sort({ title: 1 }).lean(),
    Chapter.find(chapterFilter).sort({ chapter_no: 1 }).lean(),
    Topic.find(topicFilter).sort({ topic_no: 1 }).lean(),
  ]);

  // Group topics by chapter_id
  const topicsByChapter = {};
  topics.forEach((t) => {
    const chId = t.chapter_id.toString();
    if (!topicsByChapter[chId]) topicsByChapter[chId] = [];
    topicsByChapter[chId].push(t);
  });

  // Group chapters by paper_id and embed topics
  const chaptersByPaper = {};
  chapters.forEach((ch) => {
    const pId = ch.paper_id.toString();
    if (!chaptersByPaper[pId]) chaptersByPaper[pId] = [];
    chaptersByPaper[pId].push({
      ...ch,
      topics: topicsByChapter[ch._id.toString()] || [],
    });
  });

  // Embed chapters into papers
  return papers.map((paper) => ({
    ...paper,
    chapters: chaptersByPaper[paper._id.toString()] || [],
  }));
};

module.exports = {
  // Papers
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  // Chapters
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  // Topics
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  // Hierarchical
  getFullCatalogue,
};
