import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DoodleBackground, DoodleBackgroundLight } from '../components/DoodleBackground';

export const HomePage = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-3xl mx-auto px-4 py-16">
        <DoodleBackground />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored for HSC &amp; Medical/University Admission</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E293B] tracking-tight leading-tight mt-4">
            Master Biology with{' '}
            <span className="bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#0F766E] bg-clip-text text-transparent">
              Structured Learning
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed mt-4">
            BioLearn BD brings textbook chapters, curated topic notes, illustrative diagrams,
            and self-assessment quizzes together in an intuitive, syllabus-aligned platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/catalogue"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#134E4A] text-white font-medium shadow-lg transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Browse Biology Syllabus
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-[#F5F8F4] hover:bg-[#DCEAE3] text-[#1E293B] font-medium border border-[#B8D8CF] transition"
              >
                Create Free Account
              </Link>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className="px-6 py-3 rounded-xl bg-[#F5F8F4] hover:bg-[#DCEAE3] text-[#0F766E] font-medium border border-[#B8D8CF] transition"
              >
                Open Admin Portal
              </Link>
            ) : (
              <Link
                to="/profile"
                className="px-6 py-3 rounded-xl bg-[#F5F8F4] hover:bg-[#DCEAE3] text-[#1E293B] font-medium border border-[#B8D8CF] transition"
              >
                Welcome back, {user?.name}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-[#F5F8F4] border border-[#B8D8CF] shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B]">Paper 1 &amp; Paper 2</h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            Full Botany &amp; Zoology syllabus organized hierarchically: Paper &rarr; Chapter &rarr; Topic for methodical revision.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#F5F8F4] border border-[#B8D8CF] shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B]">Topic Quizzes &amp; Progress</h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            Instant feedback on your learning progress with server-verified quiz scoring and leaderboard rank.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#F5F8F4] border border-[#B8D8CF] shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B]">Curated &amp; Verified Content</h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            Content managed and verified by educators, ensuring error-free terminology and textbook accuracy.
          </p>
        </div>
      </section>

      {/* Key Platform Features */}
      <section className="relative max-w-4xl mx-auto px-4 p-6 rounded-2xl bg-[#F5F8F4] border border-[#B8D8CF] shadow-sm overflow-hidden">
        <DoodleBackgroundLight />
        <div className="relative z-10">
          <h4 className="text-sm font-semibold text-[#0F766E] uppercase tracking-wider mb-4">
            Key Platform Features
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Student Registration &amp; Secure Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Role-Based Access Control (Student &amp; Administrator)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Personalized Student Profile Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Administrator Curriculum Management (Papers, Chapters, Topics)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Hierarchical Syllabus Catalogue (Paper &rarr; Chapter &rarr; Topic)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Real-Time Topic Search and Chapter Browsing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
