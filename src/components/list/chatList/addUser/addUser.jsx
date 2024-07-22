import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const [usernameInput, setUsernameInput] = useState(""); // 검색 입력값 상태 추가

  const handleSearch = async (e) => { // 사용자 검색을 처리
    e.preventDefault(); // 기본 폼 제출 동작을 막습니다.
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      // Query는 데이터베이스 관리 시스템(DBMS)에서 데이터를 검색, 삽입, 수정, 삭제하기 위해 사용하는 명령어
      // username이 입력한 값과 일치하는 문서를 찾는 쿼리를 작성합니다.
      const q = query(userRef, where("username", "==", username)); 
      
      // 쿼리를 실행하고 결과를 가져옵니다.
      const querySnapShot = await getDocs(q);// await를 사용하면 이 Promise가 해결될 때까지 기다렸다가 결과를 반환합니다. 즉, Firestore에서 데이터를 가져오는 작업이 완료될 때까지 코드 실행을 멈춥니다.

      if (!querySnapShot.empty) { // 쿼리 결과가 비어 있지 않으면
        setUser(querySnapShot.docs[0].data()); // 첫 번째 문서의 데이터를 user 상태로 설정합니다.
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  // 사용자를 추가하는 비동기 함수
  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef); // "chats" 컬렉션에 새 문서를 만듭니다.

      await setDoc(newChatRef, { // 새 문서에 데이터를 설정
        createdAt: serverTimestamp(), // 현재 서버 타임스탬프를 설정
        messages: [], // 빈 메시지 배열을 설정
      });

      //update another user chat
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({     // chats 배열에 새 채팅을 추가
          chatId: newChatRef.id, // 새 채팅의 ID를 설정
          lastMessage: "",       // 마지막 메시지를 빈 문자열로 설정
          receiverId: currentUser.id, // 수신자 ID를 현재 사용자 ID로 설정
          updatedAt: Date.now(), // 업데이트 시간을 현재 시간으로 설정
        }),
      });
      //update user chat
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
       // 사용자 추가 후 사용자 정보를 초기화
      setUser(null);
      setUsernameInput(""); // 입력값 초기화
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setUser(null); // 검색한 사용자 정보를 초기화
    setUsernameInput(""); // 입력값 초기화
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" 
        value={usernameInput} // 상태값으로 검색 입력값 관리
        onChange={(e) => setUsernameInput(e.target.value)} // 입력값 변경 시 상태 업데이트
        />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add</button>
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
