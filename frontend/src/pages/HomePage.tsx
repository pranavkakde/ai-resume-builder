import { Link } from 'react-router-dom';
import './HomePage.css';

const features = [
  {
    icon: '🎯',
    title: 'Match Scoring',
    desc: 'Get an instant score showing how well your resume aligns with any job description.',
  },
  {
    icon: '💡',
    title: 'AI Recommendations',
    desc: "Receive targeted suggestions to improve your resume's impact, skills, and keywords.",
  },
  {
    icon: '📝',
    title: 'Resume Generation',
    desc: 'Generate an optimized resume with accepted recommendations in one click.',
  },
  {
    icon: '📊',
    title: 'Application Tracking',
    desc: 'Keep track of all your job applications, statuses, and match scores in one place.',
  },
];

export default function HomePage() {
  return (
    <div className="page home-page">
      <section className="home-hero">
        <span className="home-hero__badge">✦ Powered by AI</span>
        <h1 className="home-hero__headline">
          <span className="gradient-text">AI-Powered</span>
          <br />
          Resume Builder
        </h1>
        <p className="home-hero__subtitle">
          Analyze your resume against any job description. Get intelligent scoring,
          actionable recommendations, and generate optimized resumes — all powered
          by your choice of LLM.
        </p>
        <div className="home-hero__ctas">
          <Link to="/analyzer" className="btn btn-primary btn-lg home-hero__cta">
            🎯 Analyze Resume
          </Link>
          <Link to="/tracker" className="btn btn-secondary btn-lg home-hero__cta">
            📊 Track Applications
          </Link>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-features__title">Everything You Need</h2>
        <p className="home-features__subtitle">
          A complete toolkit to land your dream job
        </p>
        <div className="home-features__grid">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className="home-feature-card glass-card"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="home-feature-card__icon">{f.icon}</span>
              <h3 className="home-feature-card__title">{f.title}</h3>
              <p className="home-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
