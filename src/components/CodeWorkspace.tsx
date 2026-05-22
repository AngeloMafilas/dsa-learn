import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, Play, Upload, Code, RotateCcw, AlertCircle, CheckCircle, 
  Settings, ChevronDown, ChevronUp, History, ClipboardList, HelpCircle, 
  Cpu, FileDiff, Zap, Info, Sparkles
} from 'lucide-react';
import { Problem, Difficulty, Submission } from '../types';
import { languageStartingTemplates, getStartingTemplate } from '../data/problems';
import { dbService } from '../lib/db';
import { AIHelper } from './AIHelper';

interface CodeWorkspaceProps {
  problem: Problem;
  onBackToLibrary: () => void;
  onSubmissionSuccess: () => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ 
  problem, 
  onBackToLibrary,
  onSubmissionSuccess 
}) => {
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions'>('description');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState('');
  const [editorFontSize, setEditorFontSize] = useState<number>(14);
  const [isAIExpanded, setIsAIExpanded] = useState(true);
  
  // Console panel drawer controls
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [customInput, setCustomInput] = useState('');
  
  // Execution status states
  const [executing, setExecuting] = useState(false);
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  
  // Detailed historical submission inspection modal state
  const [activeHistorySubmission, setActiveHistorySubmission] = useState<Submission | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Load language templates or restore typed state
  useEffect(() => {
    const key = `algocode_workspace_code_${problem.id}_${language}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setCode(saved);
    } else {
      const template = getStartingTemplate(language, problem.id);
      setCode(template);
    }
    setCustomInput(problem.testCases[0]?.input || '');
    setExecutionResult(null);
  }, [problem, language]);

  // Sync editor typed change to localstorage
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    localStorage.setItem(`algocode_workspace_code_${problem.id}_${language}`, val);
  };

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Dynamic lines array list compute
  const linesCount = useMemo(() => {
    const arr = code.split('\n');
    return arr.length || 1;
  }, [code]);

  // Capture TAB key indents natively
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const tabSpaces = '    '; // 4 space indent
      const updated = code.substring(0, start) + tabSpaces + code.substring(end);
      setCode(updated);
      
      // Reset text selection indices
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Trigger Reset to boilerplate template
  const handleResetTemplate = () => {
    if (confirm("Reset current source code back to boilerplate template? This will erase ongoing typing.")) {
      const template = getStartingTemplate(language, problem.id);
      setCode(template);
      localStorage.removeItem(`algocode_workspace_code_${problem.id}_${language}`);
    }
  };

  // Run or Submit triggering API handler
  const handleExecute = async (submit: boolean) => {
    setExecuting(true);
    setIsSubmitMode(submit);
    setIsConsoleExpanded(true);
    setActiveConsoleTab('result');
    setExecutionResult(null);

    // Prepare test cases
    const testCasesToRun = submit 
      ? problem.testCases 
      : [{ id: 1, input: customInput, expectedOutput: problem.testCases[0]?.expectedOutput || '' }];

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          problemTitle: problem.title,
          difficulty: problem.difficulty,
          code,
          language,
          testCases: testCasesToRun
        })
      });

      if (!response.ok) {
        throw new Error("Sandbox server execution crashed.");
      }

      const evalData = await response.json();
      setExecutionResult(evalData);

      // Save submission record into local db model if in Submit mode
      if (submit) {
        dbService.saveSubmission(
          problem.id,
          problem.title,
          problem.difficulty,
          language,
          code,
          evalData.status,
          evalData.runtime,
          evalData.memory,
          evalData.stdout,
          evalData.errorDetails,
          evalData.failedTestCase
        );
        onSubmissionSuccess(); // notify client state to refresh Nav progress stats
      }

    } catch (err: any) {
      console.error(err);
      setExecutionResult({
        status: 'Runtime Error',
        runtime: '0 ms',
        memory: '0 MB',
        errorDetails: 'The sandbox environment failed to boot or returned an invalid API payload. Check local connection status.',
        feedback: 'Verify that node is compiling and process.env.GEMINI_API_KEY is connected.'
      });
    } finally {
      setExecuting(false);
    }
  };

  // Query problemsubmissions list
  const problemSubmissionsList = useMemo(() => {
    return dbService.getSubmissions(problem.id);
  }, [problem, executionResult]);

  return (
    <div className="flex flex-col xl:flex-row bg-neutral-900 min-h-[calc(100vh-62px)] select-none text-neutral-200 divide-y xl:divide-y-0 xl:divide-x divide-neutral-800 font-sans" id="workspace-layout">
      
      {/* LEFT SIDE PANEL: Problem Description, Constraints, examples and submissions list */}
      <div className="w-full xl:w-5/12 flex flex-col h-[calc(100vh-62px)] bg-neutral-950 overflow-hidden shrink-0" id="left-problem-description-cards">
        
        {/* Sub Header menu tabs */}
        <div className="flex justify-between items-center bg-neutral-950 border-b border-neutral-850 px-4 min-h-[48px] shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg uppercase transition flex items-center gap-1.5 ${
                activeLeftTab === 'description'
                  ? 'bg-neutral-900 border border-neutral-800 text-amber-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg uppercase transition flex items-center gap-1.5 relative ${
                activeLeftTab === 'submissions'
                  ? 'bg-neutral-900 border border-neutral-800 text-amber-500'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Submissions
              {problemSubmissionsList.length > 0 && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] font-bold px-1 rounded-md">
                  {problemSubmissionsList.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={onBackToLibrary}
            className="text-xs bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 px-3 py-1.5 rounded-lg text-neutral-300 font-medium select-none transition"
          >
            ← Back
          </button>
        </div>

        {/* Dynamic content scroll frame */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeLeftTab === 'description' ? (
            <div className="space-y-6">
              
              {/* Problem Name & category header */}
              <div className="space-y-2">
                <span className="bg-neutral-900 text-neutral-400 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border border-neutral-800 block w-max uppercase">
                  {problem.category}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white mb-2 leading-tight">
                  {problem.title}
                </h2>
                
                <div className="flex items-center gap-3 select-none text-xs">
                  <span className={`font-semibold ${
                    problem.difficulty === 'Easy' ? 'text-emerald-500' :
                    problem.difficulty === 'Medium' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="h-3.5 w-px bg-neutral-800" />
                  <span className="text-neutral-500">Acceptance Rate: <strong className="text-neutral-400">{problem.acceptanceRate}</strong></span>
                </div>
              </div>

              {/* Problem core text body with code-styling backings */}
              <div className="text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap select-text markdown-body">
                {problem.description}
              </div>

              {/* Dynamic Examples Cards highlighting input logic visual boxes */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase">Examples:</h3>
                
                {problem.examples.map((ex) => (
                  <div key={ex.id} className="bg-neutral-900/40 rounded-xl border border-neutral-850 p-4 font-sans select-text">
                    <div className="text-xs font-bold font-mono text-amber-500 mb-2">Example {ex.id}:</div>
                    <div className="space-y-1 font-mono text-xs text-neutral-300 select-all">
                      <div><strong className="text-neutral-400 font-sans">Input:</strong> {ex.input}</div>
                      <div><strong className="text-neutral-400 font-sans">Output:</strong> {ex.output}</div>
                      {ex.explanation && (
                        <div className="pt-2 text-[11px] font-sans text-neutral-400 flex gap-1.5 border-t border-neutral-850 mt-1">
                          <Info className="h-3.5 w-3.5 text-amber-500/80 shrink-0 mt-0.5" />
                          <span>{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints list */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase mb-2">Constraints:</h3>
                <ul className="space-y-1 px-4 list-disc text-xs font-mono text-neutral-400">
                  {problem.constraints.map((con, idx) => (
                    <li key={idx} className="leading-snug">
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            /* Historical problem submissions list tab */
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase mb-4 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-amber-500" />
                Your Solution Submissions
              </h3>

              <div className="space-y-3">
                {problemSubmissionsList.length > 0 ? (
                  problemSubmissionsList.map((sub, i) => (
                    <div 
                      key={sub.id}
                      onClick={() => setActiveHistorySubmission(sub)}
                      className="cursor-pointer bg-neutral-900/60 border border-neutral-850 hover:border-amber-500/40 hover:bg-neutral-900 p-4 rounded-xl flex items-center justify-between transition group duration-200 select-none"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase ${
                            sub.status === 'Accepted' ? 'text-emerald-400' : 'text-red-500'
                          }`}>
                            {sub.status}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 font-semibold">•</span>
                          <span className="text-[10px] uppercase font-mono text-amber-500 font-bold">{sub.language}</span>
                        </div>
                        <div className="flex items-center gap-3.5 mt-1 text-[10px] font-mono text-neutral-400">
                          {sub.status === 'Accepted' ? (
                            <>
                              <span>Beats: <strong className="text-emerald-400 font-bold">{sub.beatsRuntimePercent}%</strong></span>
                              <span>•</span>
                              <span>{sub.runtime}</span>
                            </>
                          ) : (
                            <span className="text-red-400/90 font-semibold">Test failure diagnostics</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono text-neutral-500 block leading-none">
                          {new Date(sub.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-amber-500 group-hover:underline mt-1 font-semibold block leading-none">Inspect →</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-neutral-850 rounded-xl text-center select-none text-neutral-500 mt-6">
                    <History className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                    <div className="text-xs font-semibold">No submissions registered yet</div>
                    <p className="text-[10px] text-neutral-600 mt-0.5">Solve this problem and hit Submit to store history views.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RIGHT SIDE PANEL: Code Editor with sync line numbers, toolbar, running indicators and terminal Drawer */}
      <div className="flex-1 flex flex-col h-[calc(100vh-62px)] bg-neutral-900 overflow-hidden relative" id="right-ide-workspace">
        
        {/* Editor Settings Toolbar header */}
        <div className="flex items-center justify-between bg-neutral-900 px-5 min-h-[48px] border-b border-neutral-850 shrink-0">
          
          {/* Left toolbar selector items */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown Selector */}
            <div className="relative group select-none">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-850 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase text-neutral-200 cursor-pointer pr-8 focus:outline-none focus:border-amber-500 transition hover:border-neutral-803 appearance-none font-mono"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java 11</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none" />
            </div>

            {/* Template Reset option */}
            <button
              onClick={handleResetTemplate}
              title="Reset code template back to startup default shape"
              className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-850 hover:bg-neutral-850 text-neutral-400 hover:text-white transition active:scale-95 duration-100"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Right toolbar controls for editor sizes */}
          <div className="flex items-center gap-4">
            
            {/* AI Mentor Toggle Button */}
            <button
              onClick={() => setIsAIExpanded(!isAIExpanded)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isAIExpanded
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-sm shadow-amber-500/5'
                  : 'bg-neutral-950 border border-neutral-850 hover:bg-neutral-850 text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Mentor
            </button>
            
            {/* Font sizing adjust widget */}
            <div className="flex items-center gap-1.5 text-xs bg-neutral-950 border border-neutral-850 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-500 font-mono">Size:</span>
              <button 
                onClick={() => setEditorFontSize(Math.max(12, editorFontSize - 1))}
                className="hover:text-amber-500 w-4 font-bold select-none cursor-pointer text-center"
              >-</button>
              <span className="font-mono font-bold text-neutral-300 w-5 text-center leading-none">{editorFontSize}</span>
              <button 
                onClick={() => setEditorFontSize(Math.min(22, editorFontSize + 1))}
                className="hover:text-amber-500 w-4 font-bold select-none cursor-pointer text-center"
              >+</button>
            </div>

            <Settings className="h-4 w-4 text-neutral-500 hover:text-neutral-300 transition cursor-pointer" />
          </div>

        </div>

        {/* Dynamic customized code text area */}
        <div className="flex-1 flex overflow-hidden bg-[#0f1115]" id="editor-screen-pane">
          
          {/* Line Numbers gutter (scrolling synchronized with textarea scroll handler) */}
          <div 
            ref={lineNumbersRef}
            className="w-11 bg-neutral-950 text-right pr-3 select-none py-4 font-mono text-[11px] text-neutral-600 border-r border-neutral-900 overflow-hidden leading-snug break-words shrink-0"
            style={{ fontSize: `${editorFontSize}px`, lineHeight: '1.625' }}
          >
            {Array.from({ length: linesCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Core textarea for raw editable compiler actions */}
          <textarea
            ref={editorRef}
            value={code}
            onChange={handleCodeChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-neutral-100 font-mono border-none outline-none resize-none focus:outline-none p-4 leading-snug break-all placeholder-neutral-700 h-full select-text whitespace-pre overflow-x-auto"
            style={{ 
              fontSize: `${editorFontSize}px`,
              lineHeight: '1.625',
              tabSize: '4'
            }}
            placeholder="# Write your algorithms solution code workspace..."
            spellCheck="false"
          />

        </div>

        {/* BOTTOM DRAWER TERMINAL: Custom testing consoles sliders */}
        <div 
          className={`border-t border-neutral-850 bg-neutral-950 select-none transition-all duration-300 ease-out flex flex-col shrink-0 ${
            isConsoleExpanded ? 'h-64' : 'h-11'
          }`}
          id="workspace-drawer-slider"
        >
          
          {/* Console Slide Toggler Panel Control bar */}
          <div className="flex items-center justify-between min-h-[44px] bg-neutral-950 border-b border-neutral-850 px-5 shrink-0 select-none">
            <button
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
              className="text-xs font-semibold font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer select-none"
            >
              {isConsoleExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              Console Commands
            </button>

            {/* If expanded, menu tabs for: custom tests or compile run outputs */}
            {isConsoleExpanded && (
              <div className="flex gap-1 bg-neutral-900 border border-neutral-850 p-1.5 rounded-lg select-none">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono tracking-wide uppercase transition ${
                    activeConsoleTab === 'testcase'
                      ? 'bg-neutral-950 border border-neutral-800 text-amber-500 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Test Cases Input
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono tracking-wide uppercase transition relative flex items-center gap-1 ${
                    activeConsoleTab === 'result'
                      ? 'bg-neutral-950 border border-neutral-800 text-amber-500 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Compiler Output
                  {executionResult && (
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                      executionResult.status === 'Accepted' ? 'bg-emerald-400' : 'bg-red-400'
                    }`} />
                  )}
                </button>
              </div>
            )}

            {/* Running & Submit buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleExecute(false)}
                disabled={executing}
                className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition duration-150 flex items-center gap-1.5 disabled:opacity-50 select-none disabled:pointer-events-none active:scale-95"
              >
                <Play className="h-3.5 w-3.5 text-neutral-400 fill-neutral-400/20" />
                Run Code
              </button>

              <button
                onClick={() => handleExecute(true)}
                disabled={executing}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold px-4 py-1.5 rounded-xl transition shadow-lg hover:shadow-amber-500/5 duration-150 flex items-center gap-1.5 disabled:opacity-50 select-none disabled:pointer-events-none active:scale-95"
              >
                <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
                Submit
              </button>
            </div>
          </div>

          {/* Toggle content drawer space */}
          {isConsoleExpanded && (
            <div className="flex-1 bg-neutral-[#0f1115] p-5 overflow-y-auto">
              {activeConsoleTab === 'testcase' ? (
                /* Editable textcase box */
                <div className="space-y-3 font-sans h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400">Problem Test Inputs:</span>
                    <span className="text-[10px] font-mono text-neutral-600">Provide comma-separated array data lines</span>
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 focus:border-neutral-850 focus:outline-none p-3 font-mono text-xs text-white rounded-xl resize-none h-32 select-all placeholder-neutral-700"
                    spellCheck="false"
                  />
                </div>
              ) : (
                /* Output Terminal compiler */
                <div className="h-full select-text">
                  {executing ? (
                    <div className="flex flex-col items-center justify-center py-7 text-center select-none text-neutral-500">
                      <div className="h-7 w-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <div className="text-xs font-mono tracking-wide text-neutral-400">
                        {isSubmitMode ? 'Evaluating all testcases in Gemini Sandbox...' : 'Compiling source code on server...'}
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-1 font-sans">Connecting to process.env.GEMINI_API_KEY pipeline</p>
                    </div>
                  ) : executionResult ? (
                    <div className="space-y-4 font-mono text-xs">
                      
                      {/* Compiler Status line */}
                      <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
                        <div className="flex items-center gap-2 shadow-sm rounded-lg p-0.5">
                          <span className={`text-sm font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-lg ${
                            executionResult.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-red-500/10 text-red-500 border border-red-500/15'
                          }`}>
                            {executionResult.status}
                          </span>
                          <span className="text-neutral-500 font-sans">|</span>
                          <span className="text-neutral-400">Runtime: <span className="text-neutral-100 font-bold">{executionResult.runtime}</span></span>
                          <span className="text-neutral-500 font-sans">•</span>
                          <span className="text-neutral-400">Memory: <span className="text-neutral-100 font-bold">{executionResult.memory}</span></span>
                        </div>

                        {/* Extra feedback badge info from evaluation */}
                        {executionResult.status === 'Accepted' && (
                          <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-sans font-medium">
                            <Zap className="h-3 w-3 fill-emerald-500" />
                            Passes Constraints
                          </div>
                        )}
                      </div>

                      {/* Display failing case details if wrong */}
                      {executionResult.failedTestCase && (
                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2 select-text">
                          <div className="text-xs font-bold text-red-400 flex items-center gap-1 font-sans">
                            <AlertCircle className="h-4 w-4" />
                            Failing Scenario detected:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed select-all">
                            <div>
                              <strong className="text-neutral-500 font-sans block text-[10px] uppercase font-bold tracking-wide">Failing Input:</strong>
                              <span className="text-neutral-200">{executionResult.failedTestCase.input}</span>
                            </div>
                            <div>
                              <strong className="text-neutral-500 font-sans block text-[10px] uppercase font-bold tracking-wide">Expected Output:</strong>
                              <span className="text-emerald-400/90">{executionResult.failedTestCase.expected}</span>
                            </div>
                            <div>
                              <strong className="text-neutral-500 font-sans block text-[10px] uppercase font-bold tracking-wide">Actual Returned:</strong>
                              <span className="text-red-400">{executionResult.failedTestCase.actual}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trace Logs standard out */}
                      {executionResult.stdout && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">Standard output trace:</div>
                          <pre className="bg-neutral-900 border border-neutral-850/80 p-3.5 rounded-xl overflow-x-auto text-neutral-300 max-h-24 font-mono leading-relaxed select-text">{executionResult.stdout}</pre>
                        </div>
                      )}

                      {/* Compiler diagnostics compile logs */}
                      {executionResult.errorDetails && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono font-bold text-red-400 block">Compiler Trace Logging:</div>
                          <pre className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-red-400/90 overflow-x-auto select-text font-mono text-xs leading-relaxed">{executionResult.errorDetails}</pre>
                        </div>
                      )}

                      {/* Suggestion hints summary */}
                      {executionResult.feedback && (
                        <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-xl flex items-start gap-3">
                          <Cpu className="h-4.5 w-4.5 text-amber-500/90 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold block leading-none">AI Sandbox Compiler Feedback:</span>
                            <p className="text-xs text-neutral-400 font-sans leading-relaxed select-text">{executionResult.feedback}</p>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="py-12 text-center text-neutral-500 font-sans select-none">
                      <Terminal className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                      <div className="text-xs font-semibold">Compiler trace terminal in idle.</div>
                      <p className="text-[10px] text-neutral-600 mt-0.5 flex items-center justify-center gap-1.5 font-sans leading-none select-none">
                        Click <strong className="text-neutral-400">Run Code</strong> to inspect testcases, or <strong className="text-neutral-400">Submit</strong> to commit solution.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* RIGHT-MOST AI PANEL: Interactive assistant panel */}
      {isAIExpanded && (
        <AIHelper
          problem={problem}
          currentCode={code}
          language={language}
          onApplyCode={(newCode) => {
            setCode(newCode);
            localStorage.setItem(`algocode_workspace_code_${problem.id}_${language}`, newCode);
          }}
          onClose={() => setIsAIExpanded(false)}
        />
      )}

      {/* --- SUBMISSION INSPECTOR OVERLAY MODAL --- */}
      {activeHistorySubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm animate-fade-in font-sans">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-neutral-850 pb-4 shrink-0 select-none">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{problem.title} Submission</h3>
                  <span className={`text-[10px] font-mono font-bold uppercase px-1.5 rounded-md ${
                    activeHistorySubmission.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {activeHistorySubmission.status}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-1">
                  Submitted via <span className="text-amber-500 uppercase font-bold">{activeHistorySubmission.language}</span> on{' '}
                  {new Date(activeHistorySubmission.timestamp).toLocaleString()}
                </div>
              </div>
              
              <button
                onClick={() => setActiveHistorySubmission(null)}
                className="text-neutral-400 hover:text-white rounded-lg p-1.5 hover:bg-neutral-900 transition active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Performance beats widget */}
            {activeHistorySubmission.status === 'Accepted' && (
              <div className="grid grid-cols-2 gap-4 border border-neutral-850 bg-neutral-900/40 p-4 rounded-xl my-4 shrink-0 select-none">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block leading-none">Elapsed Runtime⏱️</span>
                  <div className="text-xl font-extrabold text-white font-mono">{activeHistorySubmission.runtime}</div>
                  <p className="text-[10px] text-emerald-400 leading-none">
                    Beats <strong className="font-extrabold text-emerald-100">{activeHistorySubmission.beatsRuntimePercent}%</strong> of active users
                  </p>
                </div>
                <div className="space-y-0.5 border-l border-neutral-850 pl-4">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block leading-none">Memory Consumption💾</span>
                  <div className="text-xl font-extrabold text-white font-mono">{activeHistorySubmission.memory}</div>
                  <p className="text-[10px] text-emerald-400 leading-none">
                    Beats <strong className="font-extrabold text-emerald-100">{activeHistorySubmission.beatsMemoryPercent}%</strong> of active users
                  </p>
                </div>
              </div>
            )}

            {/* If wrong, show failed test input diagnostics */}
            {activeHistorySubmission.failedTestCase && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2 my-4 select-text">
                <div className="text-xs font-bold text-red-400 flex items-center gap-1 font-sans select-none">
                  <AlertCircle className="h-4 w-4" />
                  Failed Scenario outputs:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed select-all">
                  <div>
                    <strong className="text-neutral-500 font-sans block text-[10px] uppercase font-bold tracking-wide">Failing Input:</strong>
                    <span className="text-neutral-200">{activeHistorySubmission.failedTestCase.input}</span>
                  </div>
                  <div>
                    <strong className="text-neutral-500 font-sans block text-[10px] uppercase font-bold tracking-wide">Expected Output:</strong>
                    <span className="text-emerald-400/90">{activeHistorySubmission.failedTestCase.expected}</span>
                  </div>
                  <div>
                    <strong className="text-neutral-500 font-sans block text-[10px] uppercase font-bold tracking-wide">Actual Returned:</strong>
                    <span className="text-red-400">{activeHistorySubmission.failedTestCase.actual}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Read only code block editor */}
            <div className="flex-1 overflow-y-auto min-h-[220px] bg-[#0f1115] border border-neutral-850 rounded-xl p-4 select-text">
              <pre className="font-mono text-xs text-neutral-200 leading-relaxed whitespace-pre font-medium select-all">
                {activeHistorySubmission.code}
              </pre>
            </div>

            {/* Modal footer back options */}
            <div className="pt-4 mt-4 border-t border-neutral-850 flex justify-end shrink-0 select-none">
              <button
                onClick={() => setActiveHistorySubmission(null)}
                className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-semibold px-5 py-2 rounded-xl text-xs transition duration-150 active:scale-95"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Quick structural helper for X button inside submissions inspector popup
const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={props.className}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
