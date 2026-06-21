import { useTheme } from '../contexts/ThemeContext';
import type { Theme } from '../types';
import './ThemeSwitcher.css';

const themes: { key: Theme; label: string }[] = [
  { key: 'midnight', label: 'Midnight' },
  { key: 'aurora', label: 'Aurora' },
  { key: 'ivory', label: 'Ivory' },
  { key: 'ocean', label: 'Ocean' },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="Theme selector">
      {themes.map(t => (
        <button
          key={t.key}
          className={`theme-switcher__dot theme-switcher__dot--${t.key}${theme === t.key ? ' theme-switcher__dot--active' : ''}`}
          onClick={() => setTheme(t.key)}
          role="radio"
          aria-checked={theme === t.key}
          aria-label={t.label}
          data-tooltip={t.label}
        />
      ))}
    </div>
  );
}
