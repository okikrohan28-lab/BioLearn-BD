import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tailored for HSC & Medical/University Admission</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Master Biology with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Structured Learning
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          BioLearn BD brings textbook chapters, curated topic notes, illustrative diagrams,
          and self-assessment quizzes together in an intuitive, syllabus-aligned platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/catalogue"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-950 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Browse Biology Syllabus
            <ArrowRight className="w-4 h-4" />
          </Link>

          {!isAuthenticated ? (
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium border border-slate-700 transition"
            >
              Create Free Account
            </Link>
          ) : isAdmin ? (
            <Link
              to="/admin"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium border border-slate-700 transition"
            >
              Open Admin Portal
            </Link>
          ) : (
            <Link
              to="/profile"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition"
            >
              Welcome back, {user?.name}
            </Link>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Paper 1 & Paper 2</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Full Botany & Zoology syllabus organized hierarchically: Paper &rarr; Chapter &rarr; Topic for methodical revision.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Topic Quizzes & Progress</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Instant feedback on your learning progress with server-verified quiz scoring and leaderboard rank.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Curated & Verified Content</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Content managed and verified by educators, ensuring error-free terminology and textbook accuracy.
          </p>
        </div>
      </section>

      {/* Key Platform Features */}
      <section className="max-w-4xl mx-auto px-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Key Platform Features
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Student Registration & Secure Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role-Based Access Control (Student & Administrator)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Personalized Student Profile Management</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Administrator Curriculum Management (Papers, Chapters, Topics)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hierarchical Syllabus Catalogue (Paper &rarr; Chapter &rarr; Topic)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-Time Topic Search and Chapter Browsing</span>
          </div>
        </div>
      </section>
    </div>
  );
};
