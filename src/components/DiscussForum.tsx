import React, { useState, useEffect } from 'react';
import { MessageSquare, ChevronUp, Search, Filter, Plus, Calendar, User, Eye, Send, ArrowLeft, Tag, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface DiscussForumProps {
  profile: UserProfile;
  theme?: 'dark' | 'light';
}

interface ForumComment {
  id: string;
  authorName: string;
  authorPhoto?: string;
  authorEmail: string;
  content: string;
  timestamp: string;
  upvotes: number;
}

interface ForumTopic {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorPhoto?: string;
  authorEmail: string;
  content: string;
  upvotes: number;
  repliesCount: number;
  timestamp: string;
  comments: ForumComment[];
  isUpvoted?: boolean;
}

const INITIAL_THREADS: ForumTopic[] = [
  {
    id: 'thread-1',
    title: 'Optimal Approach to Solve "Edit Distance" utilizing Space-Optimized Array?',
    category: 'Dynamic Programming',
    authorName: 'Linus Git-Fan',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    authorEmail: 'linus.git@algocode.io',
    content: `I am trying to solve the Hard Edit Distance challenge. I have a 2D matrix DP solution working with O(M*N) space, but I want to optimize it to O(min(M, N)) space.
Since we only ever need the previous row's values, is it possible to use just two arrays? If someone has a code snippet in Python or JS, I would greatly appreciate it!`,
    upvotes: 42,
    repliesCount: 3,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 'com-1',
        authorName: 'Alex Rivera',
        authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        authorEmail: 'alex.rivera@algocode.io',
        content: `Yes! You can definitely reduce the space. You only need the current row and the previous row. 

Here is the clean implementation structure in Python:
\`\`\`python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        if m < n:
            word1, word2 = word2, word1
            m, n = n, m
        
        dp = list(range(n + 1))
        for i in range(1, m + 1):
            prev = dp[0]
            dp[0] = i
            for j in range(1, n + 1):
                temp = dp[j]
                if word1[i-1] == word2[j-1]:
                    dp[j] = prev
                else:
                    dp[j] = 1 + min(prev, dp[j-1], dp[j])
                prev = temp
        return dp[n]
\`\`\`
This achieves O(min(m, n)) space, which passes in exceptionally high memory efficiency tiles on AlgoCode!`,
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        upvotes: 18
      },
      {
        id: 'com-2',
        authorName: 'Ada_Lovelace',
        authorPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
        authorEmail: 'ada.lovelace@algocode.io',
        content: `Excellent explanation Alex! This is the classic row-rolling optimization technique. Also worth noting that this template works for other DP tasks like Longest Common Subsequence.`,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        upvotes: 9
      }
    ]
  },
  {
    id: 'thread-2',
    title: 'Google L4 Interview Experience Draft (London Office // Analytics Core)',
    category: 'Interview Preparation',
    authorName: 'Elon Bytes',
    authorPhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    authorEmail: 'elon.bytes@algocode.io',
    content: `I recently finished my L4 Software Engineer interviews at Google. There were 3 coding rounds and 1 Googleyness/Leadership interview.
For coding, I was asked:
1. Dynamic Programming task on graph path finding (very similar to finding critical paths).
2. Segment tree task (solved with standard HashMap indexing).
3. Two Sum variant focusing on streaming dataset inputs (sliding window worked perfectly).

Tips: Focus heavily on explaining your time complexity tradeoffs BEFORE typing any code. Clear, honest dialog is what got me the Strong Lean-Hire feedback.`,
    upvotes: 89,
    repliesCount: 1,
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    comments: [
      {
        id: 'com-3',
        authorName: 'Grace Hopper',
        authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        authorEmail: 'grace.hopper@algocode.io',
        content: `Congratulations Elon! Google really values candidates who talk through their mental models. Good luck with the team matching phase!`,
        timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
        upvotes: 21
      }
    ]
  },
  {
    id: 'thread-3',
    title: 'How deep is the recursion limit in AlgoCodes execution environment?',
    category: 'General Discussion',
    authorName: 'Grace Hopper',
    authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    authorEmail: 'grace.hopper@algocode.io',
    content: `When submitting recursive Solutions for backtracking graphs, what is the Maximum Call Stack size inside the Node.js sandbox? I hit a standard RangeError but could not determine if it caps at 10,000 frames.`,
    upvotes: 18,
    repliesCount: 0,
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    comments: []
  }
];

export const DiscussForum: React.FC<DiscussForumProps> = ({ profile, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [threads, setThreads] = useState<ForumTopic[]>(() => {
    const saved = localStorage.getItem('algocode_forum_threads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_THREADS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedThread, setSelectedThread] = useState<ForumTopic | null>(null);
  
  // New topic form fields
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General Discussion');
  const [newContent, setNewContent] = useState('');
  
  // New comment fields
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    localStorage.setItem('algocode_forum_threads', JSON.stringify(threads));
  }, [threads]);

  // Topic Categories lists
  const CATEGORIES = ['All', 'Dynamic Programming', 'Interview Preparation', 'General Discussion', 'Algorithms & Code Style', 'Career Advice'];

  // Handle upvoting threads
  const handleUpvoteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(threads.map(t => {
      if (t.id === id) {
        const isUp = t.isUpvoted;
        return {
          ...t,
          upvotes: isUp ? t.upvotes - 1 : t.upvotes + 1,
          isUpvoted: !isUp
        };
      }
      return t;
    }));

    // Sync selectedThread too
    if (selectedThread && selectedThread.id === id) {
      const isUp = selectedThread.isUpvoted;
      setSelectedThread({
        ...selectedThread,
        upvotes: isUp ? selectedThread.upvotes - 1 : selectedThread.upvotes + 1,
        isUpvoted: !isUp
      });
    }
  };

  // Submit main Forum Topic Thread
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTopic: ForumTopic = {
      id: `thread_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      authorName: profile.displayName,
      authorPhoto: profile.photoURL,
      authorEmail: profile.email,
      content: newContent.trim(),
      upvotes: 1,
      repliesCount: 0,
      timestamp: new Date().toISOString(),
      comments: [],
      isUpvoted: true
    };

    setThreads([newTopic, ...threads]);
    
    // Reset inputs
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  // Submit comment inside thread
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedThread) return;

    const newCom: ForumComment = {
      id: `com_${Date.now()}`,
      authorName: profile.displayName,
      authorPhoto: profile.photoURL,
      authorEmail: profile.email,
      content: newCommentText.trim(),
      timestamp: new Date().toISOString(),
      upvotes: 0
    };

    const updatedThread: ForumTopic = {
      ...selectedThread,
      repliesCount: selectedThread.repliesCount + 1,
      comments: [...selectedThread.comments, newCom]
    };

    setThreads(threads.map(t => t.id === selectedThread.id ? updatedThread : t));
    setSelectedThread(updatedThread);
    setNewCommentText('');
  };

  // Filter threads
  const filteredThreads = threads.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 select-none font-sans" id="forum-root">
      
      {/* Thread details view expanded */}
      {selectedThread ? (
        <div className="animate-fade-in" id="forum-thread-detail">
          
          {/* Back button */}
          <button
            onClick={() => setSelectedThread(null)}
            className="flex items-center gap-2 text-neutral-400 hover:text-amber-500 transition mb-6 text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Thread Library
          </button>

          {/* Main Original Post thread layout */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 mb-6">
            
            <div className="flex items-center gap-2 mb-3.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 border border-neutral-850 text-neutral-400">
                {selectedThread.category}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                Posted {new Date(selectedThread.timestamp).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight tracking-tight">
              {selectedThread.title}
            </h1>

            {/* Author box */}
            <div className="flex items-center gap-3 pb-6 border-b border-neutral-900 mb-6">
              <img 
                src={selectedThread.authorPhoto || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                alt={selectedThread.authorName} 
                className="h-9 w-9 rounded-lg object-cover border border-neutral-800"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <div className="text-sm font-semibold text-neutral-200">{selectedThread.authorName}</div>
                <div className="text-[10px] font-mono text-neutral-500">{selectedThread.authorEmail}</div>
              </div>
            </div>

            {/* Content markup block */}
            <div className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed max-w-4xl" id="thread-op-content">
              {selectedThread.content}
            </div>

            {/* Footer triggers */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-900/65">
              
              <button
                onClick={(e) => handleUpvoteThread(selectedThread.id, e)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border transition text-xs font-mono font-semibold cursor-pointer ${
                  selectedThread.isUpvoted
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                    : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <ChevronUp className="h-4 w-4" />
                <span>{selectedThread.upvotes} Upvotes</span>
              </button>

              <span className="text-xs text-neutral-500 font-mono">
                {selectedThread.repliesCount} Direct Contributions
              </span>

            </div>

          </div>

          {/* Comments section */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-neutral-500" />
              Contributions ({selectedThread.comments.length})
            </h3>

            <div className="space-y-4">
              {selectedThread.comments.map((comment) => (
                <div 
                  key={comment.id}
                  className="bg-neutral-950/80 border border-neutral-900/80 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={comment.authorPhoto || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                        alt={comment.authorName} 
                        className="h-8 w-8 rounded-lg object-cover border border-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="text-xs font-semibold text-neutral-200 block">{comment.authorName}</span>
                        <span className="text-[9px] font-mono text-neutral-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-neutral-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed pl-1">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Write comment editor */}
          <form onSubmit={handleSubmitComment} className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-mono text-neutral-400">Post an algorithm tip or alternative code...</span>
            </div>
            
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Provide constructive advice, alternative time-complexities, or language snippets..."
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-3 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-all font-sans"
              required
            />

            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 font-semibold text-neutral-950 px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                <Send className="h-3 w-3" />
                Submit Comment
              </button>
            </div>
          </form>

        </div>
      ) : (
        // Catalog Thread Hub Lists
        <div className="animate-fade-in" id="forum-thread-catalog font-sans">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-2 rounded-lg">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AlgoCode Forums</h1>
              </div>
              <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
                Connect, brainstorm, share optimize algorithms logic, review whiteboard processes, or check real-life technical interview reports securely.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex self-start sm:self-center items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/5 cursor-pointer hover:shadow-amber-500/10 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create New Topic
            </button>
          </div>

          {/* Filtering cards controls */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              
              {/* Forum Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search articles, interview drafts, or user tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>

              {/* Tag navigation category list */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <Filter className="h-4 w-4 text-neutral-500 shrink-0 hidden sm:block" />
                <div className="flex gap-1.5">
                  {CATEGORIES.slice(0, 4).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-neutral-800 text-amber-500 border border-neutral-700'
                          : 'bg-transparent text-neutral-400 border border-transparent hover:bg-neutral-905 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Core Thread rows layout lists */}
          <div className="space-y-4">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <div 
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className="bg-neutral-950 border border-neutral-900/80 hover:border-neutral-800 rounded-2xl p-5 md:p-6 transition cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.015)] group relative"
                >
                  
                  <div className="flex items-start gap-4">
                    
                    {/* Upvote score sidebar */}
                    <button
                      onClick={(e) => handleUpvoteThread(thread.id, e)}
                      className={`flex flex-col items-center justify-center h-12 w-11 rounded-xl border shrink-0 transition ${
                        thread.isUpvoted
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                          : 'bg-neutral-900/50 border-neutral-850 text-neutral-500 group-hover:text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                      }`}
                    >
                      <ChevronUp className="h-4 w-4" />
                      <span className="text-[11px] font-mono font-bold">{thread.upvotes}</span>
                    </button>

                    {/* Thread details brief */}
                    <div className="flex-1 min-w-0 text-left">
                      
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-850 text-amber-500 uppercase tracking-widest leading-none">
                          <Tag className="h-2.5 w-2.5" />
                          {thread.category}
                        </span>
                        
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(thread.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-500 transition leading-snug tracking-tight mb-2 pr-4">
                        {thread.title}
                      </h2>

                      {/* Snippet truncate content */}
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                        {thread.content}
                      </p>

                      {/* Author row metadata */}
                      <div className="flex items-center gap-2 group-hover:bg-neutral-900/30 w-fit p-1 rounded-lg transition duration-200">
                        <img 
                          src={thread.authorPhoto || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                          alt={thread.authorName} 
                          className="h-5.5 w-5.5 rounded-full object-cover border border-neutral-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] text-neutral-400 font-medium">By {thread.authorName}</span>
                        <span className="h-1 w-1 rounded-full bg-neutral-700" />
                        <span className="text-[11px] text-neutral-500 font-mono">{thread.repliesCount} replies</span>
                      </div>

                    </div>

                  </div>

                </div>
              ))
            ) : (
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-12 text-center text-neutral-500">
                <div className="flex flex-col items-center gap-2.5 justify-center">
                  <HelpCircle className="h-8 w-8 text-neutral-700" />
                  <p className="text-sm">No discussion matches found in this category.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* New Topic Creation modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in" id="add-topic-modal">
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-scale-up">
            
            <div className="p-5 border-b border-neutral-900/85">
              <h3 className="text-lg font-bold text-white tracking-tight">Create Discussion Topic</h3>
              <p className="text-xs text-neutral-400">Share your interview experience, request solution walkthroughs, or report an issue.</p>
            </div>

            <form onSubmit={handleCreateTopic} className="p-6">
              
              {/* Category */}
              <div className="mb-4">
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Discussion Segment</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl py-2 px-3 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50 cursor-pointer font-sans"
                >
                  <option value="Dynamic Programming">Dynamic Programming</option>
                  <option value="Interview Preparation">Interview Preparation</option>
                  <option value="General Discussion">General Discussion</option>
                  <option value="Algorithms & Code Style">Algorithms & Code Style</option>
                  <option value="Career Advice">Career Advice</option>
                </select>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Topic Title</label>
                <input
                  type="text"
                  placeholder="Keep titles descriptive (e.g., Optimal Approach to solve DP Segment Tree...)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl py-2 px-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              {/* Content text */}
              <div className="mb-6">
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Problem Details & Markdown Description</label>
                <textarea
                  placeholder="Detail your question, insert failing recursion limits, or share code snippets..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 font-sans"
                  required
                />
              </div>

              {/* Triggers handles */}
              <div className="flex items-center justify-end gap-2 text-sm pt-4 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-neutral-400 hover:bg-neutral-900 text-xs font-semibold cursor-pointer border border-transparent hover:border-neutral-800"
                >
                  Cancel Topic
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 font-bold text-neutral-950 px-4 py-2 rounded-lg text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Publish Topic
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
