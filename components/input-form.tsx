import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth";
import { Post } from "../types/post";
import { db } from "../firebase/firebase";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { adminDB } from "../firebase/db";
import { GetStaticProps,InferGetStaticPropsType } from "next";
import { Interview } from "../types/interview";

export const getStaticProps: GetStaticProps<{ post: Post }> = async (
  context,
) => {
  const snap = await db.doc(`posts_d/${context.params?.id}`).get();
  let post = snap.data() as Post;
  console.log("111",post)
    if (post?.createdAt) {
    post = {
      ...post,
      createdAt: post.createdAt.toDate().toISOString(),
    };
  }
  return { props: { post } };
};
export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

const InputForm = ({post}: InferGetStaticPropsType<typeof getStaticProps>)  => {
  const router = useRouter();
  const isEditMode=!!post
  console.log(isEditMode,post)
  const editId=router.query.id
  const [add, setAdd] = useState<Array<number>>([]);
  const { isLoading, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Post>();

  const addForm = () => {
    console.log("add", add);
    setAdd([...add, add.length]);
  };
  const delForm = () => {
    console.log(add.pop())
    // setAdd(add.pop())
  }

  const AddForms = ( interview:Interview ) => {
    return add.map((index: number) => (
      <>
        <div key={index}>
          <div>
            <label htmlFor="">選考名</label>
            <select {...register(`format${index}`)} id="format" value={interview.interviewFormat}>
              <option value="一次選考">一次選考</option>
              <option value="二次選考">二次選考</option>
              <option value="最終選考">最終選考</option>
            </select>
          </div>
          <div>
            <label htmlFor="">面接形式</label>
            <select {...register(`method${index}`)} id="method" value={interview.interviewMethod}>
              <option value="Web面接">Web面接</option>
              <option value="対面">対面</option>
            </select>
          </div>
          <div>
            <label htmlFor="">面接方式</label>
            <select {...register(`system${index}`)} id="system" value={interview.selectionResult}>
              <option value="個人">個人</option>
              <option value="団体">団体</option>
            </select>
          </div>
          <div>
            <label htmlFor="">人数</label>
            <input type="number" {...register(`headcount${index}`)} id="head" value={interview.headcount}/>
          </div>
          <div>
            <label htmlFor="">質問された内容など</label>
            <textarea
              autoComplete="off"
              {...register(`description${index}`)}
              id="body" value={interview.description}
            ></textarea>
          </div>
        </div>
      </>
    ))
  };
  console.log("isedit:",isEditMode)
  if (!user) {
    if (!isLoading) {
      router.push("/");
    }
    return null;
  } else {
      if (isEditMode) {
        console.log(post,user)
    if (post.authorId != user?.uid) {
      console.log("t1")
      router.push("/");
    } else {
      post.body.interview.forEach(element => {
        AddForms(element)
      });
    }
  }
  }

  const submit = (data: Post) => {
    // 新しいドキュメントの参照を取得
    const ref = doc(collection(db, "posts_d"));

    // 新しい投稿のデータを作成
    const sendPost: Post = {
      id: ref.id,
      authorId: user.uid,
      body: {
        companyName: data.companyName,
        occupation: [],
        interview: [
          {
            index: 0,
            interviewFormat: data.format,
            interviewMethod: data.method,
            selectionResult: data.system,
            headcount: data.headcount,
            description: data.description,
          },
        ],
        result: data.result,
        impression: data.impression,
      },
      reactions: [],
      createdAt: new Date(), // 新しい投稿の場合は常に現在の日時を使用
      updateAt: null, // 新しい投稿の場合は更新日時は null
    };

    // 追加されたフォームのデータを sendPost に追加
    add.forEach((i: any) => {
      sendPost.body.interview.push({
        index: i,
        interviewFormat: data[`format${i}`],
        interviewMethod: data[`method${i}`],
        selectionResult: data[`system${i}`],
        headcount: data[`headcount${i}`],
        description: data[`description${i}`],
      });
    });

    // 更新日時を設定
    sendPost.updateAt = new Date();

    console.log(sendPost);

    // isEditMode に応じて新しいドキュメントを作成または既存のドキュメントを更新
    if (isEditMode) {
      // 既存のドキュメントを更新
      updateDoc(doc(db, `posts_d/${post.id}`), sendPost)
        .then(() => {
          alert(`記事を更新しました`);
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      // 新しいドキュメントを作成
      setDoc(ref, sendPost)
        .then(() => {
          alert(`記事を作成しました`);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }
};


  return (
    <div onSubmit={handleSubmit(submit)}>
      <form>
        <div>
          <div className="">
            <label htmlFor="">会社名</label>
            <input
              autoComplete="off"
              {...register("companyName")}
              id="companyName"
              type="text"
            />
          </div>
          <div>
            <label htmlFor="">選考名</label>
            <select {...register("format")} id="format">
              <option value="一次選考">一次選考</option>
              <option value="二次選考">二次選考</option>
              <option value="最終選考">最終選考</option>
            </select>
          </div>
          <div>
            <label htmlFor="">面接形式</label>
            <select {...register("method")} id="method">
              <option value="Web面接">Web面接</option>
              <option value="対面">対面</option>
            </select>
          </div>
          <div>
            <label htmlFor="">面接方式</label>
            <select {...register("system")} id="system">
              <option value="個人">個人</option>
              <option value="団体">団体</option>
            </select>
          </div>
          <div>
            <label htmlFor="">人数</label>
            <input type="number" {...register("headcount")} id="head" />
          </div>
          <div>
            <label htmlFor="">質問された内容など</label>
            <textarea
              autoComplete="off"
              {...register("description")}
              id="body"
            ></textarea>
          </div>
        </div>
        {AddForms}
        <p onClick={addForm}>+</p>
        <p onClick={delForm}>-</p>
        <div>
          <label htmlFor="">現在の状態</label>
          <select {...register("result")} id="result">
            <option value="合格">合格</option>
            <option value="不合格">不合格</option>
            <option value="選考途中">選考途中</option>
          </select>
        </div>
        <div>
          <label htmlFor="">選考を通じた感想</label>
          <input {...register("impression")} id="impression" />
        </div>
        <button>投稿</button>
      </form>
    </div>
  );
};

export default InputForm;
