
import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, set, push, update, remove, get, child, runTransaction } from 'firebase/database';
import { User, Channel, Message, HomePost, District, Report, Comment } from '../types';
import { CHANNELS as INITIAL_CHANNELS, MOCK_FEED } from '../constants';

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
  registerUser: (user: Partial<User>) => Promise<void>;
  sendMessage: (channelId: string, text: string, type: 'text' | 'image' | 'work_done', imageBase64?: string) => Promise<void>;
  createPost: (post: Partial<HomePost>) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
  addDistrict: (name: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  toggleUserVerification: (userId: string) => Promise<void>;
  deleteMessage: (channelId: string, messageId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleChannelStatus: (channelId: string, status: 'open' | 'closed') => Promise<void>;
  submitReport: (report: Partial<Report>) => Promise<void>;
  markChannelAsRead: (channelId: string) => void;
  login: (userId: string) => void;
  logout: () => void;
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
  const [lastReadTimes, setLastReadTimes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dis_last_read');
    return saved ? JSON.parse(saved) : {};
  });

  // Calculate unread counts based on messages and lastReadTimes
  const unreadCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    channels.forEach(ch => {
      const channelMsgs = messages[ch.id] || [];
      const lastRead = lastReadTimes[ch.id] || (currentUser?.createdAt || 0);
      counts[ch.id] = channelMsgs.filter(m => m.createdAt > lastRead && m.senderId !== currentUser?.id).length;
    });
    return counts;
  }, [messages, lastReadTimes, channels, currentUser]);

  // Load cache on mount
  useEffect(() => {
    const cachedUsers = localStorage.getItem('app_users');
    const cachedChannels = localStorage.getItem('app_channels');
    const cachedMessages = localStorage.getItem('app_messages');
    const cachedPosts = localStorage.getItem('app_posts');
    const cachedDistricts = localStorage.getItem('app_districts');
    
    if (cachedUsers) setUsers(JSON.parse(cachedUsers));
    if (cachedChannels) setChannels(JSON.parse(cachedChannels));
    
    if (cachedMessages) {
      const parsedMessages = JSON.parse(cachedMessages);
      const hydratedMessages: Record<string, Message[]> = {};
      Object.keys(parsedMessages).forEach(channelId => {
        hydratedMessages[channelId] = parsedMessages[channelId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt)
        }));
      });
      setMessages(hydratedMessages);
    }

    if (cachedPosts) setPosts(JSON.parse(cachedPosts));
    if (cachedDistricts) setDistricts(JSON.parse(cachedDistricts));
  }, []);

  // Sync with Firebase
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
        const list = Object.values(val) as Channel[];
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
             avatar: p.authorName[0],
             district: p.district,
             isVerified: users[p.authorId]?.isVerified || false // Sync verification status from users
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
             authorVerified: users[c.authorId]?.isVerified || false // Sync
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
  }, [users]); // Depend on users to re-map verification status in posts/comments

  const seedChannels = async () => {
    const mainChannel: Channel = {
      id: 'main',
      name: '🌍 Magaalada Guud',
      icon: 'M',
      type: 'main',
      status: 'open',
      createdAt: Date.now()
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
         createdAt: Date.now()
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
      permissions: { mainGroup: true, users: false, posts: true, districts: false },
      createdAt: Date.now(),
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
    
    // Update last message
    update(ref(database, `app/channels/${channelId}`), {
      lastMessage: type === 'image' ? 'Sent an image' : text
    });
    // Mark as read for sender
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
  };

  const toggleLike = async (postId: string) => {
    if (!currentUser) return;
    const postRef = ref(database, `app/posts/${postId}`);
    await runTransaction(postRef, (post) => {
      if (post) {
        if (post.likedBy && post.likedBy[currentUser.id]) {
          post.likes = (post.likes || 1) - 1;
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
      createdAt: Date.now()
    };
    await set(ref(database, `app/channels/${id}`), chan);
  };

  const banUser = async (userId: string) => {
    await update(ref(database, `app/users/${userId}`), { status: 'banned' });
  };

  const toggleUserVerification = async (userId: string) => {
      const userRef = ref(database, `app/users/${userId}`);
      const userSnap = await get(userRef);
      if(userSnap.exists()) {
          const current = userSnap.val().isVerified || false;
          await update(userRef, { isVerified: !current });
      }
  };

  const deleteMessage = async (channelId: string, messageId: string) => {
    await update(ref(database, `app/messages/${channelId}/${messageId}`), { 
      deleted: true,
      text: "This message was deleted by the admin",
      imageBase64: null 
    });
  };

  const deletePost = async (postId: string) => {
    await update(ref(database, `app/posts/${postId}`), { active: false });
  };

  const toggleChannelStatus = async (channelId: string, status: 'open' | 'closed') => {
    await update(ref(database, `app/channels/${channelId}`), { status });
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
      registerUser,
      sendMessage,
      createPost,
      toggleLike,
      addComment,
      toggleCommentLike,
      addDistrict,
      banUser,
      toggleUserVerification,
      deleteMessage,
      deletePost,
      toggleChannelStatus,
      submitReport,
      markChannelAsRead,
      login,
      logout
    }}>
      {children}
    </DataContext.Provider>
  );
};
