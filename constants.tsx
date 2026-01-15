
import { District, HomePost, VideoPost, Channel } from './types';

export const DISTRICTS: District[] = ['Deg. Hodan', 'Deg. Deyniile', 'Deg. Yaqshiid'];

export const MOCK_FEED: HomePost[] = [
  {
    id: 'f1',
    author: {
      id: 'u1',
      name: 'Ahmed Cali',
      avatar: 'A',
      district: 'Deg. Hodan',
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
