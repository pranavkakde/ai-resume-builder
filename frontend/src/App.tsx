import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LLMProvider } from './contexts/LLMContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnalyzerPage from './pages/AnalyzerPage';
import TrackerPage from './pages/TrackerPage';

export default function App() {
  return (
    <ThemeProvider>
      <LLMProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
          </Routes>
        </div>
      </LLMProvider>
    </ThemeProvider>
  );
}
