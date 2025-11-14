import React from 'react';
import { User, Bot } from 'lucide-react';

interface Message {
  speaker: 'user' | 'agent';
  content: string | React.ReactNode;
}

interface ExampleFlowCardProps {
  title: string;
  messages: Message[];
  className?: string;
}

const ExampleFlowCard: React.FC<ExampleFlowCardProps> = ({
  title,
  messages,
  className = '',
}) => {
  return (
    <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-green-600/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(22,163,74,0.2)] transition-all duration-300 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-4 ${
              message.speaker === 'user' ? 'flex-row' : 'flex-row'
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.speaker === 'user'
                  ? 'bg-gradient-to-br from-green-600/30 to-green-600/10 border border-green-600/30'
                  : 'bg-gradient-to-br from-blue-600/30 to-blue-600/10 border border-blue-600/30'
              }`}
            >
              {message.speaker === 'user' ? (
                <User className="w-5 h-5 text-green-400" />
              ) : (
                <Bot className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="mb-1">
                <span
                  className={`text-sm font-semibold ${
                    message.speaker === 'user'
                      ? 'text-green-400'
                      : 'text-blue-400'
                  }`}
                >
                  {message.speaker === 'user' ? 'User' : 'Agent'}
                </span>
              </div>
              <div className="text-gray-300 leading-relaxed">
                {typeof message.content === 'string' ? (
                  <p>{message.content}</p>
                ) : (
                  message.content
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleFlowCard;

