import React from 'react';
import FeatureCard from './shared/FeatureCard';
import { useScrollAnimation, useStaggerAnimation } from './shared/useScrollAnimation';
import { Brain, FileText, Network, Bot, Users, Shield } from 'lucide-react';

const PillarsOverviewSection: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { containerRef, visibleItems } = useStaggerAnimation(6, { threshold: 0.1 });

  const features = [
    {
      icon: Brain,
      title: 'Context Engineering',
      description: 'Design and runtime management of the context fed to LLMs: system prompts, memory, retrieval (RAG), and context delivery protocols.',
      link: '/pillars/context',
    },
    {
      icon: FileText,
      title: 'Spec-Driven Development',
      description: 'Treat human-readable, testable specifications as the primary artefact; split work into small spec→task→PR cycles so agents implement against those specs.',
    },
    {
      icon: Network,
      title: 'Protocols for Agentic AI',
      description: 'Model Context Protocol, Agent 2 Agent and other protocols shape how LLM interact with tools and with other agents',
    },
    {
      icon: Bot,
      title: 'Agentic Applications',
      description: 'Integrations, agent runtimes, developer IDE plugins and systems that let agents call tools, run tests, inspect repos, and act safely.',
    },
    {
      icon: Users,
      title: 'Human-in-the-Loop (HITL) & Collaboration',
      description: 'Processes, UIs and gating where humans review, refine and approve intermediate artifacts (specs, designs, generated code, model outputs).',
    },
    {
      icon: Shield,
      title: 'Ethics, Governance & Compliance',
      description: 'Governance processes and organizational controls for responsible deployment, management and cost efficiency of these systems.',
    },
  ];

  return (
    <section
      ref={elementRef as React.RefObject<HTMLElement>}
      id="pillars-overview-section"
      className={`relative pt-4 pb-20 md:pb-24 lg:pb-32 bg-gray-950 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              data-stagger-item={index}
              className={`transition-all duration-500 ${
                visibleItems.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visibleItems.has(index) ? `${index * 100}ms` : '0ms' }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                link={feature.link}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsOverviewSection;

