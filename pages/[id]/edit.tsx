import React from 'react';
import InputForm from '../../components/input-form';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { adminDB } from '../../firebase/db';
import { Post } from '../../types/post';

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
      updateAt: post.updateAt.toDate().toISOString(),
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
const Edit = ({ post }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <>
    <p>{post?.authorId}</p>
    <InputForm post={post}/>
  </>;
};

export default Edit;
