import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";
import  { useState } from "react";

const Detail = () => {
  const {
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();


  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };


  // Setting 창 열고 닫기
  const [isMemoOpen, setIsSettingOpen] = useState(false);
  const toggleSetting = () => {
    setIsSettingOpen(!isMemoOpen);
  };

  // Photo 창 열고 닫기
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const togglePhotos = () => {
    setIsPhotosOpen(!isPhotosOpen);
  };

  // Files 창 열고 닫기
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const toggleFiles = () => {
    setIsFilesOpen(!isFilesOpen);
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p></p>
      </div>
      <div className="info">
        <div className="option">
          <div
            className="title"
            onClick={toggleSetting}
            style={{ cursor: "pointer" }}
          >
            <span>Memo</span>
            <img
              src={isMemoOpen ? "./arrowDown.png" : "./arrowUp.png"}
              alt=""
            />
          </div>
          
        </div>
        <div className="option">
          <div
            className="title"
            onClick={togglePhotos}
            style={{ cursor: "pointer" }}
          >
            <span>Shared Photos</span>
            <img
              src={isPhotosOpen ? "./arrowDown.png" : "./arrowUp.png"}
              alt=""
            />
          </div>
          {isPhotosOpen && (
            <div className="photos">
              {[...Array(4)].map((_, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    <img
                      src="https://images.pexels.com/photos/7381200/pexels-photo-7381200.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                      alt=""
                    />
                    <span>photo_2024_{index + 1}.png</span>
                  </div>
                  <img src="./download.png" alt="" className="icon" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="option">
          <div
            className="title"
            onClick={toggleFiles}
            style={{ cursor: "pointer" }}
          >
            <span>Shared Files</span>
            <img
              src={isFilesOpen ? "./arrowDown.png" : "./arrowUp.png"}
              alt=""
            />
          </div>
          {isFilesOpen && (
            <div className="files">
              {/* 파일 목록 추가 */}
            </div>
          )}
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
