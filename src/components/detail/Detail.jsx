import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db, storage } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage 관련 모듈 추가

const Detail = () => {
  const {
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
    chatId, // 현재 채팅 ID 가져오기
  } = useChatStore();
  const { currentUser } = useUserStore();

  const [memos, setMemos] = useState([]); // 메모 상태 추가
  const [newMemo, setNewMemo] = useState(""); // 새 메모 상태 추가
  const [photos, setPhotos] = useState([]); // 업로드한 사진을 저장할 상태
  const [files, setFiles] = useState([]); // 업로드한 파일을 저장할 상태

  // 채팅의 사진을 가져오는 useEffect
  useEffect(() => {
    const fetchMemoPhotosAndFiles = async () => {
      if (!chatId) return;

      const chatDocRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatDocRef);
      if (chatDoc.exists()) {
        setMemos(chatDoc.data().memos || []); // 메모 가져오기
        setPhotos(chatDoc.data().photos || []); // Firestore에서 사진 배열 가져오기
        setFiles(chatDoc.data().files || []); // Firestore에서 파일 배열 가져오기
      }
    };

    fetchMemoPhotosAndFiles();
  }, [chatId]);

  // 메모 저장 처리
  const handleMemoSave = async () => {
    if (!newMemo) return;

    const updatedMemos = [...memos, newMemo];
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      memos: arrayUnion(newMemo), // Firestore에 메모 추가
    });

    setMemos(updatedMemos); // 상태 업데이트
    setNewMemo(""); // 입력란 초기화
  };

  // 메모 삭제 처리
  const handleMemoDelete = async (memo) => {
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      memos: arrayRemove(memo), // Firestore에서 메모 삭제
    });
    setMemos((prev) => prev.filter((m) => m !== memo)); // 상태에서 메모 삭제
  };

  // 사진 업로드 처리
  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = [];

    for (const file of files) {
      const storageRef = ref(storage, `chat_photos/${chatId}/${file.name}`);
      await uploadBytes(storageRef, file); // Firebase Storage에 파일 업로드
      const downloadURL = await getDownloadURL(storageRef); // 업로드한 후 다운로드 URL 가져오기
      newPhotos.push(downloadURL); // 새 사진 URL 추가
    }

    // Firestore에 사진 URL 저장
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      photos: arrayUnion(...newPhotos), // 새로운 사진 URL을 Firestore에 추가
    });

    setPhotos((prev) => [...prev, ...newPhotos]); // 상태 업데이트
  };

  // 파일 업로드 처리
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [];

    for (const file of files) {
      const storageRef = ref(storage, `chat_files/${chatId}/${file.name}`);
      await uploadBytes(storageRef, file); // Firebase Storage에 파일 업로드
      const downloadURL = await getDownloadURL(storageRef); // 업로드한 후 다운로드 URL 가져오기
      newFiles.push(downloadURL); // 새 파일 URL 추가
    }

    // Firestore에 파일 URL 저장
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      files: arrayUnion(...newFiles), // 새로운 파일 URL을 Firestore에 추가
    });

    setFiles((prev) => [...prev, ...newFiles]); // 상태 업데이트
  };

  // 사진 삭제 처리
  const handlePhotoDelete = async (photoURL) => {
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      photos: arrayRemove(photoURL), // Firestore에서 사진 URL 삭제
    });
    setPhotos((prev) => prev.filter((photo) => photo !== photoURL)); // 상태에서 사진 삭제
  };

  // 파일 삭제 처리
  const handleFileDelete = async (fileURL) => {
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      files: arrayRemove(fileURL), // Firestore에서 파일 URL 삭제
    });
    setFiles((prev) => prev.filter((file) => file !== fileURL)); // 상태에서 파일 삭제
  };

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
          {isMemoOpen && (
            <div className="settings-content">
              <div className="memoInputContainer">
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="Write a memo..."
                />
                <button onClick={handleMemoSave}>Save</button>
              </div>
              {memos.map((memo, index) => (
                <div className="memoItem" key={index}>
                  <span className="memoNumber">{index + 1}.</span>
                  <span>{memo}</span>
                  <button
                    onClick={() => handleMemoDelete(memo)}
                    className="deleteButton"
                  >
                    <img src="./minus.png" alt="Delete" className="icon" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
              {photos.map((photo, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    <img src={photo} alt={`photo_${index}`} />
                    <span>photo_{index + 1}.png</span>
                  </div>
                  <a href={photo} download={`photo_${index + 1}.png`}>
                    <img src="./download.png" alt="Download" className="icon" />
                  </a>
                  <button
                    onClick={() => handlePhotoDelete(photo)}
                    className="deleteButton"
                  >
                    <img src="./minus.png" alt="Delete" className="icon" />
                  </button>
                </div>
              ))}
              {/* 사진 업로드 입력 */}
              <input type="file" multiple onChange={handlePhotoUpload} />
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
              {files.map((file, index) => (
                <div className="fileItem" key={index}>
                  <div className="fileDetail">
                    <span>file_{index + 1}.png</span>
                  </div>
                  <a href={file} download={`file_${index + 1}.png`}>
                    <img src="./download.png" alt="Download" className="icon" />
                  </a>
                  <button
                    onClick={() => handleFileDelete(file)}
                    className="deleteButton"
                  >
                    <img src="./minus.png" alt="Delete" className="icon" />
                  </button>
                </div>
              ))}
              {/* 파일 업로드 입력 */}
              <input type="file" multiple onChange={handleFileUpload} />
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
