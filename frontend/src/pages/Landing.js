import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Brain, Upload, BarChart3, Zap,
  CheckCircle, Users, Target, Dna
} from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-6 h-6 text-primary-500" />,
    title: "Semantic AI Matching",
    desc: "Goes beyond keywords — understands meaning using sentence embeddings to find truly matching candidates."
  },
  {
    icon: <Target className="w-6 h-6 text-primary-500" />,
    title: "Skill Gap Analysis",
    desc: "Instantly identifies which required skills a candidate has and what's missing."
  },
  {
    icon: <Dna className="w-6 h-6 text-primary-500" />,
    title: "Resume DNA Profiling",
    desc: "Our unique feature — profiles candidate work style as Builder, Leader, Specialist, or Collaborator."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary-500" />,
    title: "Explainable AI Scoring",
    desc: "Every score comes with a human-readable explanation. No black boxes."
  },
  {
    icon: <Users className="w-6 h-6 text-primary-500" />,
    title: "Candidate Rankings",
    desc: "Automatically rank all applicants for a role. Find your top candidate in seconds."
  },
  {
    icon: <Zap className="w-6 h-6 text-primary-500" />,
    title: "Instant Results",
    desc: "Upload a resume and get a full AI analysis in under 10 seconds."
  }
];

const steps = [
  { step: "01", title: "Post a Job", desc: "Add your job title, description, and required skills." },
  { step: "02", title: "Upload Resumes", desc: "Upload PDF or DOCX resumes. Bulk upload supported." },
  { step: "03", title: "Get AI Analysis", desc: "Our AI scores, ranks, and explains every candidate." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="gradient-bg text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm mb-6">
            <Dna className="w-4 h-4" />
            Introducing Resume DNA Profiling
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Screen Resumes with
            <br />
            <span className="text-sky-300">Real AI Intelligence</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Stop manually reading hundreds of resumes. Our AI semantically matches,
            scores, and ranks candidates — with full explanations of every decision.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Start Screening Free
            </Link>
            <Link
              to="/login"
              className="border border-white/40 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            ✓ Free to use &nbsp; ✓ No credit card &nbsp; ✓ Powered by open-source AI
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Everything you need to hire smarter
            </h2>
            <p className="text-slate-500 text-lg">
              Built for recruiters, HR teams, and startups who value quality over speed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">How it works</h2>
            <p className="text-slate-500">Three steps to find your perfect candidate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{s.step}</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-bg text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to screen smarter?</h2>
          <p className="text-blue-100 mb-8">
            Join recruiters who use ResumeAI to find the right candidates faster.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8 text-center text-sm">
        <p>© 2026 ResumeAI · Built with open-source AI · Free forever</p>
      </footer>
    </div>
  );
}