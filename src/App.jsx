import "./App.css";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export default function App() {
  const [members, setMembers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [clanWars, setClanWars] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  const [newNickname, setNewNickname] = useState("");
  const [newRace, setNewRace] = useState("Terran");
  const [newTier, setNewTier] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [postAuthor, setPostAuthor] = useState("");
  const [postContent, setPostContent] = useState("");

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const [enemyClan, setEnemyClan] = useState("");
  const [ourScore, setOurScore] = useState("");
  const [enemyScore, setEnemyScore] = useState("");

  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("ko-KR");

  // ================= FIRESTORE LOAD =================
  const loadMembers = async () => {
    const snap = await getDocs(collection(db, "members"));
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadMatches = async () => {
    const snap = await getDocs(collection(db, "matches"));
    setMatches(
      snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b)=> new Date(b.date)-new Date(a.date))
    );
  };

  const loadPosts = async () => {
    const snap = await getDocs(collection(db, "posts"));
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
  };

  const loadSchedules = async () => {
    const snap = await getDocs(collection(db, "schedules"));
    setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadClanWars = async () => {
    const snap = await getDocs(collection(db, "clanwars"));
    setClanWars(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
  };

  useEffect(() => {
    loadMembers();
    loadMatches();
    loadPosts();
    loadSchedules();
    loadClanWars();
  }, []);

  // ================= ADMIN =================
  const login = () => {
    if (password === "admin123") {
      setIsAdmin(true);
      setPassword("");
    } else alert("비밀번호 오류");
  };

  const logout = () => setIsAdmin(false);

  // ================= MEMBERS =================
  const addMember = async () => {
    if (!newNickname || !newTier) return alert("입력 필요");

    await addDoc(collection(db, "members"), {
      nickname: newNickname,
      race: newRace,
      tier: newTier,
      wins: 0,
      losses: 0,
      elo: 1000,
    });

    setNewNickname("");
    setNewTier("");
    loadMembers();
  };

  const deleteMember = async (id) => {
    if (!window.confirm("삭제?")) return;
    await deleteDoc(doc(db, "members", id));
    loadMembers();
  };

  // ================= POSTS =================
  const addPost = async () => {
    if (!postTitle) return alert("제목 필요");

    await addDoc(collection(db, "posts"), {
      title: postTitle,
      author: postAuthor,
      content: postContent,
      createdAt: new Date().toLocaleString(),
    });

    setPostTitle("");
    setPostAuthor("");
    setPostContent("");
    loadPosts();
  };

  const deletePost = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    loadPosts();
  };

  // ================= SCHEDULE =================
  const addSchedule = async () => {
    if (!scheduleTitle || !scheduleDate) return;

    await addDoc(collection(db, "schedules"), {
      title: scheduleTitle,
      date: scheduleDate,
    });

    setScheduleTitle("");
    setScheduleDate("");
    loadSchedules();
  };

  const deleteSchedule = async (id) => {
    await deleteDoc(doc(db, "schedules", id));
    loadSchedules();
  };

  // ================= CLANWAR =================
  const addClanWar = async () => {
    await addDoc(collection(db, "clanwars"), {
      enemyClan,
      ourScore: Number(ourScore),
      enemyScore: Number(enemyScore),
      result: Number(ourScore) > Number(enemyScore) ? "승리" : "패배",
      date: new Date().toLocaleDateString(),
    });

    setEnemyClan("");
    setOurScore("");
    setEnemyScore("");
    loadClanWars();
  };

  const deleteClanWar = async (id) => {
    await deleteDoc(doc(db, "clanwars", id));
    loadClanWars();
  };

  // ================= FILTER =================
  const filtered = members.filter(m =>
    (m.nickname || "").toLowerCase().includes(search.toLowerCase())
  );

  const ranking = [...members].sort((a,b)=>(b.elo||1000)-(a.elo||1000));

  // ================= RENDER =================
  return (
    <div className="container">

      {/* TOP */}
      <div className="top-banner">
        <h1>THUG CLAN</h1>
        <p>DOMINATE THE LADDER</p>
      </div>

      <div className="top-info">
        <div>📅 {today}</div>
        <div>👥 접속자 0</div>
      </div>

      {/* NAV */}
      <div className="navbar">
        <button onClick={()=>setPage("home")}>HOME</button>
        <button onClick={()=>setPage("members")}>클랜원</button>
        <button onClick={()=>setPage("matches")}>경기</button>
        <button onClick={()=>setPage("board")}>게시판</button>
        <button onClick={()=>setPage("clanwar")}>클랜전</button>
      </div>

      {/* LOGIN */}
      {!isAdmin ? (
        <div>
          <input
            type="password"
            placeholder="admin password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          <button onClick={login}>로그인</button>
        </div>
      ) : (
        <button onClick={logout}>로그아웃</button>
      )}

      {/* ================= HOME ================= */}
      {page === "home" && (
        <div>
          <h2>홈</h2>
          <p>클랜 관리 시스템</p>
        </div>
      )}

      {/* ================= MEMBERS ================= */}
      {page === "members" && (
        <div>
          {isAdmin && (
            <div>
              <input value={newNickname} onChange={e=>setNewNickname(e.target.value)} placeholder="닉네임"/>
              <input value={newTier} onChange={e=>setNewTier(e.target.value)} placeholder="티어"/>
              <button onClick={addMember}>추가</button>
            </div>
          )}

          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="검색"/>

          {filtered.map(m=>(
            <div key={m.id}>
              {m.nickname} ({m.elo})
              {isAdmin && <button onClick={()=>deleteMember(m.id)}>삭제</button>}
            </div>
          ))}
        </div>
      )}

      {/* ================= BOARD ================= */}
      {page === "board" && (
        <div>
          {isAdmin && (
            <div>
              <input value={postTitle} onChange={e=>setPostTitle(e.target.value)} placeholder="제목"/>
              <input value={postAuthor} onChange={e=>setPostAuthor(e.target.value)} placeholder="작성자"/>
              <textarea value={postContent} onChange={e=>setPostContent(e.target.value)} placeholder="내용"/>
              <button onClick={addPost}>작성</button>
            </div>
          )}

          {posts.map(p=>(
            <div key={p.id}>
              <h3>{p.title}</h3>
              <p>{p.content}</p>
              {isAdmin && <button onClick={()=>deletePost(p.id)}>삭제</button>}
            </div>
          ))}
        </div>
      )}

      {/* ================= CLAN WAR ================= */}
      {page === "clanwar" && (
        <div>
          {isAdmin && (
            <div>
              <input value={enemyClan} onChange={e=>setEnemyClan(e.target.value)} placeholder="상대"/>
              <input value={ourScore} onChange={e=>setOurScore(e.target.value)} placeholder="우리점수"/>
              <input value={enemyScore} onChange={e=>setEnemyScore(e.target.value)} placeholder="상대점수"/>
              <button onClick={addClanWar}>등록</button>
            </div>
          )}

          {clanWars.map(w=>(
            <div key={w.id}>
              THUG vs {w.enemyClan} ({w.ourScore}:{w.enemyScore})
              <b>{w.result}</b>
              {isAdmin && <button onClick={()=>deleteClanWar(w.id)}>삭제</button>}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}