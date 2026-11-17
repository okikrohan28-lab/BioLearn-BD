import { useState, useEffect } from 'react';
import {
  getPapers,
  getChapters,
  getTopics,
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuestions,
  createQuestion,
  createBulkQuestions,
  updateQuestion,
  deleteQuestion,
} from '../../services/contentService';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  HelpCircle,
  ListPlus,
} from 'lucide-react';

export const ManageQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    quiz_type: 'topic',
    topic_id: '',
    chapter_id: '',
    time_limit_minutes: 15,
    total_marks: 10,
    pass_marks: 5,
    status: 'published',
  });
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // Question Management Modal State
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    options: [
      { option_label: 'A', option_text: '' },
      { option_label: 'B', option_text: '' },
      { option_label: 'C', option_text: '' },
      { option_label: 'D', option_text: '' },
    ],
    correct_answer: 'A',
    positive_marks: 1,
    explanation: '',
    order: 1,
  });
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  // Bulk Questions Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const [qRes, pRes, chRes, tRes] = await Promise.all([
        getQuizzes({}),
        getPapers(),
        getChapters(),
        getTopics(),
      ]);
      setQuizzes(qRes.data || []);
      setPapers(pRes.data || []);
      setChapters(chRes.data || []);
      setTopics(tRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openCreateQuizModal = () => {
    setEditingQuiz(null);
    setQuizFormData({
      title: '',
      description: '',
      quiz_type: 'topic',
      topic_id: topics[0]?._id || '',
      chapter_id: chapters[0]?._id || '',
      time_limit_minutes: 15,
      total_marks: 10,
      pass_marks: 5,
      status: 'published',
    });
    setIsQuizModalOpen(true);
  };

  const openEditQuizModal = (q) => {
    setEditingQuiz(q);
    setQuizFormData({
      title: q.title || '',
      description: q.description || '',
      quiz_type: q.quiz_type || 'topic',
      topic_id: q.topic_id?._id || q.topic_id || '',
      chapter_id: q.chapter_id?._id || q.chapter_id || '',
      time_limit_minutes: q.time_limit_minutes || '',
      total_marks: q.total_marks || 0,
      pass_marks: q.pass_marks || '',
      status: q.status || 'published',
    });
    setIsQuizModalOpen(true);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setQuizSubmitting(true);
    setError('');
    setNotification('');

    try {
      const payload = {
        title: quizFormData.title,
        description: quizFormData.description,
        quiz_type: quizFormData.quiz_type,
        time_limit_minutes: quizFormData.time_limit_minutes ? Number(quizFormData.time_limit_minutes) : null,
        total_marks: Number(quizFormData.total_marks) || 0,
        pass_marks: quizFormData.pass_marks ? Number(quizFormData.pass_marks) : null,
        status: quizFormData.status,
      };

      if (quizFormData.quiz_type === 'topic') {
        if (!quizFormData.topic_id) throw new Error('Please select an associated Topic.');
        payload.topic_id = quizFormData.topic_id;
        payload.chapter_id = null;
      } else if (quizFormData.quiz_type === 'chapter') {
        if (!quizFormData.chapter_id) throw new Error('Please select an associated Chapter.');
        payload.chapter_id = quizFormData.chapter_id;
        payload.topic_id = null;
      } else {
        payload.topic_id = null;
        payload.chapter_id = null;
      }

      if (editingQuiz) {
        await updateQuiz(editingQuiz._id, payload);
        setNotification(`Quiz "${payload.title}" updated successfully.`);
      } else {
        await createQuiz(payload);
        setNotification(`Quiz "${payload.title}" created successfully.`);
      }

      setIsQuizModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save quiz.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (q) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${q.title}"? Associated questions will also be deleted.`)) return;

    setError('');
    try {
      await deleteQuiz(q._id);
      setNotification(`Quiz "${q.title}" deleted.`);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete quiz.');
    }
  };

  // ==================== QUESTION MANAGEMENT ====================
  const openQuestionsManager = async (q) => {
    setActiveQuizForQuestions(q);
    setQuestionsLoading(true);
    setError('');
    try {
      const res = await getQuestions(q._id);
      setQuestions(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch questions for this quiz.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const openCreateQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      question_text: '',
      options: [
        { option_label: 'A', option_text: '' },
        { option_label: 'B', option_text: '' },
        { option_label: 'C', option_text: '' },
        { option_label: 'D', option_text: '' },
      ],
      correct_answer: 'A',
      positive_marks: 1,
      explanation: '',
      order: questions.length + 1,
    });
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      question_text: question.question_text || '',
      options: question.options && question.options.length > 0
        ? question.options
        : [
            { option_label: 'A', option_text: '' },
            { option_label: 'B', option_text: '' },
            { option_label: 'C', option_text: '' },
            { option_label: 'D', option_text: '' },
          ],
      correct_answer: question.correct_answer || 'A',
      positive_marks: question.positive_marks || 1,
      explanation: question.explanation || '',
      order: question.order || 1,
    });
    setIsQuestionModalOpen(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionFormData.question_text.trim()) {
      setError('Question text is required.');
      return;
    }

    setQuestionSubmitting(true);
    try {
      const payload = {
        quiz_id: activeQuizForQuestions._id,
        ...questionFormData,
        positive_marks: Number(questionFormData.positive_marks) || 1,
        order: Number(questionFormData.order) || 1,
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, payload);
      } else {
        await createQuestion(payload);
      }

      setIsQuestionModalOpen(false);
      // Refresh questions list
      const res = await getQuestions(activeQuizForQuestions._id);
      setQuestions(res.data || []);
      // Refresh quizzes to update total marks
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save question.');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (q) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(q._id);
      const res = await getQuestions(activeQuizForQuestions._id);
      setQuestions(res.data || []);
      fetchQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete question.');
    }
  };

  const createEmptyBulkQuestion = () => ({
    id: Math.random().toString(36).substring(2, 9),
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    positive_marks: 1,
    explanation: '',
  });

  const openBulkQuestionModal = () => {
    setBulkError('');
    setBulkQuestions([createEmptyBulkQuestion(), createEmptyBulkQuestion()]);
    setIsBulkModalOpen(true);
  };

  const addBulkQuestionCard = () => {
    setBulkQuestions((prev) => [...prev, createEmptyBulkQuestion()]);
  };

  const removeBulkQuestionCard = (index) => {
    if (bulkQuestions.length <= 1) return;
    setBulkQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBulkQuestionField = (index, field, value) => {
    setBulkQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');

    // Validate each question
    for (let i = 0; i < bulkQuestions.length; i++) {
      const q = bulkQuestions[i];
      const qNum = i + 1;
      if (!q.question_text.trim()) {
        setBulkError(`Question #${qNum}: Question text is required.`);
        return;
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        setBulkError(`Question #${qNum}: All 4 options (A, B, C, D) must have text.`);
        return;
      }
    }

    setBulkSubmitting(true);
    try {
      const payload = bulkQuestions.map((q, idx) => ({
        question_text: q.question_text.trim(),
        options: [
          { option_label: 'A', option_text: q.option_a.trim() },
          { option_label: 'B', option_text: q.option_b.trim() },
          { option_label: 'C', option_text: q.option_c.trim() },
          { option_label: 'D', option_text: q.option_d.trim() },
        ],
        correct_answer: q.correct_answer,
        positive_marks: Number(q.positive_marks) || 1,
        explanation: q.explanation.trim(),
        order: questions.length + idx + 1,
      }));

      const res = await createBulkQuestions(activeQuizForQuestions._id, payload);
      setNotification(`Successfully added ${res.data?.count || payload.length} questions to quiz.`);
      setIsBulkModalOpen(false);
      openQuestionsManager(activeQuizForQuestions);
      fetchQuizzes();
    } catch (err) {
      setBulkError(err.response?.data?.message || err.message || 'Failed to submit bulk questions.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filteredQuizzes = filterType === 'all'
    ? quizzes
    : quizzes.filter((q) => q.quiz_type === filterType);

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4" style={{ color: '#1E293B' }}>
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: '#B8D8CF' }}>
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Assessment & Question Authoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Manage Quizzes & Question Bank
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Author topic quizzes, chapter-end evaluations, and weekly challenge assessments with server-verified scoring.
          </p>
        </div>

        <button
          onClick={openCreateQuizModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
          style={{ backgroundColor: '#0F766E' }}
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: '#B8D8CF' }}>
        {[
          { id: 'all', label: 'All Quizzes' },
          { id: 'topic', label: 'Topic Quizzes' },
          { id: 'chapter', label: 'Chapter Quizzes' },
          { id: 'weekly', label: 'Weekly Challenge Quizzes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: '#475569' }}>Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border space-y-3 max-w-md mx-auto" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <ClipboardList className="w-10 h-10 mx-auto" style={{ color: '#8BBDB0' }} />
          <h3 className="text-sm font-bold" style={{ color: '#134E4A' }}>No Quizzes Found</h3>
          <p className="text-xs" style={{ color: '#475569' }}>
            No quizzes match this filter. Create one to attach MCQs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((q) => {
            return (
              <div
                key={q._id}
                className="rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
                style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                    >
                      {q.quiz_type} Quiz
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        q.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: '#475569' }}>
                        {q.description}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl border text-xs space-y-1" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
                    <div className="flex justify-between">
                      <span style={{ color: '#475569' }}>Total Marks:</span>
                      <span className="font-bold text-[#0F766E]">{q.total_marks || 0}</span>
                    </div>
                    {q.time_limit_minutes && (
                      <div className="flex justify-between">
                        <span style={{ color: '#475569' }}>Time Limit:</span>
                        <span className="font-medium text-[#1E293B]">{q.time_limit_minutes} min</span>
                      </div>
                    )}
                    {q.pass_marks != null && (
                      <div className="flex justify-between">
                        <span style={{ color: '#475569' }}>Passing Threshold:</span>
                        <span className="font-medium text-[#1E293B]">{q.pass_marks} marks</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: '#B8D8CF' }}>
                  <button
                    onClick={() => openQuestionsManager(q)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Manage Questions</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditQuizModal(q)}
                      className="p-1.5 rounded-lg border text-slate-600 hover:text-[#0F766E] hover:bg-white transition cursor-pointer"
                      style={{ borderColor: '#B8D8CF' }}
                      title="Edit Quiz Settings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(q)}
                      className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      style={{ borderColor: '#FECACA' }}
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {editingQuiz ? 'Edit Quiz Parameters' : 'Create New Assessment'}
              </h3>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuizSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  value={quizFormData.title}
                  onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                  placeholder="e.g. Chapter 1 End Assessment - Cell & Genetics"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={quizFormData.description}
                  onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                  placeholder="Instructions for students regarding marks and time limit..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              {/* Quiz Type Selector */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Assessment Type *
                </label>
                <select
                  value={quizFormData.quiz_type}
                  onChange={(e) => setQuizFormData({ ...quizFormData, quiz_type: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                >
                  <option value="topic">Topic Quiz (Attached to single Topic)</option>
                  <option value="chapter">Chapter Quiz (Attached to single Chapter)</option>
                  <option value="weekly">Weekly Challenge Assessment</option>
                </select>
              </div>

              {/* Conditional Target: Topic vs Chapter */}
              {quizFormData.quiz_type === 'topic' && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Select Associated Topic *
                  </label>
                  <select
                    required
                    value={quizFormData.topic_id}
                    onChange={(e) => setQuizFormData({ ...quizFormData, topic_id: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="">-- Choose Topic --</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        Topic {t.topic_no}: {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {quizFormData.quiz_type === 'chapter' && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Select Associated Chapter *
                  </label>
                  <select
                    required
                    value={quizFormData.chapter_id}
                    onChange={(e) => setQuizFormData({ ...quizFormData, chapter_id: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="">-- Choose Chapter --</option>
                    {chapters.map((c) => (
                      <option key={c._id} value={c._id}>
                        Ch. {c.chapter_no}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quizFormData.total_marks}
                    onChange={(e) => setQuizFormData({ ...quizFormData, total_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quizFormData.time_limit_minutes}
                    onChange={(e) => setQuizFormData({ ...quizFormData, time_limit_minutes: e.target.value })}
                    placeholder="No limit"
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Pass Marks
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quizFormData.pass_marks}
                    onChange={(e) => setQuizFormData({ ...quizFormData, pass_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Publication Status
                </label>
                <select
                  value={quizFormData.status}
                  onChange={(e) => setQuizFormData({ ...quizFormData, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                >
                  <option value="published">Published (Visible to students)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: '#B8D8CF' }}>
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-100"
                  style={{ borderColor: '#B8D8CF', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quizSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#0F766E' }}
                >
                  {quizSubmitting ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== QUESTIONS MANAGER DRAWER / MODAL ==================== */}
      {activeQuizForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-6 border shadow-2xl max-h-[92vh] flex flex-col"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 shrink-0" style={{ borderColor: '#B8D8CF' }}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                  Question Bank Editor
                </span>
                <h3 className="text-xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                  {activeQuizForQuestions.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                  {questions.length} questions attached &bull; Correct answers remain hidden from students until submission.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openCreateQuestionModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
                  style={{ backgroundColor: '#0F766E' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>

                <button
                  onClick={openBulkQuestionModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
                  style={{ backgroundColor: '#134E4A' }}
                >
                  <ListPlus className="w-4 h-4" />
                  <span>Add Multiple Questions</span>
                </button>

                <button
                  onClick={() => setActiveQuizForQuestions(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {questionsLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 mx-auto" style={{ color: '#8BBDB0' }} />
                  <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>No Questions In This Quiz</h4>
                  <p className="text-xs" style={{ color: '#475569' }}>
                    Click "Add Question" above to add your first multiple choice question.
                  </p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="p-4 sm:p-5 rounded-2xl border bg-white space-y-3 shadow-xs"
                    style={{ borderColor: '#B8D8CF' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-[#0F766E]"
                          style={{ backgroundColor: '#DCEAE3' }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{q.question_text}</h4>
                          <span className="text-[11px] font-semibold text-[#0F766E]">
                            +{q.positive_marks} Marks
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditQuestionModal(q)}
                          className="p-1.5 rounded-lg border text-slate-600 hover:text-[#0F766E] transition cursor-pointer"
                          style={{ borderColor: '#B8D8CF' }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q)}
                          className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          style={{ borderColor: '#FECACA' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(q.options || []).map((opt) => {
                        const isCorrect = q.correct_answer === opt.option_label;
                        return (
                          <div
                            key={opt.option_label}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>
                              <strong>{opt.option_label}.</strong> {opt.option_text}
                            </span>
                            {isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                                Answer Key
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-xl text-xs bg-slate-50 border text-slate-600 border-slate-200">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE/EDIT QUESTION MODAL ==================== */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {editingQuestion ? 'Edit MCQ Question' : 'Add MCQ Question'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Question Stem / Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                  placeholder="e.g. Which organelle is responsible for ATP synthesis in animal cells?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold" style={{ color: '#475569' }}>
                  Multiple Choice Options *
                </label>
                {questionFormData.options.map((opt, i) => (
                  <div key={opt.option_label} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {opt.option_label}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt.option_text}
                      onChange={(e) => {
                        const newOpts = [...questionFormData.options];
                        newOpts[i].option_text = e.target.value;
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }}
                      placeholder={`Option ${opt.option_label}`}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
                      style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Correct Answer Key *
                  </label>
                  <select
                    value={questionFormData.correct_answer}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none font-bold text-[#0F766E]"
                    style={{ borderColor: '#B8D8CF' }}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Positive Marks *
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    required
                    value={questionFormData.positive_marks}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, positive_marks: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Scientific Explanation (Shown after submission)
                </label>
                <textarea
                  rows={2}
                  value={questionFormData.explanation}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  placeholder="e.g. Mitochondria produce cellular energy through oxidative phosphorylation..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: '#B8D8CF' }}>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-100"
                  style={{ borderColor: '#B8D8CF', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={questionSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#0F766E' }}
                >
                  {questionSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BULK QUESTIONS MODAL ==================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-4xl rounded-3xl p-6 sm:p-8 space-y-5 border shadow-2xl max-h-[92vh] flex flex-col"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 shrink-0" style={{ borderColor: '#B8D8CF' }}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                  Batch Creation Tool
                </span>
                <h3 className="text-xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                  Add Multiple Questions at Once
                </h3>
                <p className="text-xs text-[#475569] mt-0.5">
                  Target Quiz: <strong className="text-[#134E4A]">{activeQuizForQuestions?.title}</strong> &bull; Total questions: {bulkQuestions.length}
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkError && (
              <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{bulkError}</span>
              </div>
            )}

            {/* Questions Form Container */}
            <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto space-y-6 pr-1 flex flex-col justify-between">
              <div className="space-y-6">
                {bulkQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-2xl border bg-white space-y-4 shadow-xs transition"
                    style={{ borderColor: '#B8D8CF' }}
                  >
                    {/* Question Card Header */}
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#E2E8F0' }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-[#0F766E]"
                          style={{ backgroundColor: '#DCEAE3' }}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#134E4A]">Question Entry {idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Marks: {q.positive_marks}
                        </span>
                        {bulkQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBulkQuestionCard(idx)}
                            className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer text-xs flex items-center gap-1"
                            style={{ borderColor: '#FECACA' }}
                            title="Remove this question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                        Question Text *
                      </label>
                      <input
                        type="text"
                        required
                        value={q.question_text}
                        onChange={(e) => updateBulkQuestionField(idx, 'question_text', e.target.value)}
                        placeholder="e.g. Which organelle is responsible for cellular respiration?"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                        style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                      />
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold mb-1 text-[#0F766E]">Option A *</label>
                        <input
                          type="text"
                          required
                          value={q.option_a}
                          onChange={(e) => updateBulkQuestionField(idx, 'option_a', e.target.value)}
                          placeholder="Text for option A"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
                          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1 text-[#0F766E]">Option B *</label>
                        <input
                          type="text"
                          required
                          value={q.option_b}
                          onChange={(e) => updateBulkQuestionField(idx, 'option_b', e.target.value)}
                          placeholder="Text for option B"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
                          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1 text-[#0F766E]">Option C *</label>
                        <input
                          type="text"
                          required
                          value={q.option_c}
                          onChange={(e) => updateBulkQuestionField(idx, 'option_c', e.target.value)}
                          placeholder="Text for option C"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
                          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1 text-[#0F766E]">Option D *</label>
                        <input
                          type="text"
                          required
                          value={q.option_d}
                          onChange={(e) => updateBulkQuestionField(idx, 'option_d', e.target.value)}
                          placeholder="Text for option D"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
                          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                        />
                      </div>
                    </div>

                    {/* Answer Key, Marks, Explanation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                          Correct Answer *
                        </label>
                        <select
                          value={q.correct_answer}
                          onChange={(e) => updateBulkQuestionField(idx, 'correct_answer', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none font-bold text-[#0F766E]"
                          style={{ borderColor: '#B8D8CF' }}
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                          Marks *
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          required
                          value={q.positive_marks}
                          onChange={(e) => updateBulkQuestionField(idx, 'positive_marks', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                          Optional Explanation
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => updateBulkQuestionField(idx, 'explanation', e.target.value)}
                          placeholder="Post-submission rationale"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Another Question Button */}
                <button
                  type="button"
                  onClick={addBulkQuestionCard}
                  className="w-full py-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold text-[#0F766E] hover:bg-white transition cursor-pointer"
                  style={{ borderColor: '#8BBDB0' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Question</span>
                </button>
              </div>

              {/* Bottom Submit Actions */}
              <div className="flex items-center justify-between pt-4 border-t shrink-0" style={{ borderColor: '#B8D8CF' }}>
                <span className="text-xs font-semibold text-[#475569]">
                  Total {bulkQuestions.length} questions ready to submit
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-100 cursor-pointer"
                    style={{ borderColor: '#B8D8CF', color: '#475569' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>{bulkSubmitting ? 'Saving All...' : `Submit All (${bulkQuestions.length}) Questions`}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
