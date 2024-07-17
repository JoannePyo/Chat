import { initializeApp } from "firebase/app"; // Firebase 앱 초기화를 위한 함수
import { getAuth } from "firebase/auth"; // Firebase 인증 기능을 가져오기 위한 함수
import { getFirestore } from "firebase/firestore"; // Firestore 데이터베이스를 가져오기 위한 함수
import { getStorage } from "firebase/storage"; // Firebase 스토리지를 가져오기 위한 함수

// Firebase 앱 구성을 위한 설정 객체입니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-83a71.firebaseapp.com",
  projectId: "react-chat-83a71",
  storageBucket: "react-chat-83a71.appspot.com",
  messagingSenderId: "464952744345",
  appId: "1:464952744345:web:689182819bb93249d61b08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Firebase 앱을 초기화하고 'app' 변수에 할당

// Firebase 인증 서비스를 초기화하고 export합니다.
export const auth = getAuth() // 인증 서비스를 초기화하고 'auth'로 내보냄

// Firestore 데이터베이스를 초기화하고 export합니다.
export const db = getFirestore() // Firestore를 초기화하고 'db'로 내보냄

// Firebase 스토리지를 초기화하고 export합니다.
export const storage = getStorage() // 스토리지를 초기화하고 'storage'로 내보냄