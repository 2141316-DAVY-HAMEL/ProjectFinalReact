//firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFCYgjo9CQ46yuhfQEO7My0RKeYQRVHJw",
  authDomain: "projectfinal-84ea7.firebaseapp.com",
  projectId: "projectfinal-84ea7",
  storageBucket: "projectfinal-84ea7.appspot.com",
  messagingSenderId: "700407302714",
  appId: "1:700407302714:web:f6ecec829b2cca7aac0303"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const logInWithEmailAndPassword = async (
email: string,
password: string
) => {
try {
    await signInWithEmailAndPassword(auth, email, password);
} catch (err: any) {
    console.error(err);
    alert(err.message);
}
};

export const getToken = async () => {
    if (!auth.currentUser) return '';
    
    return await auth.currentUser
        .getIdToken(false)
        .then(function (idToken) {
        return idToken;
        })
        .catch(function (error) {
        console.log(error);
        return null;
        });
    };
    