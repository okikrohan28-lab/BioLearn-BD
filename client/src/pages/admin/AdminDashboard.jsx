import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getChapters, getTopics } from '../../services/contentService';
import {
  Layers,
  FileText,
  Bookmark,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ papers: 0, chapters: 0, topics: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadStats = async () => {
      try {
        const [papersRes, chaptersRes, topicsRes] = await Promise.all([
          getPapers(),
          getChapters(),
          getTopics(),
        ]);
        if (!ignore) {
          setStats({
            papers: papersRes.data?.length || 0,
            chapters: chaptersRes.data?.length || 0,
            topics: topicsRes.data?.length || 0,
          });
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load administrative statistics.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadStats();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Curriculum Management Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain Biology 1st and 2nd Paper content, chapters, and topic taxonomies.
          </p>
        </div>

        <Link
          to="/catalogue"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <span>Preview Student Catalogue</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Papers Stat */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Biology Papers
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? '...' : stats.papers}
            </div>
            <p className="text-xs text-slate-400 mt-1">Botany and Zoology syllabi</p>
          </div>
          <div className="pt-2 border-t border-slate-750 flex items-center justify-between">
            <Link
              to="/admin/papers"
              className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1"
            >
              Manage Papers &rarr;
            </Link>
          </div>
        </div>

        {/* Chapters Stat */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Chapters
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? '...' : stats.chapters}
            </div>
            <p className="text-xs text-slate-400 mt-1">Unique chapter numbers enforced per paper</p>
          </div>
          <div className="pt-2 border-t border-slate-750 flex items-center justify-between">
            <Link
              to="/admin/chapters"
              className="text-xs font-medium text-teal-400 hover:underline flex items-center gap-1"
            >
              Manage Chapters &rarr;
            </Link>
          </div>
        </div>

        {/* Topics Stat */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Topics
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? '...' : stats.topics}
            </div>
            <p className="text-xs text-slate-400 mt-1">Structured learning topics organized under chapters</p>
          </div>
          <div className="pt-2 border-t border-slate-750 flex items-center justify-between">
            <Link
              to="/admin/topics"
              className="text-xs font-medium text-cyan-400 hover:underline flex items-center gap-1"
            >
              Manage Topics &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          to="/admin/papers"
          className="p-5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Add or Edit Paper</h4>
            <p className="text-xs text-slate-400">Configure title, subject, and access level</p>
          </div>
        </Link>

        <Link
          to="/admin/chapters"
          className="p-5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Add or Edit Chapter</h4>
            <p className="text-xs text-slate-400">Organize chapters under specific papers</p>
          </div>
        </Link>

        <Link
          to="/admin/topics"
          className="p-5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Add or Edit Topic</h4>
            <p className="text-xs text-slate-400">Break down chapters into measurable lessons</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
