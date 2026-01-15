
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = { 
  apiKey: "AIzaSyBrUiZ7G7hc7FZcJtk_LEZ9OREMhLvHowY", 
  authDomain: "whatsapp-groups-1df5e.firebaseapp.com", 
  databaseURL: "https://whatsapp-groups-1df5e-default-rtdb.firebaseio.com", 
  projectId: "whatsapp-groups-1df5e", 
  storageBucket: "whatsapp-groups-1df5e.firebasestorage.app", 
  messagingSenderId: "1084270638482", 
  appId: "1:1084270638482:web:a1999cfa4229e5a3177d4b" 
}; 

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
