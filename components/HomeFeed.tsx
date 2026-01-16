
import React, { useState, useEffect, useRef } from 'react';
import { HomePost, User } from '../types';
import { useData } from '../context/DataContext';
import { VerificationBadge } from '../constants';
import { AdminActionSheet } from './AdminActionSheet';

interface HomeFeedProps {
  user?: User;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ user }) => {
  const { posts, createPost, deletePost, toggleLike, submitReport } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  
  // Admin Action State
  const [adminAction, setAdminAction] = useState<{
    userId: string;
    contentId?: string;
    type: 'post' | 'user_only';
  } | null>(null);

  // Filter posts based on visibility
  const visiblePosts = posts.filter(p => p.active && (p.visibility === 'public' || p.district === user?.district));

  const handleCreatePost = async (postData: Partial<HomePost>) => {
    await createPost(postData);
    setShowCreateModal(false);
  };

  const openAdminAction = (userId: string, contentId?: string, type: 'post' | 'user_only' = 'user_only') => {
      // Check permission locally to show UI, but AdminActionSheet has final strict check
      if (user?.role === 'admin' || user?.role === 'super_admin') {
          setAdminAction({ userId, contentId, type });
      }
  };

  return (
    <div className="flex flex-col gap-4 p-4 animate-fadeIn pb-24">
      <div 
        onClick={() => setShowCreateModal(true)}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
          {user?.name?.[0] || 'U'}
        </div>
        <div className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-slate-400 text-sm hover:bg-slate-100 transition-colors pointer-events-none">
          Maxaad maanta soo kordhisay degmada?
        </div>
        <button className="text-emerald-600 p-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {visiblePosts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUser={user} 
          onDelete={deletePost} 
          onReport={submitReport} 
          onLike={toggleLike}
          onComment={() => setActiveCommentPostId(post.id)}
          onAdminAction={openAdminAction}
        />
      ))}

      {showCreateModal && (
        <CreatePostModal 
          user={user} 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreatePost} 
        />
      )}

      {activeCommentPostId && (
        <CommentModal 
          postId={activeCommentPostId} 
          onClose={() => setActiveCommentPostId(null)} 
          currentUser={user}
        />
      )}

      {user && (
        <AdminActionSheet 
            isOpen={!!adminAction}
            onClose={() => setAdminAction(null)}
            currentUser={user}
            targetUserId={adminAction?.userId || null}
            targetContentId={adminAction?.contentId}
            contentType={adminAction?.type || null}
        />
      )}
    </div>
  );
};

const PostCard: React.FC<{ 
  post: HomePost; 
  currentUser?: User; 
  onDelete: (id: string) => void; 
  onReport: (data: any) => void;
  onLike: (id: string) => void;
  onComment: () => void;
  onAdminAction: (userId: string, contentId?: string, type?: 'post' | 'user_only') => void;
}> = ({ post, currentUser, onDelete, onReport, onLike, onComment, onAdminAction }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [showOptions, setShowOptions] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isOwner = currentUser?.id === post.author.id;
  
  // Check if current user has liked the post
  const isLiked = currentUser && post.likedBy ? post.likedBy[currentUser.id] : false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleReport = () => {
    onReport({ type: 'post', targetId: post.id, reason: 'Inappropriate content' });
    setHasReported(true);
    setShowOptions(false);
  };

  const handleUserClick = (e: React.MouseEvent) => {
      if (isAdmin) {
          e.stopPropagation();
          onAdminAction(post.author.id, undefined, 'user_only');
      }
  };

  const handlePostContextMenu = (e: React.MouseEvent) => {
      if (isAdmin) {
          e.preventDefault();
          onAdminAction(post.author.id, post.id, 'post');
      }
  };

  const handleAdminOptions = () => {
      if (isAdmin) {
          onAdminAction(post.author.id, post.id, 'post');
          setShowOptions(false);
      }
  };

  return (
    <div 
        onContextMenu={handlePostContextMenu}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 transition-all relative select-none"
    >
      <div className="p-4 flex items-center justify-between">
        <div 
            className={`flex items-center gap-3 ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={handleUserClick}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-50 flex items-center justify-center text-white font-black text-lg">
            {post.author.avatar}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 leading-none flex items-center">
              {post.author.name}
              {post.author.isVerified && <VerificationBadge />}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{post.author.district}</span>
              <span className="text-[10px] text-slate-400">• {timeAgo(post.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="relative" ref={optionsRef}>
            <button onClick={() => setShowOptions(!showOptions)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
            {showOptions && (
                <div className="absolute right-0 top-10 bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden z-20 w-32 animate-fadeIn">
                    {(isAdmin || isOwner) && (
                        <button onClick={() => onDelete(post.id)} className="w-full text-left px-4 py-3 text-red-500 text-xs font-bold hover:bg-red-50">Delete</button>
                    )}
                    {isAdmin && (
                        <button onClick={handleAdminOptions} className="w-full text-left px-4 py-3 text-slate-700 text-xs font-bold hover:bg-slate-50">Admin Options</button>
                    )}
                    <button 
                      onClick={handleReport} 
                      disabled={hasReported}
                      className={`w-full text-left px-4 py-3 text-xs font-bold ${hasReported ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {hasReported ? 'Reported' : 'Report'}
                    </button>
                </div>
            )}
        </div>
      </div>

      {(post.title || post.description) && (
        <div className="px-4 pb-3">
          {post.title && <h3 className="font-black text-slate-900 mb-1 leading-tight">{post.title}</h3>}
          {post.description && <p className="text-sm text-slate-600 leading-relaxed">{post.description}</p>}
        </div>
      )}

      <div className="relative">
        {post.type === 'awareness' && post.beforeImg && post.afterImg ? (
          <div className="relative aspect-[4/3] group touch-none">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.afterImg})` }} />
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.beforeImg})`, clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} />
            <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-black backdrop-blur-md">BEFORE</div>
            <div className="absolute top-4 right-4 bg-emerald-600/80 text-white text-[10px] px-2 py-1 rounded font-black backdrop-blur-md">AFTER</div>
            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none" style={{ left: `${sliderPos}%` }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-emerald-500">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7l-4 4m0 0l4 4m-4-4h16m0 0l-4-4m4 4l-4 4" />
                </svg>
              </div>
            </div>
            <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
          </div>
        ) : post.image ? (
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-96" />
        ) : null}
      </div>

      <div className="p-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onLike(post.id)} 
            className={`flex items-center gap-2 font-bold text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500'}`}
          >
            <svg className={`w-6 h-6 transition-transform active:scale-75 ${isLiked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{post.likes}</span>
          </button>

          <button 
            onClick={onComment}
            className="flex items-center gap-2 font-bold text-xs transition-colors text-slate-500 hover:text-emerald-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentModal: React.FC<{ postId: string; onClose: () => void; currentUser?: User }> = ({ postId, onClose, currentUser }) => {
    const { postComments, addComment, toggleCommentLike } = useData();
    const [commentText, setCommentText] = useState('');
    const comments = postComments[postId] || [];
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const startY = useRef(0);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        await addComment(postId, commentText);
        setCommentText('');
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const deltaY = e.touches[0].clientY - startY.current;
        if (deltaY > 0) {
            setDragOffset(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (dragOffset > 100) {
            onClose();
        } else {
            setDragOffset(0);
        }
    };

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
            <div 
                className="bg-white w-full max-w-lg rounded-t-[32px] h-[85vh] flex flex-col shadow-2xl transition-transform duration-200"
                style={{ transform: `translateY(${dragOffset}px)` }}
            >
                {/* Drag Handle */}
                <div 
                    className="flex justify-center p-4 cursor-grab active:cursor-grabbing border-b border-slate-50"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={onClose} // Fallback for desktop clicking the top area
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                <div className="px-4 pb-2 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-lg">Comments <span className="text-slate-400 font-normal text-sm">({comments.length})</span></h3>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
                    {comments.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2">
                             <svg className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                             <p className="text-sm font-bold">No comments yet</p>
                        </div>
                    )}
                    {comments.map(c => {
                        const isLiked = currentUser && c.likedBy ? c.likedBy[currentUser.id] : false;
                        return (
                            <div key={c.id} className="flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-xs shrink-0">
                                    {c.authorAvatar}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none inline-block max-w-full">
                                        <div className="font-bold text-slate-900 text-sm mb-0.5 flex items-center">
                                            {c.authorName}
                                            {c.authorVerified && <VerificationBadge />}
                                        </div>
                                        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{c.text}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 ml-2">
                                        <span className="text-[11px] font-medium text-slate-400">{timeAgo(c.timestamp)}</span>
                                        <button 
                                            onClick={() => toggleCommentLike(postId, c.id)}
                                            className={`text-[11px] font-bold ${isLiked ? 'text-red-500' : 'text-slate-500'}`}
                                        >
                                            Like
                                        </button>
                                        {(c.likes || 0) > 0 && (
                                            <div className="flex items-center gap-1 bg-white shadow-sm rounded-full px-1.5 py-0.5 border border-slate-100 -mt-6 -mr-2">
                                                <div className="bg-red-500 rounded-full p-0.5">
                                                    <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-medium">{c.likes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleCommentLike(postId, c.id)}
                                    className="pt-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <svg className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                    <div ref={commentsEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100 pb-8">
                    <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
                        <textarea
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            rows={1}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none max-h-32 font-medium text-slate-900 placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="bg-emerald-600 text-white p-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

interface CreatePostModalProps {
  user?: User;
  onClose: () => void;
  onCreate: (post: Partial<HomePost>) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ user, onClose, onCreate }) => {
  const [postType, setPostType] = useState<'standard' | 'awareness'>('standard');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (postType === 'standard') {
      if (!description.trim() && !image) return;
      onCreate({
        type: 'standard',
        description,
        image: image || undefined,
      });
    } else {
      if (!beforeImage || !afterImage) return;
      onCreate({
        type: 'awareness',
        title: 'Before and after',
        description,
        beforeImg: beforeImage,
        afterImg: afterImage,
      });
    }
  };

  const canSubmit = postType === 'standard' 
    ? (description.trim().length > 0 || !!image) 
    : (!!beforeImage && !!afterImage);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-[32px] p-6 animate-slideUp shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Create New Post</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button onClick={() => setPostType('standard')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${postType === 'standard' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Standard Image</button>
          <button onClick={() => setPostType('awareness')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${postType === 'awareness' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Before & After</button>
        </div>

        <div className="space-y-4 mb-6">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you want to share with your district?" className="w-full bg-slate-50 rounded-2xl p-4 text-slate-800 font-medium border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none resize-none h-28" />

          {postType === 'standard' ? (
            <div className="relative">
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImage)} className="hidden" id="standard-upload" />
              <label htmlFor="standard-upload" className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${image ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                {image ? <img src={image} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-slate-500 font-bold text-sm">Select Image</span>}
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBeforeImage)} className="hidden" id="before-upload" />
                <label htmlFor="before-upload" className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${beforeImage ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                  {beforeImage ? <img src={beforeImage} alt="Before" className="w-full h-full object-cover" /> : <span className="block text-[10px] font-black uppercase text-slate-400">Before</span>}
                </label>
              </div>
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAfterImage)} className="hidden" id="after-upload" />
                <label htmlFor="after-upload" className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${afterImage ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                  {afterImage ? <img src={afterImage} alt="After" className="w-full h-full object-cover" /> : <span className="block text-[10px] font-black uppercase text-slate-400">After</span>}
                </label>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={!canSubmit} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-30">Post</button>
      </div>
    </div>
  );
};
