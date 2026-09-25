import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Award,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Drive, ForumPost } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from './StatusBadge.tsx';

interface DriveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: Drive;
  isEligible: boolean;
  eligibilityReason: string;
  hasApplied: boolean;
  onApply: () => void;
  onOpenResumeScorer: () => void;
}

export const DriveDetailsModal: React.FC<DriveDetailsModalProps> = ({
  isOpen,
  onClose,
  drive,
  isEligible,
  eligibilityReason,
  hasApplied,
  onApply,
  onOpenResumeScorer,
}) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'rounds' | 'forum'>('details');

  // Forum state
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'interview-prep' | 'eligibility' | 'general'>('general');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchForum = async () => {
      try {
        const res = await fetch(`/api/forum/${drive._id}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Error fetching forum:', err);
      }
    };

    fetchForum();
  }, [isOpen, drive._id]);

  if (!isOpen) return null;

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !token) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${drive._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        setPosts((prev) => [post, ...prev]);
        setNewPostTitle('');
        setNewPostContent('');
      }
    } catch (err) {
      console.error('Error posting:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId: string) => {
    const text = replyInputs[postId]?.trim();
    if (!text || !token) return;

    try {
      const res = await fetch(`/api/forum/reply/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const reply = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, reply] } : p))
        );
        setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/forum/upvote/${postId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <img
              src={drive.companyLogo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80'}
              alt={drive.companyName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{drive.role}</h2>
                <StatusBadge status={drive.status} />
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-2">
                <span>{drive.companyName}</span>
                <span>·</span>
                <span className="text-blue-600 font-semibold">{drive.ctc} LPA CTC</span>
                <span>·</span>
                <span>{drive.location}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Controls */}
        <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'details' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Job Overview & Criteria
            </button>
            <button
              onClick={() => setActiveTab('rounds')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'rounds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Recruitment Rounds ({drive.rounds?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'forum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Discussion & Experiences ({posts.length})
            </button>
          </div>

          {/* Eligibility Banner */}
          <div className="text-xs hidden sm:flex items-center gap-1.5">
            {isEligible ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for Drive
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1" title={eligibilityReason}>
                <AlertCircle className="w-3.5 h-3.5" /> Ineligible: {eligibilityReason}
              </span>
            )}
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Compensation</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{drive.ctc} LPA</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Min. CGPA Cutoff</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{drive.eligibility.cgpaMin} / 10</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Openings</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{drive.openings} Positions</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Deadline</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{drive.deadline}</div>
                </div>
              </div>

              {/* Eligibility Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Official Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Allowed Branches:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {drive.eligibility.branches.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Passing Batch:</span>
                    <span className="font-semibold text-slate-800">{drive.eligibility.batch}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Max Active Backlogs:</span>
                    <span className="font-semibold text-slate-800">
                      {drive.eligibility.backlogsAllowed === 0 ? 'No active backlogs (0)' : `${drive.eligibility.backlogsAllowed} Allowed`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Your Status:</span>
                    <span className={`font-semibold ${isEligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isEligible ? 'Eligible to Apply' : eligibilityReason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Required Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drive.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded font-medium border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Job Description & Scope
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {drive.description}
                </div>
              </div>
            </>
          )}

          {activeTab === 'rounds' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Candidates must clear each round sequentially to advance in the selection process.
              </div>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {drive.rounds.map((round, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      {round.order || idx + 1}
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Round {round.order || idx + 1}: {round.name}</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {round.description || 'Evaluation of core competencies and problem solving.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'forum' && (
            <div className="space-y-6">
              {/* New Post Form */}
              {user && (
                <form onSubmit={handleCreatePost} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-900">
                    Ask a Question or Share an Interview Tip
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Title: e.g. What questions were asked in coding round?"
                      className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value as any)}
                      className="text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="general">General</option>
                      <option value="interview-prep">Interview Prep</option>
                      <option value="eligibility">Eligibility</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share specific details, resources, or experiences..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" /> Post Discussion
                    </button>
                  </div>
                </form>
              )}

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No discussions posted yet. Be the first to start a conversation!
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {post.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>{post.authorName}</span>
                            <span>·</span>
                            <span>{post.authorRole}</span>
                            <span>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpvote(post.id)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            post.upvotedBy?.includes(user?.id || '')
                              ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{post.upvotes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* Replies */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="pl-4 border-l-2 border-slate-100 space-y-2 mt-3">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="text-xs bg-slate-50 p-2.5 rounded-lg">
                              <div className="font-semibold text-slate-800 text-[11px]">
                                {reply.authorName}{' '}
                                <span className="font-normal text-slate-400">({reply.authorRole})</span>
                              </div>
                              <p className="text-slate-600 mt-0.5">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Reply Form */}
                      {user && (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={replyInputs[post.id] || ''}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="Write a reply..."
                            className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => handleReply(post.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onOpenResumeScorer}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Resume Match & Gap Analysis</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Close
            </button>

            {user?.role === 'student' && (
              <button
                disabled={hasApplied || !isEligible}
                onClick={onApply}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 ${
                  hasApplied
                    ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                    : !isEligible
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </>
                ) : (
                  <span>Apply for this Drive</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
