
import React from 'react';
import { District, HomePost, VideoPost, Channel } from './types';

export const DISTRICTS: District[] = ['Deg. Hodan', 'Deg. Deyniile', 'Deg. Yaqshiid'];

// Verification Badge Component
export const VerificationBadge = () => (
  <svg className="w-4 h-4 inline-block ml-1 align-middle text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 12.0001C22.5 13.5682 21.6591 14.9432 20.4318 15.6592C20.6591 17.5001 19.5227 19.341 17.75 20.0001C16.9091 21.4546 15.0227 21.9092 13.5227 21.2273C12.3182 22.3864 10.4318 22.2501 9.38636 21.0001C7.84091 21.4319 6.22727 20.6137 5.54545 19.1364C4.09091 18.9092 3.02273 17.6137 3.09091 16.0001C1.65909 15.2046 1.09091 13.5001 1.77273 12.0001C1.09091 10.5001 1.65909 8.79555 3.09091 8.00009C3.02273 6.38646 4.09091 5.09096 5.54545 4.86369C6.22727 3.38642 7.84091 2.56828 9.38636 3.00009C10.4318 1.75009 12.3182 1.61373 13.5227 2.77282C15.0227 2.09096 16.9091 2.54555 17.75 4.00009C19.5227 4.65918 20.6591 6.50009 20.4318 8.341C21.6591 9.05691 22.5 10.4319 22.5 12.0001Z" fill="#3B82F6"/>
    <path d="M10.3636 15.6817L7.09091 12.409L8.36364 11.1362L10.3636 13.1362L15.6364 7.86353L16.9091 9.13625L10.3636 15.6817Z" fill="white"/>
  </svg>
);

export const MOCK_FEED: HomePost[] = [
  {
    id: 'f1',
    author: {
      id: 'u1',
      name: 'Ahmed Cali',
      avatar: 'A',
      district: 'Deg. Hodan',
      isVerified: true
    },
    type: 'awareness',
    title: 'Hadiyadii Nadaafadda',
    description: 'Nadiifinta Waddada Maka Al Mukarama. Isbeddelka waa dhab! Maanta waxaan ku guuleysanay inaan ka saarno qashinkii halkan yaalay muddo bil ah.',
    beforeImg: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800',
    date: '2 hours ago',
    likes: 245,
    comments: 18,
    timestamp: Date.now(),
    visibility: 'public',
    active: true
  },
  {
    id: 'f2',
    author: {
      id: 'u2',
      name: 'Faduma Jaamac',
      avatar: 'F',
      district: 'Deg. Yaqshiid',
      isVerified: false
    },
    type: 'standard',
    description: 'Dhirtii aan beeranay bishii hore hadda wey soo baxayaan. Degmada Yaqshiid waa naga nadaafad iyo doog!',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    date: '5 hours ago',
    likes: 120,
    comments: 5,
    timestamp: Date.now(),
    visibility: 'district',
    active: true
  },
  {
    id: 'f3',
    author: {
      id: 'u3',
      name: 'Sahal Maxamed',
      avatar: 'S',
      district: 'Deg. Deyniile',
      isVerified: true
    },
    type: 'awareness',
    title: 'Dib u dhiska Isgoyska',
    description: 'Deyniile isku tashi! Isgoyska oo hadda u muuqda mid casri ah kadib markii dadka deegaanka iska kaashadeen.',
    beforeImg: 'https://images.unsplash.com/photo-1516528387618-afa90b13e000?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
    date: 'Yesterday',
    likes: 890,
    comments: 42,
    timestamp: Date.now(),
    visibility: 'public',
    active: true
  }
];

export const MOCK_VIDEOS: VideoPost[] = [
  {
    id: 'v1',
    author: 'Ahmed Cali',
    district: 'Deg. Hodan',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-people-planting-trees-in-a-park-34354-large.mp4',
    caption: 'Maanta Hodan waa naga nadaafad! #Somalia #Hodan',
    likes: 1240
  },
  {
    id: 'v2',
    author: 'Faduma Jaamac',
    district: 'Deg. Yaqshiid',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-team-cleaning-up-a-park-together-34352-large.mp4',
    caption: 'Yaqshiid isku tashi iyo horumar. Wadajir ayaan wax ku nahay.',
    likes: 850
  }
];

export const CHANNELS: Channel[] = [
  { id: 'main', name: '🌍 Magaalada Guud', icon: 'M', lastMessage: 'Dhawaan olole cusub...', unread: 2, type: 'main', status: 'open', createdAt: Date.now() },
  { id: 'hodan', name: '📍 Deg. Hodan', icon: 'H', lastMessage: 'Aad baad u mahadsantihiin.', unread: 0, type: 'district', district: 'Deg. Hodan', status: 'open', createdAt: Date.now() },
  { id: 'deyniile', name: '📍 Deg. Deyniile', icon: 'D', lastMessage: 'Yaa diyaar ah?', unread: 5, type: 'district', district: 'Deg. Deyniile', status: 'open', createdAt: Date.now() },
  { id: 'yaqshiid', name: '📍 Deg. Yaqshiid', icon: 'Y', lastMessage: 'Waan idin salaamay.', unread: 0, type: 'district', district: 'Deg. Yaqshiid', status: 'open', createdAt: Date.now() },
  { id: 'clean', name: '🧹 Nadaafadda', icon: 'N', lastMessage: 'Axadda soo socota...', unread: 12, type: 'main', status: 'open', createdAt: Date.now() },
  { id: 'emergency', name: '🆘 Gurmadka', icon: 'G', lastMessage: 'Sidee loo caawin karaa?', unread: 0, type: 'main', status: 'open', createdAt: Date.now() },
];
