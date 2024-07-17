import "./userinfo.css";
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {
    //로그인하면 list에 userInfo 맨 위에 사진과 username이 뜨다.
    const { currentUser } = useUserStore();

    return (
        <div className="userinfo"> 
        <div className="user"> 
            <img src={currentUser.avatar || "./avatar.png"}  alt="" />
            <h2>{currentUser.username}</h2>
        </div>
        <div className="icons">
            <img src="./more.png" alt="" />
            <img src="./video.png" alt="" />
            <img src="./edit.png" alt="" />
        </div>
        
        </div>
    )
}

export default Userinfo