import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { User } from "../types/user";
import { setDoc,addDoc, collection, doc,getDoc } from "firebase/firestore";


export const login = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((res) => {
      alert(`${res.user.displayName} logged in.`);
      console.log(res.user);
    })
    .catch((err) => console.log(err));
};


onAuthStateChanged(auth, async (user) => {
  if (user) {
        if (user.metadata.creationTime === user.metadata.lastSignInTime) {
      const newUser = {
        avatarURL: user.photoURL || "",
        name: user.displayName || "Unknown",
        nickname: user.displayName || "Unknown",
        reactions: [],
        storage: [],
      };
      
      const userDocRef = doc(collection(db, "users"), user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, newUser);
        console.log("新しいユーザーデータがFirestoreに追加されました。UID:", user.uid);
      } else {
        console.log("既にユーザーデータが存在します。UID:", user.uid);
      }
    }
  }
});

export const logout = () => {
  signOut(auth).then(() => {
    alert("logout");
  });
};
