
export type District = string;

export type Role = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'banned';

export interface UserPermissions {
  managePosts: boolean;
  manageDistricts: boolean;
  manageUsers: boolean;
  verifyUsers: boolean;
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
  isVerified?: boolean; 
  permissions: UserPermissions;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  createdAt: number;
  type: 'text' | 'image' | 'video' | 'work_done';
  mediaUrl?: string;
  imageBase64?: string;
  channelId: string;
  deleted?: boolean;
}

export interface HomePost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    district: District;
    isVerified?: boolean; 
  };
  type: 'awareness' | 'standard';
  title?: string;
  description: string;
  image?: string;
  beforeImg?: string;
  afterImg?: string;
  date: string;
  timestamp: number;
  likes: number;
  likedBy?: Record<string, boolean>;
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
  avatar?: string; // Added for custom group image
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
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerified?: boolean;
  text: string;
  timestamp: number;
  likes?: number;
  likedBy?: Record<string, boolean>;
}
