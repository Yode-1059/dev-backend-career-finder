import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { User } from "../types/user";
import { addDoc, collection,doc } from "firebase/firestore";


export const login = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((res) => {
      alert(`${res.user.displayName} logged in.`);
      console.log(res.user);
    })
    .catch((err) => console.log(err));
};


onAuthStateChanged(auth, (user) => {
  console.log("new",user)
  if (user) {
    if (user.metadata.creationTime === user.metadata.lastSignInTime) {

      const ref = doc(collection(db, "users"));
      const newUser = {
        id:ref.id,
        avatarURL: user.photoURL || "",
        name: user.displayName || "Unknown",
        nickname:user.displayName || "Unknown",
        reactions:[],
        storage:[]
      };
      addDoc(collection(db, "users"), newUser)
        .then(() => {
          console.log("新しいユーザーデータがFirestoreに追加されました。");
        })
        .catch((error) => {
          console.error("Firestoreへの新しいユーザーデータの追加中にエラーが発生しました:", error);
        });
    }
  }
});
export const logout = () => {
  signOut(auth).then(() => {
    alert("logout");
  });
};
