import { useState, useEffect } from 'react';
import { getCatalogue } from '../../services/contentService';
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
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      {/* Catalogue Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HSC National Biology Syllabus</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Biology Curriculum Catalogue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse through Botany and Zoology papers, structured chapters, and core topics.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters or topics..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading syllabus catalogue...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
          <h3 className="text-base font-bold text-white">Catalogue Unavailable</h3>
          <p className="text-xs text-rose-300/80">{error}</p>
          <button
            onClick={fetchCatalogueData}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : catalogue.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3 max-w-md mx-auto">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Papers Published Yet</h3>
          <p className="text-xs text-slate-400">
            The administrator has not published any Biology papers yet. Check back soon or seed sample data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Paper Navigation Tabs (Left Sidebar) */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
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
                    className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-600 text-white shadow-md'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <BookOpen className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>{paper.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {paper.description || `${paper.subject} curriculum`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                          {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 uppercase">
                          {paper.access_level}
                        </span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapters and Topics Accordion (Right Content) */}
          <div className="space-y-4 lg:col-span-3">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedPaper?.title}</span>
                  <span className="text-xs font-normal text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
                    {visibleChapters.length} Chapters
                  </span>
                </h2>
                {selectedPaper?.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{selectedPaper.description}</p>
                )}
              </div>
            </div>

            {visibleChapters.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No chapters found</h4>
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
                      className="rounded-xl border border-slate-800 bg-slate-850/60 overflow-hidden transition"
                    >
                      {/* Chapter Row Toggle */}
                      <button
                        onClick={() => toggleChapter(chapter._id)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {chapter.chapter_no}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Chapter {chapter.chapter_no}: {chapter.title}</span>
                            </h4>
                            {chapter.description && (
                              <p className="text-xs text-slate-400 mt-0.5">{chapter.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-400 font-mono">
                            {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </button>

                      {/* Topics List */}
                      {isExpanded && (
                        <div className="border-t border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
                          {topics.length === 0 ? (
                            <div className="py-4 text-center text-xs text-slate-500">
                              No topics published under this chapter yet.
                            </div>
                          ) : (
                            topics.map((topic) => (
                              <div
                                key={topic._id}
                                className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-start justify-between gap-3 hover:border-slate-700 transition"
                              >
                                <div className="flex items-start gap-2.5">
                                  <Bookmark className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                  <div>
                                    <h5 className="text-xs font-semibold text-white">
                                      Topic {topic.topic_no}: {topic.title}
                                    </h5>
                                    {topic.description && (
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        {topic.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
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
  );
};
