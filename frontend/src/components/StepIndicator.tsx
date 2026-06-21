import './StepIndicator.css';

interface Step {
  label: string;
  number: number;
}

interface Props {
  currentStep: number;
}

const steps: Step[] = [
  { label: 'Upload & Paste', number: 1 },
  { label: 'Analysis', number: 2 },
  { label: 'Generate', number: 3 },
];

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="step-indicator" role="navigation" aria-label="Progress">
      {steps.map((step, idx) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="step-indicator__step">
              <div
                className={`step-indicator__circle${
                  isActive ? ' step-indicator__circle--active' : ''
                }${isCompleted ? ' step-indicator__circle--completed' : ''}`}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`step-indicator__label${
                  isActive ? ' step-indicator__label--active' : ''
                }${isCompleted ? ' step-indicator__label--completed' : ''}`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`step-indicator__connector${
                  isCompleted ? ' step-indicator__connector--filled' : ''
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
