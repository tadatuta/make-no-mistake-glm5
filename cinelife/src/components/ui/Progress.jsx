export default function Progress({ currentStep, totalSteps }) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-silver-screen mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(percentage)}% complete</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
