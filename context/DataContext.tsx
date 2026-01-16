import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, push, update, remove, get, runTransaction } from 'firebase/database';
import { User, Channel, Message, HomePost, District, Report, Comment, UserPermissions, Role, ToastMessage } from '../types';
import { ToastContainer } from '../components/Toast';

interface DataContextType {
  currentUser: User | null;
  users: Record<string, User>;
  channels: Channel[];
  messages: Record<string, Message[]>;
  posts: HomePost[];
  districts: District[];
  reports: Report[];
  postComments: Record<string, Comment[]>;
  unreadCounts: Record<string, number>;
  onlineUsersCount: (channel: Channel | undefined) => number;
  registerUser: (user: Partial<User>) => Promise<void>;
  sendMessage: (channelId: string, text: string, type: 'text' | 'image' | 'work_done', imageBase64?: string) => Promise<void>;
  createPost: (post: Partial<HomePost>) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
  addDistrict: (name: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  blockUserFromChannel: (channelId: string, userId: string) => Promise<void>;
  toggleUserVerification: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: Role, permissions?: UserPermissions) => Promise<void>;
  updateChannel: (channelId: string, data: Partial<Channel>) => Promise<void>;
  deleteMessage: (channelId: string, messageId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleChannelStatus: (channelId: string, status: 'open' | 'closed') => Promise<void>;
  submitReport: (report: Partial<Report>) => Promise<void>;
  dismissReport: (reportId: string) => Promise<void>;
  resolveReport: (reportId: string) => Promise<void>;
  markChannelAsRead: (channelId: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dis_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<Record<string, User>>({});
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastReadTimes, setLastReadTimes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dis_last_read');
    return saved ? JSON.parse(saved) : {};
  });

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Update online status periodically
  useEffect(() => {
    if (!currentUser) return;
    
    const updatePresence = () => {
       update(ref(database, `app/users/${currentUser.id}`), {
          lastSeen: Date.now()
       });
    };

    const interval = setInterval(updatePresence, 60000); // Every minute
    updatePresence(); // Initial call
    return () => clearInterval(interval);
  }, [currentUser]);

  // Calculate unread counts
  const unreadCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    channels.forEach(ch => {
      const channelMsgs = messages[ch.id] || [];
      const lastRead = lastReadTimes[ch.id] || (currentUser?.createdAt || 0);
      counts[ch.id] = channelMsgs.filter(m => m.createdAt > lastRead && m.senderId !== currentUser?.id).length;
    });
    return counts;
  }, [messages, lastReadTimes, channels, currentUser]);

  const onlineUsersCount = (channel: Channel | undefined) => {
      if (!channel) return 0;
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const userList = Object.values(users) as User[];
      const activeUsers = userList.filter(u => u.lastSeen && u.lastSeen > fiveMinutesAgo);
      
      if (channel.type === 'main') {
          return activeUsers.length;
      }
      return activeUsers.filter(u => u.district === channel.district).length;
  };

  // Sync Logic
  useEffect(() => {
    const refs = {
      users: ref(database, 'app/users'),
      channels: ref(database, 'app/channels'),
      messages: ref(database, 'app/messages'),
      posts: ref(database, 'app/posts'),
      districts: ref(database, 'app/districts'),
      reports: ref(database, 'app/reports'),
      comments: ref(database, 'app/post_comments')
    };

    const unsubUsers = onValue(refs.users, (snapshot) => {
      const val = snapshot.val() || {};
      setUsers(val);
      localStorage.setItem('app_users', JSON.stringify(val));
    });

    const unsubChannels = onValue(refs.channels, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        let list = Object.values(val) as Channel[];
        // Sort: Main first, then by lastActivity (most recent first)
        list = list.sort((a, b) => {
            if (a.type === 'main') return -1;
            if (b.type === 'main') return 1;
            return (b.lastActivity || b.createdAt) - (a.lastActivity || a.createdAt);
        });
        setChannels(list);
        localStorage.setItem('app_channels', JSON.stringify(list));
      } else {
        seedChannels();
      }
    });

    const unsubMessages = onValue(refs.messages, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const formatted: Record<string, Message[]> = {};
        Object.keys(val).forEach(channelId => {
          const chanMsgs = val[channelId];
          formatted[channelId] = Object.values(chanMsgs).map((m: any) => ({
            ...m,
            timestamp: new Date(m.createdAt),
            mediaUrl: m.imageBase64
          })).sort((a: any, b: any) => a.createdAt - b.createdAt);
        });
        setMessages(formatted);
        localStorage.setItem('app_messages', JSON.stringify(formatted));
      }
    });

    const unsubPosts = onValue(refs.posts, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Careful mapping to ensure active status is respected and data is robust
        const list = Object.values(val).map((p: any) => ({
          ...p,
          date: new Date(p.createdAt).toLocaleDateString(),
          timestamp: p.createdAt,
          likes: p.likes || 0,
          likedBy: p.likedBy || {},
          comments: p.comments || 0,
          author: {
             id: p.authorId,
             name: p.authorName,
             avatar: p.authorName?.[0] || '?',
             district: p.district,
             isVerified: users[p.authorId]?.isVerified || false 
          },
          image: p.imageBase64,
          beforeImg: p.beforeImageBase64,
          afterImg: p.afterImageBase64
        })).sort((a: any, b: any) => b.createdAt - a.createdAt) as HomePost[];
        setPosts(list);
        localStorage.setItem('app_posts', JSON.stringify(list));
      }
    });

    const unsubDistricts = onValue(refs.districts, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const list = Object.values(val) as string[];
        setDistricts(list);
        localStorage.setItem('app_districts', JSON.stringify(list));
      } else {
         const defaults = ['Deg. Hodan', 'Deg. Deyniile', 'Deg. Yaqshiid'];
         set(refs.districts, defaults);
      }
    });

    const unsubReports = onValue(refs.reports, (snapshot) => {
      const val = snapshot.val() || {};
      setReports(Object.values(val));
    });

    const unsubComments = onValue(refs.comments, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const formatted: Record<string, Comment[]> = {};
        Object.keys(val).forEach(postId => {
           formatted[postId] = Object.values(val[postId] as Record<string, any>).map((c: any) => ({
             ...c,
             timestamp: c.createdAt,
             likes: c.likes || 0,
             likedBy: c.likedBy || {},
             authorVerified: users[c.authorId]?.isVerified || false 
           })).sort((a: any, b: any) => a.createdAt - b.createdAt);
        });
        setPostComments(formatted);
      }
    });

    return () => {
      unsubUsers();
      unsubChannels();
      unsubMessages();
      unsubPosts();
      unsubDistricts();
      unsubReports();
      unsubComments();
    };
  }, [users]); // Depend on users to keep author verification up to date

  const seedChannels = async () => {
    const mainChannel: Channel = {
      id: 'main',
      name: '🌍 Magaalada Guud',
      icon: 'M',
      type: 'main',
      status: 'open',
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    await set(ref(database, 'app/channels/main'), mainChannel);
    
    const defaults = ['Deg. Hodan', 'Deg. Deyniile', 'Deg. Yaqshiid'];
    defaults.forEach(async (d) => {
       const id = d.toLowerCase().replace(/[^a-z0-9]/g, '');
       const chan: Channel = {
         id,
         name: `📍 ${d}`,
         icon: d[5],
         type: 'district',
         district: d,
         status: 'open',
         createdAt: Date.now(),
         lastActivity: Date.now()
       };
       await set(ref(database, `app/channels/${id}`), chan);
    });
  };

  const registerUser = async (userData: Partial<User>) => {
    const newUser: User = {
      id: userData.id!,
      name: userData.name!,
      whatsapp: userData.whatsapp!,
      bio: userData.bio || '',
      district: userData.district!,
      role: 'user',
      status: 'active',
      isVerified: false,
      permissions: { managePosts: false, manageDistricts: false, manageUsers: false, verifyUsers: false, manageChannels: false },
      createdAt: Date.now(),
      lastSeen: Date.now(),
      ...userData
    };
    if (newUser.avatarBase64 === undefined) delete newUser.avatarBase64;
    
    await set(ref(database, `app/users/${newUser.id}`), newUser);
    login(newUser.id);
  };

  const login = (userId: string) => {
    const userRef = ref(database, `app/users/${userId}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const u = snapshot.val();
        if (u.status === 'banned') {
          alert("This account has been banned.");
          return;
        }
        setCurrentUser(u);
        localStorage.setItem('dis_user', JSON.stringify(u));
      }
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dis_user');
  };

  const markChannelAsRead = (channelId: string) => {
      const now = Date.now();
      const updated = { ...lastReadTimes, [channelId]: now };
      setLastReadTimes(updated);
      localStorage.setItem('dis_last_read', JSON.stringify(updated));
  };

  const sendMessage = async (channelId: string, text: string, type: 'text' | 'image' | 'work_done', imageBase64?: string) => {
    if (!currentUser) return;
    const channelRef = ref(database, `app/messages/${channelId}`);
    const newMessageRef = push(channelRef);
    const message = {
      id: newMessageRef.key,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      type,
      imageBase64: imageBase64 || null,
      createdAt: Date.now(),
      deleted: false
    };
    await set(newMessageRef, message);
    
    update(ref(database, `app/channels/${channelId}`), {
      lastMessage: type === 'image' ? 'Sent an image' : text,
      lastActivity: Date.now()
    });
    markChannelAsRead(channelId);
  };

  const createPost = async (postData: Partial<HomePost>) => {
    if (!currentUser) return;
    const postsRef = ref(database, 'app/posts');
    const newPostRef = push(postsRef);
    const post = {
      id: newPostRef.key,
      authorId: currentUser.id,
      authorName: currentUser.name,
      district: currentUser.district,
      type: postData.type,
      title: postData.title || '',
      description: postData.description || '',
      imageBase64: postData.image || null,
      beforeImageBase64: postData.beforeImg || null,
      afterImageBase64: postData.afterImg || null,
      visibility: 'public',
      active: true,
      createdAt: Date.now(),
      likes: 0,
      comments: 0
    };
    await set(newPostRef, post);
    showToast('success', 'Post created successfully!');
  };

  const toggleLike = async (postId: string) => {
    if (!currentUser) return;
    const postRef = ref(database, `app/posts/${postId}`);
    
    // We do NOT modify the 'active' status or 'visibility' here to prevent the post from disappearing from the feed.
    await runTransaction(postRef, (post) => {
      if (post) {
        if (post.likedBy && post.likedBy[currentUser.id]) {
          post.likes = (post.likes || 1) - 1;
          if (post.likes < 0) post.likes = 0;
          post.likedBy[currentUser.id] = null;
        } else {
          post.likes = (post.likes || 0) + 1;
          if (!post.likedBy) post.likedBy = {};
          post.likedBy[currentUser.id] = true;
        }
      }
      return post;
    });
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const commentRef = push(ref(database, `app/post_comments/${postId}`));
    const comment: Comment = {
      id: commentRef.key!,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.name[0],
      text,
      timestamp: Date.now(),
      likes: 0
    };
    await set(commentRef, { ...comment, createdAt: Date.now() });

    const postRef = ref(database, `app/posts/${postId}`);
    await runTransaction(postRef, (post) => {
      if (post) {
        post.comments = (post.comments || 0) + 1;
      }
      return post;
    });
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
      if (!currentUser) return;
      const commentRef = ref(database, `app/post_comments/${postId}/${commentId}`);
      await runTransaction(commentRef, (comment) => {
          if (comment) {
              if (comment.likedBy && comment.likedBy[currentUser.id]) {
                  comment.likes = (comment.likes || 1) - 1;
                  comment.likedBy[currentUser.id] = null;
              } else {
                  comment.likes = (comment.likes || 0) + 1;
                  if (!comment.likedBy) comment.likedBy = {};
                  comment.likedBy[currentUser.id] = true;
              }
          }
          return comment;
      });
  };

  const addDistrict = async (name: string) => {
    const newDistricts = [...districts, name];
    await set(ref(database, 'app/districts'), newDistricts);
    
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const chan: Channel = {
      id,
      name: `📍 ${name}`,
      icon: name.charAt(0).toUpperCase(),
      type: 'district',
      district: name,
      status: 'open',
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    await set(ref(database, `app/channels/${id}`), chan);
    showToast('success', 'District added successfully');
  };

  const banUser = async (userId: string) => {
    await update(ref(database, `app/users/${userId}`), { status: 'banned' });
    showToast('success', 'User has been banned globally');
  };

  const unbanUser = async (userId: string) => {
    await update(ref(database, `app/users/${userId}`), { status: 'active' });
    showToast('success', 'User has been unbanned');
  };

  const blockUserFromChannel = async (channelId: string, userId: string) => {
      await update(ref(database, `app/channels/${channelId}/blockedUsers`), {
          [userId]: true
      });
      showToast('success', 'User blocked from this group');
  };

  const toggleUserVerification = async (userId: string) => {
      const userRef = ref(database, `app/users/${userId}`);
      const userSnap = await get(userRef);
      if(userSnap.exists()) {
          const current = userSnap.val().isVerified || false;
          await update(userRef, { isVerified: !current });
          showToast('success', `User ${current ? 'unverified' : 'verified'}`);
      }
  };

  const updateUserRole = async (userId: string, role: Role, permissions?: UserPermissions) => {
      const updates: any = { role };
      if (permissions) {
          updates.permissions = permissions;
      }
      await update(ref(database, `app/users/${userId}`), updates);
      showToast('success', 'User role updated');
  };

  const updateChannel = async (channelId: string, data: Partial<Channel>) => {
      await update(ref(database, `app/channels/${channelId}`), data);
      showToast('success', 'Channel updated');
  };

  const deleteMessage = async (channelId: string, messageId: string) => {
    await update(ref(database, `app/messages/${channelId}/${messageId}`), { 
      deleted: true,
      text: "This message was deleted by the admin",
      imageBase64: null 
    });
    showToast('success', 'Message deleted');
  };

  const deletePost = async (postId: string) => {
    await update(ref(database, `app/posts/${postId}`), { active: false });
    showToast('success', 'Post deleted');
  };

  const toggleChannelStatus = async (channelId: string, status: 'open' | 'closed') => {
    await update(ref(database, `app/channels/${channelId}`), { status });
    showToast('success', `Channel ${status}`);
  };

  const submitReport = async (reportData: Partial<Report>) => {
    if(!currentUser) return;
    const reportsRef = ref(database, 'app/reports');
    const newReportRef = push(reportsRef);
    await set(newReportRef, {
      id: newReportRef.key,
      reporterId: currentUser.id,
      status: 'pending',
      createdAt: Date.now(),
      ...reportData
    });
    showToast('info', 'Report submitted. Thank you.');
  };

  const dismissReport = async (reportId: string) => {
     await update(ref(database, `app/reports/${reportId}`), { status: 'dismissed' });
     showToast('success', 'Report dismissed');
  };

  const resolveReport = async (reportId: string) => {
     await update(ref(database, `app/reports/${reportId}`), { status: 'resolved' });
     showToast('success', 'Report resolved');
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      users,
      channels,
      messages,
      posts,
      districts,
      reports,
      postComments,
      unreadCounts,
      onlineUsersCount,
      registerUser,
      sendMessage,
      createPost,
      toggleLike,
      addComment,
      toggleCommentLike,
      addDistrict,
      banUser,
      unbanUser,
      blockUserFromChannel,
      toggleUserVerification,
      updateUserRole,
      updateChannel,
      deleteMessage,
      deletePost,
      toggleChannelStatus,
      submitReport,
      dismissReport,
      resolveReport,
      markChannelAsRead,
      login,
      logout,
      showToast
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DataContext.Provider>
  );
};