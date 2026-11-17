import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getPapers,
  getChapters,
  getTopics,
  getQuizzes,
  getChallenges,
} from '../../services/contentService';
import {
  Layers,
  FileText,
  Bookmark,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  ClipboardList,
  Trophy,
  ArrowRight,
  Crown,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    papers: 0,
    chapters: 0,
    topics: 0,
    quizzes: 0,
    challenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadStats = async () => {
      try {
        const [papersRes, chaptersRes, topicsRes, quizzesRes, challengesRes] = await Promise.all([
          getPapers(),
          getChapters(),
          getTopics(),
          getQuizzes({}),
          getChallenges(),
        ]);
        if (!ignore) {
          setStats({
            papers: papersRes.data?.length || 0,
            chapters: chaptersRes.data?.length || 0,
            topics: topicsRes.data?.length || 0,
            quizzes: quizzesRes.data?.length || 0,
            challenges: challengesRes.data?.length || 0,
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
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4" style={{ color: '#1E293B' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#B8D8CF' }}>
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Curriculum & Assessment Dashboard
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Maintain Biology 1st & 2nd Paper syllabus hierarchy, study resources, quizzes, and weekly challenges.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Papers Stat */}
        <div className="p-5 rounded-2xl border space-y-3 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">Papers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.papers}
          </div>
          <Link to="/admin/papers" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
            Manage &rarr;
          </Link>
        </div>

        {/* Chapters Stat */}
        <div className="p-5 rounded-2xl border space-y-3 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">Chapters</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.chapters}
          </div>
          <Link to="/admin/chapters" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
            Manage &rarr;
          </Link>
        </div>

        {/* Topics Stat */}
        <div className="p-5 rounded-2xl border space-y-3 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">Topics</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.topics}
          </div>
          <Link to="/admin/topics" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
            Manage &rarr;
          </Link>
        </div>

        {/* Quizzes Stat */}
        <div className="p-5 rounded-2xl border space-y-3 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">Quizzes</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#0F766E', fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.quizzes}
          </div>
          <Link to="/admin/quizzes" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
            Manage &rarr;
          </Link>
        </div>

        {/* Challenges Stat */}
        <div className="p-5 rounded-2xl border space-y-3 shadow-2xs col-span-2 md:col-span-1" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">Weekly Arenas</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-700 bg-amber-100">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.challenges}
          </div>
          <Link to="/admin/challenges" className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1">
            Manage &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
          Administrative Workspaces
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/papers"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Manage Biology Papers
                </h4>
                <p className="text-xs text-[#475569]">Syllabus taxonomy for Paper 1 & 2</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/chapters"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Manage Chapters
                </h4>
                <p className="text-xs text-[#475569]">Unique chapter sequencing per paper</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/topics"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Manage Topics
                </h4>
                <p className="text-xs text-[#475569]">Granular sub-lessons under chapters</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/resources"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Learning Resources
                </h4>
                <p className="text-xs text-[#475569]">Notes, diagrams & YouTube lessons</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/quizzes"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0F766E]" style={{ backgroundColor: '#DCEAE3' }}>
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Quizzes & Questions
                </h4>
                <p className="text-xs text-[#475569]">MCQs, answer keys & mark schemes</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/challenges"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-700 bg-amber-100">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Weekly Challenges
                </h4>
                <p className="text-xs text-[#475569]">Schedule timed competitive tests</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/premium"
            className="p-5 rounded-2xl border transition flex items-center justify-between hover:shadow-xs group cursor-pointer"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-700 bg-amber-100">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E] transition">
                  Premium Subscribers
                </h4>
                <p className="text-xs text-[#475569]">Student subscriptions & payment records</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F766E] group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};
