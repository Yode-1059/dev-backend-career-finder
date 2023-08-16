import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase/firebase'
import { Reaction } from '../types/reaction'

const CurrentReactionList = ({ post }: { post: string }) => {
  const [currentReaction, setCurrentReaction] = useState<Reaction[]>([])

  useEffect(() => {
    const getReaction = async () => {
      const docRef = doc(db, "posts_d", post)
      const ReactionData: Array<Reaction> = (await getDoc(docRef)).data().reactions
      if (ReactionData) {
        const valueData: Array<{ reaction: string, value:number ,url:string }>  = []
        ReactionData.map(doc => (
          valueData.push({reaction:doc.reaction,url:doc.url, value:doc.value})
        ))
        setCurrentReaction(valueData);
      }
    };
    getReaction();
  },[])
  return (

    <div style={{width:"200px",display:"flex","justifyContent":"space-between",backgroundColor:"whitesmoke",border:"1px solid black",padding:"10px",marginBottom:"10px"}}>
      {currentReaction.map((reaction: Reaction, index: number) => (
        <div key={index} style={{width:"55px"}}>
          <p>{reaction.value}人</p>
          <p>{ reaction.reaction }</p>
          <img src={reaction.url } alt="" style={{width:"55px",height:"55px"}}/>
        </div>
      ))}
    </div>
  )
}

export default CurrentReactionList
