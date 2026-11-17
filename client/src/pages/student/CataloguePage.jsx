import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCatalogue } from '../../services/contentService';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  FileText,
  Bookmark,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export const CataloguePage = () => {
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCatalogueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCatalogue();
      const data = res.data || [];
      setCatalogue(data);
      if (data.length > 0) {
        setSelectedPaperId(data[0]._id);
        // Expand first chapter by default
        if (data[0].chapters?.length > 0) {
          setExpandedChapters({ [data[0].chapters[0]._id]: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load biology catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogueData();
  }, []);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const selectedPaper = catalogue.find((p) => p._id === selectedPaperId) || catalogue[0];

  // Filter chapters/topics by search query if present
  const filterChapters = (chapters = []) => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters
      .map((ch) => {
        const matchesChapter = ch.title.toLowerCase().includes(q) || (ch.description && ch.description.toLowerCase().includes(q));
        const matchedTopics = (ch.topics || []).filter(
          (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
        );
        if (matchesChapter || matchedTopics.length > 0) {
          return {
            ...ch,
            topics: matchesChapter ? ch.topics : matchedTopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const visibleChapters = selectedPaper ? filterChapters(selectedPaper.chapters) : [];

  return (
    <div className="relative min-h-screen py-8" style={{ backgroundColor: '#EAF3ED', color: '#1E293B' }}>
      <DoodleBackgroundLight />

      <div className="relative z-10 max-w-7xl mx-auto px-4 space-y-8">
        {/* Catalogue Header */}
        <div className="border-b pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ borderColor: '#B8D8CF' }}>
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
              style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>HSC National Biology Syllabus</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
              Biology Curriculum Catalogue
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
              Methodical navigation: Paper &rarr; Chapter &rarr; Topic lessons with notes, diagrams, and quizzes.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters or topics..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-2xs"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
            <p className="text-xs" style={{ color: '#475569' }}>Loading syllabus catalogue...</p>
          </div>
        ) : error ? (
          <div
            className="p-6 rounded-2xl border text-center space-y-3 max-w-lg mx-auto"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
          >
            <AlertCircle className="w-8 h-8 mx-auto" />
            <h3 className="text-sm font-bold">Catalogue Unavailable</h3>
            <p className="text-xs opacity-90">{error}</p>
            <button
              onClick={fetchCatalogueData}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs cursor-pointer"
              style={{ backgroundColor: '#0F766E' }}
            >
              Retry Connection
            </button>
          </div>
        ) : catalogue.length === 0 ? (
          <div
            className="p-12 text-center rounded-3xl border space-y-3 max-w-md mx-auto"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <Layers className="w-10 h-10 mx-auto" style={{ color: '#8BBDB0' }} />
            <h3 className="text-base font-bold" style={{ color: '#134E4A' }}>No Papers Published Yet</h3>
            <p className="text-xs" style={{ color: '#475569' }}>
              The administrator has not published any Biology papers yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Paper Navigation Tabs (Left Sidebar) */}
            <div className="space-y-3 lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider px-2 text-[#0F766E]">
                Select Biology Paper
              </h3>
              <div className="space-y-2">
                {catalogue.map((paper) => {
                  const isSelected = paper._id === selectedPaperId;
                  const chapterCount = paper.chapters?.length || 0;
                  return (
                    <button
                      key={paper._id}
                      onClick={() => {
                        setSelectedPaperId(paper._id);
                        if (paper.chapters?.length > 0) {
                          setExpandedChapters({ [paper.chapters[0]._id]: true });
                        }
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 shadow-2xs ${
                        isSelected
                          ? 'border-[#0F766E] shadow-sm'
                          : 'hover:bg-white/80'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#F5F8F4' : '#FFFFFF',
                        borderColor: isSelected ? '#0F766E' : '#B8D8CF',
                      }}
                    >
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: isSelected ? '#0F766E' : '#134E4A' }}>
                          <BookOpen className={`w-4 h-4 ${isSelected ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                          <span>{paper.title}</span>
                        </div>
                        <p className="text-[11px] mt-1 line-clamp-1" style={{ color: '#475569' }}>
                          {paper.description || `${paper.subject} curriculum`}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                          >
                            {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase font-semibold">
                            {paper.access_level}
                          </span>
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapters and Topics Accordion (Right Content) */}
            <div className="space-y-4 lg:col-span-3">
              <div
                className="p-5 rounded-2xl border flex items-center justify-between shadow-2xs"
                style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
              >
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                    <span>{selectedPaper?.title}</span>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                    >
                      {visibleChapters.length} Chapters
                    </span>
                  </h2>
                  {selectedPaper?.description && (
                    <p className="text-xs mt-1" style={{ color: '#475569' }}>{selectedPaper.description}</p>
                  )}
                </div>
              </div>

              {visibleChapters.length === 0 ? (
                <div
                  className="p-8 text-center rounded-2xl border space-y-2"
                  style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
                >
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-700">No chapters found</h4>
                  <p className="text-xs text-slate-500">
                    {searchQuery ? 'Try adjusting your search keywords.' : 'No chapters have been added to this paper yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleChapters.map((chapter) => {
                    const isExpanded = Boolean(expandedChapters[chapter._id]);
                    const topics = chapter.topics || [];

                    return (
                      <div
                        key={chapter._id}
                        className="rounded-2xl border overflow-hidden transition shadow-2xs"
                        style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
                      >
                        {/* Chapter Row Toggle */}
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <button
                            onClick={() => toggleChapter(chapter._id)}
                            className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                            >
                              {chapter.chapter_no}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: '#134E4A' }}>
                                <span>Chapter {chapter.chapter_no}: {chapter.title}</span>
                              </h4>
                              {chapter.description && (
                                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#475569' }}>{chapter.description}</p>
                              )}
                            </div>
                          </button>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            {/* Direct Chapter Page link */}
                            <Link
                              to={`/chapter/${chapter._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-[#0F766E] bg-white border border-[#B8D8CF] hover:bg-[#DCEAE3] transition shadow-2xs"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Chapter Quizzes</span>
                            </Link>

                            <button
                              onClick={() => toggleChapter(chapter._id)}
                              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0F766E] transition cursor-pointer"
                            >
                              <span className="font-mono">{topics.length} topics</span>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[#0F766E]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Topics List */}
                        {isExpanded && (
                          <div
                            className="border-t p-4 space-y-2.5"
                            style={{ borderColor: '#B8D8CF', backgroundColor: '#FFFFFF' }}
                          >
                            {topics.length === 0 ? (
                              <div className="py-4 text-center text-xs text-slate-400">
                                No topics published under this chapter yet.
                              </div>
                            ) : (
                              topics.map((topic) => (
                                <Link
                                  key={topic._id}
                                  to={`/topic/${topic._id}`}
                                  className="p-3.5 rounded-xl border flex items-center justify-between gap-3 transition hover:shadow-xs group cursor-pointer"
                                  style={{ backgroundColor: '#F5F8F4', borderColor: '#B8D8CF' }}
                                >
                                  <div className="flex items-start gap-3">
                                    <Bookmark className="w-4 h-4 text-[#0F766E] mt-0.5 shrink-0 group-hover:scale-110 transition" />
                                    <div>
                                      <h5 className="text-xs font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                                        Topic {topic.topic_no}: {topic.title}
                                      </h5>
                                      {topic.description && (
                                        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#475569' }}>
                                          {topic.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] group-hover:translate-x-1 transition shrink-0">
                                    <span>Open Lesson</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
