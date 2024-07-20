import "./userinfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore"; // Firestore 문서 업데이트를 위한 import
import { db } from "../../../lib/firebase";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const [statusMessage, setStatusMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // 컴포넌트가 마운트될 때 상태 메시지 초기화
  useEffect(() => {
    if (currentUser) {
      setStatusMessage(currentUser.statusMessage || "");
    }
  }, [currentUser]);

  const handleUpdateStatus = async () => {
    if (!currentUser) return; // 사용자가 로그인하지 않은 경우
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        statusMessage: statusMessage,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating status message:", err);
    }
  };

  const handleDeleteStatus = async () => {
    if (!currentUser) return; // 사용자가 로그인하지 않은 경우
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        statusMessage: "", // 상태 메시지 삭제
      });
      setStatusMessage(""); // 로컬 상태에서도 삭제
      setIsEditing(false);
    } catch (err) {
      console.error("Error deleting status message:", err);
    }
  };

  return (
    <div className="userinfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
        <div className="icons">
          <img src="./more.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./edit.png" alt="" />
        </div>
      </div>
      <div className="status">
        {isEditing ? (
          <div className="status-edit">
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="Enter your status"
            />
            <div className="status-buttons">
              <button className="update-button" onClick={handleUpdateStatus}>
                Update
              </button>
              <button className="delete-button" onClick={handleDeleteStatus}>
                Delete
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancle
              </button>
            </div>
          </div>
        ) : (
          <div className="status-display">
            <p>{statusMessage || "No status message."}</p>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Userinfo;