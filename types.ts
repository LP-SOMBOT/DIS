
export type District = string; // Changed to string to support dynamic districts

export type Role = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'banned';

export interface UserPermissions {
  mainGroup: boolean;
  users: boolean;
  posts: boolean;
  districts: boolean;
}

export interface User {
  id: string;
  name: string;
  whatsapp: string;
  bio: string;
  district: District;
  avatarBase64?: string;
  role: Role;
  status: UserStatus;
  permissions: UserPermissions;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date; // Mapped from createdAt
  createdAt: number;
  type: 'text' | 'image' | 'video' | 'work_done';
  mediaUrl?: string; // Mapped from imageBase64
  imageBase64?: string;
  channelId: string;
  deleted?: boolean;
}

export interface HomePost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string; // Base64 or Initial
    district: District;
  };
  type: 'awareness' | 'standard';
  title?: string;
  description: string;
  image?: string; // Base64
  beforeImg?: string; // Base64
  afterImg?: string; // Base64
  date: string;
  timestamp: number;
  likes: number;
  likedBy?: Record<string, boolean>; // Track who liked the post
  comments: number;
  visibility: 'public' | 'district';
  active: boolean;
}

export interface VideoPost {
  id: string;
  author: string;
  district: District;
  videoUrl: string;
  caption: string;
  likes: number;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  lastMessage?: string;
  unread?: number;
  type: 'main' | 'district';
  district?: string;
  status: 'open' | 'closed';
  createdAt: number;
}

export interface Report {
  id: string;
  type: 'post' | 'message';
  targetId: string;
  reason: string;
  reporterId: string;
  status: 'pending' | 'resolved';
  createdAt: number;
}
