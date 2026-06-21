import './JDInput.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function JDInput({ value, onChange }: Props) {
  return (
    <div className="jd-input glass-card">
      <h3 className="jd-input__title">💼 Job Description</h3>
      <p className="jd-input__subtitle">Paste the target job description</p>

      <div className="jd-input__wrapper">
        <textarea
          className="jd-input__textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste the job description here...

Include the full job posting — title, responsibilities, required skills, qualifications, and any other details for the best analysis results."
          aria-label="Job description"
        />
      </div>

      <div className="jd-input__footer">
        {value.length > 0 && (
          <button
            className="jd-input__clear-btn"
            onClick={() => onChange('')}
          >
            ✕ Clear
          </button>
        )}
        <span className="jd-input__char-count">
          {value.length.toLocaleString()} chars
        </span>
      </div>
    </div>
  );
}
