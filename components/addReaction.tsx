import React, { useEffect, useState } from 'react'
import { getDocs, collection,getDoc ,doc,arrayUnion, updateDoc, arrayRemove} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { Reaction } from '../types/reaction'
import { useAuth } from '../context/auth'
import { useToggleReaction } from '../lib/useToggleReaction'

const ReactionList = ({ post}: { post: string }) => {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const { SetReaction, ToggleReaction } = useToggleReaction();
  const { user } = useAuth();
  useEffect(() => {
    const getReaction = async () => {
      const querySnapshot = await getDocs(collection(db, "reactionList"));
      console.log(querySnapshot.docs)
      const data = querySnapshot.docs.map(doc => ({
        reaction: doc.data().id,
        url: doc.data().url,
        value:doc.data().value,
        ...doc.data(),
      }));
      setReactions(data);
    };
    getReaction();
  }, []);

  const addReaction = async (post: string, reaction: string, url:string) => {
    if (user) {
      const docRef = doc(db, "posts_d", post)
      const userRef = doc(db, "users", user.id)
      const userData: Array<{ post: string, reaction: string ,url:string}> = (await getDoc(userRef)).data().reactions
      const existingReaction = userData?.find(obj => obj.post === post);
      console.log(reaction)
      if (existingReaction) {
          console.log("toggle")
          ToggleReaction(user.id, reaction,url,existingReaction.url, docRef,existingReaction.reaction,post);
      } else {
        SetReaction(user.id, user.name, reaction, url,docRef,post);
        }
      }
  }

  return (
    <div style={{width:"200px",display:"flex","justifyContent":"space-between",backgroundColor:"whitesmoke",border:"1px solid black",padding:"10px"}}>
    {reactions.map((reaction: Reaction, index: number) => (
      <div key={index} style={{width:"55px"}}>
      <button onClick={()=>addReaction(post, reaction.reaction,reaction.url)}>
          <img src={reaction.url} alt="" style={{ width: "55px", height: "55px" }} />
          <p>{reaction.reaction}</p>
      </button>
      </div>
      ))}
      </div>
      )
    }

    export default ReactionList
