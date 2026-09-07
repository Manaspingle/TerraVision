import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtUDidrBB9JEaJgoNSqNi_T8RU_59S9u4",
  authDomain: "terravision-ac9f1.firebaseapp.com",
  projectId: "terravision-ac9f1",
  storageBucket: "terravision-ac9f1.firebasestorage.app",
  messagingSenderId: "923733292680",
  appId: "1:923733292680:web:e8e558486e526564cb913d",
  measurementId: "G-X2X46EHWHG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
};
