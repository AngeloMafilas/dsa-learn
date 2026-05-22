import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Bug, FileCode, Lightbulb, Play, Send, 
  ChevronRight, ChevronLeft, HelpCircle, AlertCircle, CheckCircle, 
  Maximize2, X, RefreshCw, Zap, Cpu
} from 'lucide-react';
import { Problem } from '../types';

interface AIHelperProps {
  problem: Problem;
  currentCode: string;
  language: string;
  onApplyCode: (newCode: string) => void;
  onClose?: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  suggestedCode?: string;
  isSystem?: boolean;
}

interface VisualStep {
  title: string;
  description: string;
  arrayState?: number[];
  pointers?: { name: string; index: number }[];
  variables?: { name: string; value: string | number }[];
}

export const AIHelper: React.FC<AIHelperProps> = ({
  problem,
  currentCode,
  language,
  onApplyCode,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hi! I noticed you are working on the **${problem.title}** problem in **${language}**. This is a classic **${problem.category}** challenge with an acceptance rate of ${problem.acceptanceRate}. 

Would you like water-level visual dry runs, hints, or debugging analysis for your current solution? Use the action tools below or ask me any question directly!`,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Commands & Active visualizations
  const [visualSteps, setVisualSteps] = useState<VisualStep[]>([]);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [showFullVisualModal, setShowFullVisualModal] = useState(false);

  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const triggerHelperCommand = async (command: string, customText?: string) => {
    setLoading(true);
    setActiveCommand(command);

    // Context message text
    let promptMsg = '';
    if (command === 'visualize') promptMsg = 'Visualize the logic of this algorithm.';
    else if (command === 'bugs') promptMsg = 'Scan my code and find potential bugs.';
    else if (command === 'trace') promptMsg = 'Trace my code execution steps.';
    else if (command === 'hint') promptMsg = 'Give me a hint to solve this problem.';
    else if (customText) promptMsg = customText;

    const userMsg: Message = { role: 'user', text: promptMsg };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/ai/helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          problemTitle: problem.title,
          problemDescription: problem.description,
          code: currentCode,
          language,
          message: customText || '',
          command,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) throw new Error('AI Helper reported a network error.');

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'model',
        text: data.text || 'I analyzed your code but received an empty textual answer.',
        suggestedCode: data.suggestedCode
      }]);

      if (data.visualSteps && data.visualSteps.length > 0) {
        setVisualSteps(data.visualSteps);
        setActiveStepIdx(0);
      }

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `⚠️ **API Request Timeout**\n\nThe server could not formulate a response. Make sure the backend dev server is active and process.env.GEMINI_API_KEY is registered.`,
      }]);
    } finally {
      setLoading(false);
      setActiveCommand(null);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText('');
    triggerHelperCommand('chat', query);
  };

  // Rendering Helper for active visual steps animation in minimized view
  const currentStep = visualSteps[activeStepIdx];

  return (
    <div className="w-full xl:w-96 flex flex-col h-[calc(100vh-62px)] bg-neutral-950 border-t xl:border-t-0 xl:border-l border-neutral-850 shrink-0 font-sans" id="ai-helper-sidebar">
      
      {/* 1. Header of Assistant */}
      <div className="flex items-center justify-between border-b border-neutral-850 px-4 min-h-[48px] shrink-0 bg-neutral-950 select-none">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-200">AI Code Mentor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => {
              setMessages([
                {
                  role: 'model',
                  text: `Hi! I noticed you are working on the **${problem.title}** problem in **${language}**. Let's clean and solve it!`,
                }
              ]);
              setVisualSteps([]);
            }}
            title="Clear Chat Logs"
            className="p-1 px-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition text-[10px] uppercase font-bold"
          >
            Reset
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrolling Panel Frame for Chat Logs & Visualizers */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d0f12]">
        
        {/* Render Chat Messages List */}
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex flex-col space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`text-[10px] font-mono tracking-wider text-neutral-500 uppercase font-semibold ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                {msg.role === 'user' ? 'You' : 'AlgoCode AI'}
              </div>
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] select-text whitespace-pre-wrap flex flex-col font-sans ${
                  msg.role === 'user' 
                    ? 'bg-amber-500 text-neutral-950 font-semibold rounded-br-none shadow-md shadow-amber-500/5' 
                    : 'bg-neutral-900 border border-neutral-850 text-neutral-300 rounded-bl-none'
                }`}
              >
                {/* Simplified markdown formatter for basic headers, bold words, and inline codes */}
                <div className="space-y-1.5 break-words">
                  {msg.text.split('\n').map((line, lIdx) => {
                    let formatted = line;
                    // Check headers
                    if (formatted.startsWith('### ')) {
                      return <h4 key={lIdx} className="font-bold text-neutral-100 text-xs uppercase tracking-wide mt-2 mb-1">{formatted.replace('### ', '')}</h4>;
                    }
                    if (formatted.startsWith('## ')) {
                      return <h3 key={lIdx} className="font-extrabold text-neutral-100 text-xs mt-2 mb-1 border-b border-neutral-800/60 pb-1">{formatted.replace('## ', '')}</h3>;
                    }
                    // Handle list item bullets
                    if (formatted.trim().startsWith('- ') || formatted.trim().startsWith('* ')) {
                      return <div key={lIdx} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-amber-500">{formatted.substring(2)}</div>;
                    }
                    return <p key={lIdx}>{formatted}</p>;
                  })}
                </div>

                {/* If model response has code suggestions, display apply buttons */}
                {msg.suggestedCode && (
                  <div className="mt-3.5 pt-3 border-t border-neutral-800/80 space-y-2 select-none">
                    <div className="text-[10px] text-neutral-400 font-mono italic">
                      Optimal logic patch is generated:
                    </div>
                    <pre className="bg-[#0b0c0e] font-mono p-2.5 rounded-lg text-[11px] text-neutral-300 overflow-x-auto max-h-32 border border-neutral-850 leading-normal select-all">
                      {msg.suggestedCode}
                    </pre>

                    <button
                      onClick={() => {
                        if (msg.suggestedCode) {
                          onApplyCode(msg.suggestedCode);
                        }
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-center text-xs transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Apply Code to Editor
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col space-y-1 items-start">
              <span className="text-[10px] font-mono text-neutral-500 font-semibold ml-1">AlgoCode AI</span>
              <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl rounded-bl-none text-neutral-400 text-xs flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Formulating algorithmic analysis...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 3. Logic Visualization Panel */}
        {visualSteps.length > 0 && currentStep && (
          <div className="bg-neutral-950 border border-neutral-850/80 rounded-2xl p-4 space-y-3.5 relative overflow-hidden select-none">
            
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Zap className="h-3 w-3 animate-pulse" />
                LOGIC VISUALIZATION ACTIVE
              </span>
              <button 
                onClick={() => setShowFullVisualModal(true)}
                className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded transition"
                title="Expand to Full View"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Stepped index list header */}
            <div className="text-xs">
              <h5 className="font-bold text-white font-mono leading-none">{currentStep.title}</h5>
              <p className="text-[11px] text-neutral-400 mt-1 leading-normal font-sans">{currentStep.description}</p>
            </div>

            {/* Dynamic visual graph container */}
            {currentStep.arrayState && currentStep.arrayState.length > 0 && (
              <div className="py-2 flex items-end justify-center gap-1 min-h-[90px] border border-neutral-900 bg-neutral-950 rounded-xl relative select-none">
                
                {/* Draw the columns of block array */}
                {currentStep.arrayState.map((val, idx) => {
                  const isPointer = currentStep.pointers?.find(p => p.index === idx);
                  const maxVal = Math.max(...(currentStep.arrayState || [1])) || 1;
                  // Proportional height helper
                  const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 80));

                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 max-w-[28px] relative group">
                      
                      {/* Floating pointer name above indices */}
                      {isPointer && (
                        <span className="absolute -top-5 px-1 rounded bg-amber-500 text-neutral-950 font-bold text-[9px] font-mono leading-none animate-bounce shadow">
                          {isPointer.name}
                        </span>
                      )}

                      {/* Bar columns representing water height weights */}
                      <div 
                        className={`w-full rounded-md border transition-all duration-300 ${
                          isPointer 
                            ? 'bg-amber-500/30 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                        style={{ height: `${heightPercent}px` }}
                      />

                      {/* Display array state numeric tag inside index boxes */}
                      <span className="text-[9px] font-mono text-neutral-500 mt-1 font-bold">
                        {val}
                      </span>
                    </div>
                  );
                })}

              </div>
            )}

            {/* Variables trackers */}
            {currentStep.variables && currentStep.variables.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-900">
                {currentStep.variables.map((v, i) => (
                  <div key={i} className="flex justify-between border-r border-neutral-900/60 last:border-none pr-1.5 last:pr-0">
                    <span className="text-neutral-500 text-[9px] uppercase font-bold">{v.name}:</span>
                    <span className="text-amber-500 font-bold">{v.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
              <span className="text-[10px] font-mono text-neutral-500 font-semibold uppercase leading-none">
                Step {activeStepIdx + 1} of {visualSteps.length}
              </span>

              <div className="flex gap-1">
                <button
                  disabled={activeStepIdx === 0}
                  onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 select-none disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={activeStepIdx === visualSteps.length - 1}
                  onClick={() => setActiveStepIdx(prev => Math.min(visualSteps.length - 1, prev + 1))}
                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 select-none disabled:pointer-events-none"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowFullVisualModal(true)}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-200 hover:text-white rounded-xl text-center text-[10px] font-bold uppercase transition border border-neutral-800"
            >
              Open Full View
            </button>

          </div>
        )}

      </div>

      {/* 4. Controls Action grid layout (arranged in a nice grid) */}
      <div className="bg-neutral-950 p-4 border-t border-neutral-850 shrink-0 space-y-4">
        
        {/* Actions grid */}
        <div className="grid grid-cols-2 gap-2 select-none" id="helper-actions-grid">
          <button
            disabled={loading}
            onClick={() => triggerHelperCommand('visualize')}
            className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-left bg-neutral-900 border border-neutral-850 text-neutral-300 hover:border-amber-500/40 hover:text-amber-500 cursor-pointer disabled:opacity-50 transition active:scale-[0.98]"
          >
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <div className="leading-tight">
              Visualize Logic
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => triggerHelperCommand('bugs')}
            className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-left bg-neutral-900 border border-neutral-850 text-neutral-300 hover:border-amber-500/40 hover:text-amber-500 cursor-pointer disabled:opacity-50 transition active:scale-[0.98]"
          >
            <Bug className="h-4 w-4 text-rose-500 shrink-0" />
            <div className="leading-tight">
              Find Bugs
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => triggerHelperCommand('trace')}
            className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-left bg-neutral-900 border border-neutral-850 text-neutral-300 hover:border-amber-500/40 hover:text-amber-500 cursor-pointer disabled:opacity-50 transition active:scale-[0.98]"
          >
            <FileCode className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="leading-tight">
              Trace Code
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => triggerHelperCommand('hint')}
            className="flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold text-left bg-neutral-900 border border-neutral-850 text-neutral-300 hover:border-amber-500/40 hover:text-amber-500 cursor-pointer disabled:opacity-50 transition active:scale-[0.98]"
          >
            <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0" />
            <div className="leading-tight">
              Get Hint
            </div>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            disabled={loading}
            onClick={() => triggerHelperCommand('chat', 'Explain the space complexity of the current solution.')}
            className="text-[10px] text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 px-2.5 py-1 text-left rounded-lg transition"
          >
            Explain space complexity...
          </button>
          <button
            disabled={loading}
            onClick={() => triggerHelperCommand('chat', 'Generate the most optimal template structure to start.')}
            className="text-[10px] text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 px-2.5 py-1 text-left rounded-lg transition"
          >
            Build optimal layout...
          </button>
        </div>

        {/* 5. Chat Input Controls Section */}
        <form onSubmit={handleSendMessage} className="relative flex items-center select-none" id="ai-chat-input-form">
          <input
            id="ai-helper-chat-input"
            value={inputText}
            disabled={loading}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AlgoCode AI..."
            className="w-full bg-[#0a0c0f] border border-neutral-850 rounded-xl pl-4 pr-11 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition placeholder-neutral-600 disabled:opacity-45"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-850 text-neutral-950 disabled:text-neutral-500 rounded-lg transition active:scale-90 disabled:pointer-events-none"
          >
            <Send className="h-3 w-3 stroke-[2.5]" />
          </button>
        </form>

        <div className="text-[10px] text-neutral-600 text-center select-none leading-none pt-1">
          AI can make mistakes. Verify critical code.
        </div>
      </div>

      {/* --- DETAILED LOGIC VISUALIZATION MODAL OVERLAY --- */}
      {showFullVisualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-850 pb-4 select-none">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-2 rounded-xl">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white leading-tight">Algorithm dry-run simulator: {problem.title}</h3>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5 font-bold uppercase">Tracing Execution Step-by-Step</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullVisualModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepped Logic walk representation card */}
            <div className="my-6 p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex items-start gap-3 select-none">
              <div className="h-6 w-6 font-mono text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0">
                {activeStepIdx + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-200">{currentStep?.title || 'State Execution'}</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{currentStep?.description || 'Reading state indices...'}</p>
              </div>
            </div>

            {/* Big Expanded Array Layout Container */}
            {currentStep?.arrayState && currentStep.arrayState.length > 0 && (
              <div className="flex-1 min-h-[180px] border border-neutral-850 bg-[#0d0f12] rounded-2xl p-6 flex flex-col items-center justify-center select-none overflow-x-auto">
                <div className="flex items-end justify-center gap-2 mt-6 h-36">
                  {currentStep.arrayState.map((val, idx) => {
                    const isPointer = currentStep.pointers?.find(p => p.index === idx);
                    const maxVal = Math.max(...(currentStep.arrayState || [1])) || 1;
                    const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 80));

                    return (
                      <div key={idx} className="flex flex-col items-center w-12 relative">
                        
                        {/* Display pointer indicators */}
                        {isPointer && (
                          <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 font-bold text-[10px] font-mono leading-none animate-bounce shadow">
                            {isPointer.name}
                          </div>
                        )}

                        {/* Visual graph stack */}
                        <div 
                          className={`w-full rounded-lg border transition-all duration-300 relative group flex items-start justify-center pt-2 ${
                            isPointer 
                              ? 'bg-amber-500/25 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          <span className="text-[10px] font-mono text-neutral-400 font-bold leading-none">{val}</span>
                        </div>

                        {/* Array index block */}
                        <span className="text-[10px] font-mono text-neutral-500 mt-2">
                          Idx {idx}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Substate variables block */}
            {currentStep?.variables && currentStep.variables.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d0f12] border border-neutral-850 p-4 rounded-xl font-mono text-xs select-none">
                {currentStep.variables.map((v, i) => (
                  <div key={i} className="flex flex-col justify-center border-r border-neutral-850 last:border-none pr-3">
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">{v.name}</span>
                    <span className="text-amber-500 font-extrabold text-sm mt-0.5">{v.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stepper control bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-neutral-850 pt-5 mt-6 gap-4 select-none">
              <span className="text-xs font-mono text-neutral-400 font-bold uppercase leading-none">
                Timeline sequence: step {activeStepIdx + 1} of {visualSteps.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={activeStepIdx === 0}
                  onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold text-neutral-200 transition disabled:opacity-40 select-none disabled:pointer-events-none flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  disabled={activeStepIdx === visualSteps.length - 1}
                  onClick={() => setActiveStepIdx(prev => Math.min(visualSteps.length - 1, prev + 1))}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-xl text-xs font-bold transition disabled:opacity-40 select-none disabled:pointer-events-none flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
