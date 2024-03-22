import { useState } from "react";

import { Post } from "../types/post";
import ReactionList from "./addReaction";
import CurrentReactionList from "./current-reaction-list";

const PostItemCard = ({ post }: { post: Post }) => {
    const [reactionTab, setReactionTab] = useState<boolean>(false);

    const reactionOpen = () => {
      setReactionTab(!reactionTab)
      console.log("aa!")
    }
  return (
    <>
      <div className=" rounded-md shadow p-4">
        <h2 className=" line-clamp-2">
                {post.body.companyName}
        </h2>
        <p>{post.body.result}</p>
        <p>{post.id}</p>
        <CurrentReactionList post={post.id}/>
        <button onClick={reactionOpen} style={{marginBottom:"10px"}}>+</button>
        {reactionTab && <ReactionList  post={post.id} />}
      </div>
    </>
  );
};

export default PostItemCard;