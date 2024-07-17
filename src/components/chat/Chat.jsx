import { useEffect, useRef, useState } from "react"; // React의 useState 훅을 임포트하여 상태 관리를 합니다.
import "./chat.css"; // chat.css 파일을 임포트하여 스타일을 적용합니다.
import EmojiPicker from "emoji-picker-react"; // emoji-picker-react 라이브러리에서 EmojiPicker 컴포넌트를 임포트합니다.
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js"; //npm install timeago.js 메세지 시간 업데이트 하기

const Chat = () => {
  // Chat 컴포넌트를 선언합니다.
  const [open, setOpen] = useState(false); // open 상태와 setOpen 함수를 선언하여 이모지 선택기의 열림/닫힘 상태를 관리합니다.
  const [text, setText] = useState(""); // text 상태와 setText 함수를 선언하여 입력된 텍스트를 관리합니다.
  const [chat, setChat] = useState();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages, img]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);


  const handleEmoji = (e) => {
    // handleEmoji 함수는 이모지를 클릭했을 때 호출됩니다.
    setText((prev) => prev + e.emoji); // 현재 텍스트에 선택한 이모지를 추가합니다.
    setOpen(false); // 이모지 선택기를 닫습니다.
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        {/* top 클래스의 div를 포함하여 사용자 정보와 아이콘들을 표시합니다. */}
        <div className="user">
          {/* user 클래스의 div는 사용자 아바타 이미지와 텍스트를 포함합니다. */}
          <img src={user?.avatar || "./avatar.png"} alt="" />{" "}
          {/* 사용자 아바타 이미지 */}
          <div className="texts">
            {/* 사용자 이름과 상태 메시지를 포함하는 div */}
            <spna>{user?.username}</spna> {/* 사용자 이름 */}
            <p>Welcome</p> {/* 상태 메시지 */}
          </div>
        </div>
        <div className="icons">
          {/* icons 클래스의 div는 전화, 비디오, 정보 아이콘을 포함합니다. */}
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          //메세지 누가 올렸는지 채팅창에 보낸사람 Lt side. 받는사람 Rt side.
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span> {/*메세지 시간 업데이트 하기*/}
            </div>
          </div>
        ))}
        {/*채팅창에 이미지 올리기*/}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        {/* bottom 클래스의 div는 입력창과 관련 아이콘들, 이모지 선택기, 전송 버튼을 포함합니다. */}
        <div className="icons">
          <label htmlFor="file">
            {/* icons 클래스의 div는 이미지, 카메라, 마이크 아이콘을 포함합니다. */}
            <img src="./img.png" alt="" /> {/* 이미지 아이콘 */}
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" /> {/* 카메라 아이콘 */}
          <img src="./mic.png" alt="" /> {/* 마이크 아이콘 */}
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text} // 입력창의 값은 text 상태로 설정됩니다.
          onChange={(e) => setText(e.target.value)} // 입력값이 변경되면 text 상태를 업데이트합니다.
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          {/* emoji 클래스의 div는 이모지 선택기와 이모지 아이콘을 포함합니다. */}
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {/* 이모지 아이콘을 클릭하면 이모지 선택기가 열리거나 닫힙니다. */}
          <div className="picker">
            {/* picker 클래스의 div는 이모지 선택기 컴포넌트를 포함합니다. */}
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            {/* EmojiPicker 컴포넌트는 open 상태에 따라 열리거나 닫히며, 이모지를 클릭하면 handleEmoji 함수가 호출됩니다. */}
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
        {/* sendButton 클래스의 버튼 요소는 전송 버튼입니다. */}
      </div>
    </div>
  );
};

export default Chat;
