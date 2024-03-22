import React from "react";
import LoginPage from "../components/login-page";
import { useAuth } from "../context/auth";
const index = () => {
  const { user } = useAuth();
  console.log(user)
  return (
    <>
      <div>
        {user ? (
          <>
            <p>login</p>
          </>
        ) : (
          <>
              <p>logout</p>
          </>
        )}
        <LoginPage />
        <p>{user?.name}</p>
        <a href="./article-list">記事一覧</a>
        <a href="./item-edit">新規投稿</a>
      </div>
    </>
  );
};

export default index;
