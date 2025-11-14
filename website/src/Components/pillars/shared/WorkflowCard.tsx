import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WorkflowStep {
  title: string;
  description: string;
  details?: string;
}

interface WorkflowCardProps {
  title: string;
  steps: string[] | WorkflowStep[];
  className?: string;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  title,
  steps,
  className = '',
}) => {
  return (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-green-600/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:scale-[1.02] focus-within:border-green-600/30 focus-within:ring-2 focus-within:ring-green-600/20 transition-all duration-300 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          // Type guard to check if step is WorkflowStep
          const isStepObject = typeof step === 'object' && step !== null && 'title' in step;
          const stepObj = isStepObject ? (step as WorkflowStep) : null;
          
          const stepTitle = stepObj?.title || '';
          const stepDescription = stepObj?.description || (typeof step === 'string' ? step : '');
          const stepDetails = stepObj?.details;

          return (
            <div key={index}>
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-600/30 to-green-600/10 border border-green-600/30 flex items-center justify-center text-green-400 font-semibold text-sm group-hover:border-green-600/50 transition-colors duration-300">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  {isStepObject && stepTitle ? (
                    <>
                      <h4 className="text-white font-semibold mb-1 group-hover:text-green-400 transition-colors duration-300">
                        {stepTitle}
                      </h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-2">
                        {stepDescription}
                      </p>
                      {stepDetails && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-gray-300 leading-relaxed">
                            {stepDetails}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {stepDescription}
                    </p>
                  )}
                </div>
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowCard;

