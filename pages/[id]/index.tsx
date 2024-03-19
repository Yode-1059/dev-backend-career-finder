
import { format } from 'date-fns';
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Button from '../../components/button';
import { useUserContext } from '../../features/context/auth';
import { db } from '../../features/firebase/client';
import { adminDB } from '../../features/firebase/server';
import { useAuthor } from '../../features/hooks/useAuthor';
import { useAuth } from '../../context/auth';
import { Post } from '../../types/post';
import { useToggleLike } from '../../features/hooks/useToggleLikes';
import { useToggleSavePost } from '../../features/hooks/useToggleSavePost';
import { Interview } from '../../types/interview';
//  GetStaticProps<{ post: Post }>はreturnで入力したpropsを型で明示している
// そしてジェネリクスの中身はDetailPageに渡るpropsの方と一致する
// その場合InferGetStaticPropsType
export const getStaticProps: GetStaticProps<{ post: Post }> = async (context) => {
  const snap = await adminDB.doc(`posts_d/${context.params?.id}`).get();
  let post = snap.data() as Post;
    if (post?.createdAt) {
    post = {
      ...post,
      createdAt: post.createdAt.toDate().toISOString(),
    };
    }
      if (post?.updateAt) {
    post = {
      ...post,
      updateAt:post.updateAt.toDate().toISOString(),// JSONにシリアライズ可能な形式に変換
    };
  }

  return { props: { post } };
};
export const getStaticPaths = () => {
  return {
    paths: [],
    // 本番はtrueかな
    fallback: 'blocking',
  };
};
// サーバーの中で記事詳細ページを生成する
const DetailPage = ({post,}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { user } = useAuth();
  const [realTimePost, setRealTimePost] = useState<Post>();
  const { unLike, Like } = useToggleLike();
  const { savePost, removeSavedPost } = useToggleSavePost();
  const router=useRouter();
  useEffect(() => {
    const ref = doc(db, `posts_d/${post.id}`);
    onSnapshot(ref, (snap) => {
      setRealTimePost(snap.data() as any);
    });
  });

  if (!post) return <p>記事が存在しません</p>;

  const handleClickToggleLikePost = () => {
    if (!user) {
      return alert('ログインしてください');
    }
    const ref = doc(db, `posts_d/${post?.id}`);
    console.log(realTimePost)
    if (realTimePost?.likes.includes(user.id)) {
      unLike(ref, user.id);
    } else if (!realTimePost?.likes.includes(user.id)) {
      Like(ref, user.id);
    }
  };
  const handleClickToggleSavePost = () => {
    if (!user) {
      return alert('ログインしてください');
    }
    if (!realTimePost) {
      return <>記事がありません</>;
    }

    const ref = doc(db, `users/${user?.id}`);
    console.log(realTimePost)
    if (user?.storage?.includes(realTimePost?.id)) {
      removeSavedPost(ref, realTimePost?.id);
    } else if (!user?.storage?.includes(realTimePost?.id)) {
      savePost(ref, realTimePost?.id);
    }
  };
  const handleDeletePost = async () => {
    if (!user) {
      return alert('ログインしてください');
    }
    
    // ログインユーザーが記事の投稿者であるかを確認
    if (post.authorId !== user.uid) {
      return alert('記事の投稿者でないため、削除できません');
    }
  
    // 確認ダイアログを表示
    const confirmed = window.confirm('この記事を削除しますか？');
    if (!confirmed) {
      return; // ユーザーがキャンセルした場合、削除処理を中止
    }
  
    // 削除処理
    const ref = doc(db, `posts_d/${post.id}`);
    try {
      await deleteDoc(ref);
      alert('記事を削除しました');
      router.push('/'); // 記事を削除した後、ホームページにリダイレクト
    } catch (error) {
      console.error('記事の削除中にエラーが発生しました', error);
      alert('記事の削除中にエラーが発生しました');
    }
  };

  return (
    <div className="w-96">
      <h1 className="text-lg p-6 bg-slate-400 text-white">
        {post.body.companyName}
      </h1>
      <div className="bg-sky-300 mt-5 text-white p-3 border rounded-lg">
        {post.body.result}
      </div>
      <p>職種：{ post.body.occupation}</p>
      {/* <p>{format(post.createdAt, 'yyyy年MM月dd日')}</p> */}
      {post.body.interview.map((interview:Interview) => (
        <>
          <p>-------------------</p>
          <h3>{interview.interviewFormat}</h3>
          <p>面接形式：{interview.interviewMethod }</p>
          <p>{interview.selectionResult}面接</p>
          <p>面接官の人数：{interview.headcount }</p>
          {interview.selectionResult === "集団" && (
            <p>人数： {interview.headcount }人</p>
          )}
          <p>解説：{interview.description }</p>
        </>
      ))}
      <p>投稿者：{post.authorId}</p>
      <p>ユーザー:{user?.uid }</p>

      {post.authorId === user?.uid && (
        <>
        <Button>
          <Link href={`${post.id}/edit`}>
            編集
          </Link>
        </Button>
         <Button onClick={handleDeletePost}>削除</Button>
        </>
      )}

      <button
        onClick={handleClickToggleLikePost}
        className="w-5 h-5 text-slate-500"
      >❤︎</button>
      <button onClick={handleClickToggleSavePost}>
        保存
      </button>
    </div>
  );
};

export default DetailPage;
