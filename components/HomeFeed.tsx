
import React, { useState } from 'react';
import { HomePost, User } from '../types';
import { useData } from '../context/DataContext';

interface HomeFeedProps {
  user?: User;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ user }) => {
  const { posts, createPost, deletePost, toggleLike, submitReport } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter posts based on visibility
  const visiblePosts = posts.filter(p => p.active && (p.visibility === 'public' || p.district === user?.district));

  const handleCreatePost = async (postData: Partial<HomePost>) => {
    await createPost(postData);
    setShowCreateModal(false);
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
        />
      ))}

      {showCreateModal && (
        <CreatePostModal 
          user={user} 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreatePost} 
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
}> = ({ post, currentUser, onDelete, onReport, onLike }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [showOptions, setShowOptions] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isOwner = currentUser?.id === post.author.id;
  
  // Check if current user has liked the post
  const isLiked = currentUser && post.likedBy ? post.likedBy[currentUser.id] : false;

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

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 transition-all relative">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-50 flex items-center justify-center text-white font-black text-lg">
            {post.author.avatar}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 leading-none">{post.author.name}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{post.author.district}</span>
              <span className="text-[10px] text-slate-400">• {timeAgo(post.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
            {showOptions && (
                <div className="absolute right-0 top-10 bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden z-20 w-32 animate-fadeIn">
                    {(isAdmin || isOwner) && (
                        <button onClick={() => onDelete(post.id)} className="w-full text-left px-4 py-3 text-red-500 text-xs font-bold hover:bg-red-50">Delete</button>
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
