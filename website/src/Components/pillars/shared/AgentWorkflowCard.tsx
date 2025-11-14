import React from 'react';
import WorkflowCard from './WorkflowCard';

const AgentWorkflowCard: React.FC = () => {
  const workflowSteps = [
    {
      title: "User input arrives",
      description: "The user issues a request (e.g., 'Refactor the authentication service and add logging for failed login attempts.'). The agent receives this as text, which is part of the current context.",
      details: "The user input is the immediate request or command from the user. It is the piece of context that triggers the agent's action. It tells the agent what the user wants now. This is the latest turn in the conversation or workflow, and it tells the agent what now needs to be done."
    },
    {
      title: "Context assembly",
      description: "The orchestration layer (agent runtime like Cursor, Claude Code, GH Copilot) assembles all relevant context: system prompt, environment info, rules/skills/commands, available tools (JSON schemas), and conversation history/memory.",
      details: "Before the model starts reasoning, the orchestration layer assembles all relevant context. The system prompt defines the agent's identity and behavior. The environment provides static and dynamic information about the system (repo, architecture, OS, date, etc). Rules, skills, and commands are loaded from static files if relevant. The available tools (declared in JSON schemas) are included so the model knows what actions it can perform. The conversation history and memory (if any) are added for continuity. This assembled context is then passed to the model as the 'input window.'"
    },
    {
      title: "Planning phase (context discovery)",
      description: "The model creates an internal plan: understanding what additional information it needs, identifying which tools to use, and deciding the logical order of operations (e.g., inspect → edit → test → summarize). Uses reasoning techniques like Chain-of-Thought.",
      details: "Once the model has all the context, it starts by creating an internal plan. This plan might include: understanding what additional information it needs (for example, 'What does the auth service currently look like?'), identifying which tools to use to retrieve that information, and deciding the logical order of operations (e.g., inspect → edit → test → summarize). This process is sometimes referred to as context discovery. The model uses reasoning techniques (like Chain-of-Thought) to figure out what it needs to know, and how to gather it efficiently."
    },
    {
      title: "Tool execution and external calls",
      description: "The model uses tools defined in its context. Each tool execution is mediated by a protocol or API layer (e.g., MCP). Tool calls return structured output (typically JSON) which is added back into context.",
      details: "After building the plan, the model starts using the tools defined in its context. Each tool execution is mediated by a protocol or API layer. One emerging standard for this interaction is the Model Context Protocol (MCP), which defines how LLMs and agents can discover, call, and exchange data with external tools or services in a structured and secure way. Using MCP (or similar interfaces), an agent can call a file system tool to read code, query a database or internal API to fetch relevant data, run commands like grep, build, or test, or query external services via HTTP or RPC. Each tool call returns structured output, typically in JSON, which is then added back into the context for the next reasoning step."
    },
    {
      title: "Iterative reasoning loop",
      description: "After every tool call, the agent evaluates: Did the tool return what was expected? Is more data needed? Has the task been completed? Forms an iterative loop: Reason → Act → Observe → Adjust.",
      details: "After every tool call, the agent evaluates the results: Did the tool return what was expected? Is more data needed? Has the task been completed? This forms an iterative loop of reasoning and action: Reason → Act → Observe → Adjust. This loop continues until the agent determines that the task is complete, or that no further progress can be made. Some frameworks add a feedback mechanism (either from the user or automatically based on validation rules) to check if the output is correct before proceeding."
    },
    {
      title: "Producing the final answer",
      description: "Once all required information is gathered and actions executed, the agent produces final output: final artifact, summary of steps, logs/reports, or next-step suggestions.",
      details: "Once the agent has gathered all required information and executed all necessary actions, it produces a final output. Depending on the design, the output might include: the final artifact (for example, the refactored code or a generated file), a summary of the steps executed (useful for audit or debugging), logs or reports about tool calls, test results, or actions performed, or next-step suggestions or validation notes. This final message is what the user sees as the result of the interaction."
    }
  ];
  
  return (
    <div className="my-8">
      <WorkflowCard
        title="Agent Workflow: From Request to Action"
        steps={workflowSteps}
      />
    </div>
  );
};

export default AgentWorkflowCard;

