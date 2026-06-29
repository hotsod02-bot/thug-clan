import "./App.css";
import { useEffect, useState, useMemo } from "react";
import { db } from "./firebase";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  onSnapshot,
  setDoc,
  query,
  where
} from "firebase/firestore";

// 초기 클랜전 고정 데이터
const initialClanWars = [
  { id: "raw-1", enemyClan: "1st", ourScore: 5, enemyScore: 1, result: "승리", date: "2026-05-30", lineup: "1세트: 정대만(Z) 승, 2세트: GG(P) 승, 3세트: 백호(Z) 승, 4세트: GX(Z) 승, 5세트: 럭키(T) 승, 6세트: 프린스(T) 승" },
  { id: "raw-2", enemyClan: "스타스쿨", ourScore: 1, enemyScore: 4, result: "패배", date: "2026-05-31", lineup: "1세트: 캐처버(Z) 패, 2세트: 카카루(T) 패, 3세트: 케이틀린(P) 패, 4세트: 테란은약하다(T) 패, 5세트: 깡북이(Z) 패" },
  { id: "raw-3", enemyClan: "New", ourScore: 4, enemyScore: 3, result: "승리", date: "2026-06-01", lineup: "1세트: 커즈(T) 승, 2세트: 백호(Z) 패, 3세트: Gx(Z) 패, 4세트: toss(P) 승, 5세트: 럭키(T) 승, 6세트: 산타(P) 패, 7세트: 참새(P) 승" },
  { id: "raw-4", enemyClan: "BEAST", ourScore: 4, enemyScore: 2, result: "승리", date: "2026-06-02", lineup: "1세트: 프린스(T) 승, 2세트: 팔로(P) 패, 3세트: toss(P) 승, 4세트: 백호(Z) 승, 5세트: 참새(P) 승, 6세트: 럭키(T) 패" },
  { id: "raw-5", enemyClan: "STC", ourScore: 4, enemyScore: 2, result: "승리", date: "2026-06-03", lineup: "1세트: 소림(Z) 패, 2세트: toss(Z) 승, 3세트: 잠마(T) 승, 4세트: 커즈(T) 승, 5세트: 제훈(Z) 패, 6세트: 참새(P) 승" },
  { id: "raw-6", enemyClan: "은하팸", ourScore: 2, enemyScore: 3, result: "패배", date: "2026-06-04", lineup: "1세트: 커즈(T) 승, 2세트: 보초(T) 패, 3세트: 참새(P) 패, 4세트: GG(P) 승, 5세트: 산타(P) 패" },
  { id: "raw-7", enemyClan: "Feisty (1차)", ourScore: 3, enemyScore: 2, result: "승리", date: "2026-06-05", lineup: "1세트: 정대만(Z) 패, 2세트: toss(Z) 승, 3세트: 블루(Z) 승, 4세트: 직구(T) 승, 5세트: 럭키(T) 패" },
  { id: "raw-8", enemyClan: "sea+", ourScore: 0, enemyScore: 5, result: "패배", date: "2026-06-07", lineup: "1세트: 플러스(T) 패, 2세트: 로카(T) 패, 3세트: 아누비스(T) 패, 4세트: GG(P) 패, 5세트: 토스(Z) 패" },
  { id: "raw-9", enemyClan: "Feisty (2차)", ourScore: 6, enemyScore: 2, result: "승리", date: "2026-06-09", lineup: "1세트: 백호(Z) 승, 2세트: 아누비스(T) 패, 3세트: 팔로(P) 승, 4세트: 032(Z) 승, 5세트: 럭키(T) 패, 6세트: 광주(P) 승, 7세트: 정(T) 승, 8세트: 토리(Z) 승" },
  { id: "raw-10", enemyClan: "Feisty (3차)", ourScore: 6, enemyScore: 1, result: "승리", date: "2026-06-12", lineup: "1세트: blue(Z) 승, 2세트: Jik9(T) 승, 3세트: 032(Z) 승, 4세트: 백호(Z) 패, 5세트: Sung(T) 승, 6세트: AJ(P) 승, 7세트: hoban(Z) 승" },
  { id: "raw-11", enemyClan: "Rock", ourScore: 2, enemyScore: 4, result: "패배", date: "2026-06-14", lineup: "1세트: 럭키(T) 패, 2세트: 팔로(P) 패, 3세트: 기백(P) 승, 4세트: Gx(Z) 패, 5세트: 정대만(Z) 패, 6세트: 에스(Z) 패" },
  { id: "raw-12", enemyClan: "Feisty (4차)", ourScore: 2, enemyScore: 5, result: "패배", date: "2026-06-16", lineup: "1세트: Ma(P) 패, 2세트: Gx(P) 패, 3세트: 이기자(P) 승, 4세트: 에스(Z) 패, 5세트: 커즈(T) 승, 6세트: 제훈(Z) 패, 7세트: 백호(Z) 패" },
  { id: "raw-13", enemyClan: "숲스타", ourScore: 2, enemyScore: 3, result: "패배", date: "2026-06-20", lineup: "1세트: 커즈(T) 승, 2세트: Show(P) 패, 3세트: S(Z) 패, 4세트: 소림(T) 패, 5세트: 지지(P) 승" },
  { id: "raw-14", enemyClan: "STC (2차)", ourScore: 2, enemyScore: 4, result: "패배", date: "2026-06-22", lineup: "1세트: 백호(Z) 패, 2세트: 8059(T) 패, 3세트: 프린스(T) 패, 4세트: S(Z) 승, 5세트: gx(Z) 패, 6세트: 쇼(P) 승" }
];

const normalizeRace = (raceStr) => {
  if (!raceStr) return "Terran";
  const r = raceStr.trim().toLowerCase();
  if (r.includes("저그") || r === "zerg" || r === "z") return "Zerg";
  if (r.includes("프로토스") || r.includes("토스") || r === "protoss" || r === "p") return "Protoss";
  return "Terran";
};

// 🃏 THUG CLAN TIER LIST 5대 등급 정보 테마 정의
const getThugRank = (elo) => {
  const score = elo || 1000;
  if (score >= 2244) return { name: "GOD", color: "#ef4444", bg: "#2d1b1b", badge: "🔱 GOD" };
  if (score >= 2028) return { name: "KING", color: "#f97316", bg: "#2d221b", badge: "👑 KING" };
  if (score >= 1740) return { name: "JACK", color: "#a855f7", bg: "#241b2d", badge: "⚔️ JACK" };
  if (score >= 1540) return { name: "JOKER", color: "#10b981", bg: "#1b2d24", badge: "🃏 JOKER" };
  return { name: "설거지", color: "#94a3b8", bg: "#1e293b", badge: "🧽 설거지" };
};

export default function App() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newRace, setNewRace] = useState("Terran");
  const [newTier, setNewTier] = useState("");
  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState("home");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [postAuthor, setPostAuthor] = useState("");
  const [postContent, setPostContent] = useState("");
  const [clanWars, setClanWars] = useState([]);

  const [globalNotice, setGlobalNotice] = useState("THUG CLAN 클랜원 모집중 (관리자 상시 대기)");
  const [myPlayerId, setMyPlayerId] = useState(""); 

  const [isQueueing, setIsQueueing] = useState(false);
  const [matchedGame, setMatchedGame] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [enemyClan, setEnemyClan] = useState("");
  const [ourScore, setOurScore] = useState("");
  const [enemyScore, setEnemyScore] = useState("");
  const [clanWarLineup, setClanWarLineup] = useState(""); 
  
  const [schedules, setSchedules] = useState([]);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const today = new Date().toLocaleDateString("ko-KR");

  // 데이터 가공 및 로드 핸들러
  const loadPosts = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPosts(data.reverse());
  };

  const loadSchedules = async () => {
    const snapshot = await getDocs(collection(db, "schedules"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSchedules(data);
  };

  const loadMembers = async () => {
    const snapshot = await getDocs(collection(db, "members"));
    const data = snapshot.docs.map((d) => {
      const rawData = d.data();
      return {
        id: d.id,
        ...rawData,
        race: normalizeRace(rawData.race),
        elo: rawData.elo || 1000,
        wins: rawData.wins || 0,
        losses: rawData.losses || 0
      };
    });
    setMembers(data);
    if(data.length > 0 && !myPlayerId) setMyPlayerId(data[0].id);
  };

  const loadMatches = async () => {
    const snapshot = await getDocs(collection(db, "matches"));
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMatches(data);
  };

  const loadClanWars = async () => {
    const snapshot = await getDocs(collection(db, "clanwars"));
    const firebaseData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    const combined = [...firebaseData, ...initialClanWars.filter(item => !firebaseData.some(f => f.enemyClan === item.enemyClan && f.date === item.date))];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setClanWars(combined);
  };

  const initNoticeListener = () => {
    onSnapshot(doc(db, "system", "notice"), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalNotice(docSnap.data().content);
      }
    });
  };

  useEffect(() => {
    loadMembers();
    loadMatches();
    loadPosts();
    loadSchedules();
    loadClanWars();
    initNoticeListener();
  }, []);

  useEffect(() => {
    if (!myPlayerId) return;
    const q = query(collection(db, "ladderQueue"), where("status", "==", "matched"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((docData) => {
        const game = docData.data();
        if (game.player1 === myPlayerId || game.player2 === myPlayerId) {
          setMatchedGame(game);
          setIsQueueing(false);
        }
      });
    });
    return () => unsubscribe();
  }, [myPlayerId]);

  const login = () => {
    if (password === "admin123") {
      setIsAdmin(true);
      setPassword("");
    } else {
      alert("비밀번호가 틀렸습니다");
    }
  };
  const logout = () => setIsAdmin(false);

  const editGlobalNotice = async () => {
    const newNot = prompt("수정할 전역 공지사항을 입력하세요:", globalNotice);
    if (newNot === null) return;
    await setDoc(doc(db, "system", "notice"), { content: newNot });
    alert("공지사항이 전면 업데이트 되었습니다.");
  };

  const toggleLadderQueue = async () => {
    const me = members.find(m => m.id === myPlayerId);
    if (!me) return alert("매칭을 돌릴 플레이어 프로필이 설정되지 않았습니다.");

    if (isQueueing) {
      await deleteDoc(doc(db, "ladderQueue", myPlayerId));
      setIsQueueing(false);
      alert("래더 매칭 대기열에서 퇴장했습니다.");
    } else {
      setIsQueueing(true);
      setMatchedGame(null);

      const snapshot = await getDocs(collection(db, "ladderQueue"));
      let opponent = null;
      
      snapshot.docs.forEach((d) => {
        const queueUser = d.data();
        if (queueUser.status === "waiting" && d.id !== myPlayerId) {
          if (Math.abs(queueUser.elo - me.elo) <= 200) {
            opponent = { id: d.id, ...queueUser };
          }
        }
      });

      if (opponent) {
        const matchRoomId = `match_${Date.now()}`;
        await updateDoc(doc(db, "ladderQueue", opponent.id), { status: "matched", matchRoomId, player2: myPlayerId, opponentName: me.nickname });
        await setDoc(doc(db, "ladderQueue", myPlayerId), {
          id: myPlayerId, nickname: me.nickname, elo: me.elo, status: "matched", matchRoomId, player1: opponent.id, player2: myPlayerId, opponentName: opponent.nickname
        });
        alert(`💥 매칭 성공! 상대 방: ${opponent.nickname}님과 매칭되었습니다.`);
      } else {
        await setDoc(doc(db, "ladderQueue", myPlayerId), {
          id: myPlayerId, nickname: me.nickname, elo: me.elo, status: "waiting", createdAt: Date.now()
        });
      }
    }
  };

  const openPlayerProfile = (player) => {
    const total = player.wins + player.losses;
    const wr = total === 0 ? 0 : ((player.wins / total) * 100).toFixed(1);
    const myHistory = matches.filter(m => m.winner === player.nickname || m.loser === player.nickname).slice(0, 5);

    setSelectedProfile({
      ...player,
      globalWinRate: wr,
      totalGames: total,
      vsTerran: total === 0 ? "50.0" : (55.4).toFixed(1),
      vsZerg: total === 0 ? "50.0" : (48.2).toFixed(1),
      vsProtoss: total === 0 ? "50.0" : (61.0).toFixed(1),
      history: myHistory
    });
  };

  const deleteSchedule = async (id) => {
    if (!confirm("일정을 삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "schedules", id));
    loadSchedules();
  };

  const addSchedule = async () => {
    if (!scheduleTitle || !scheduleDate) return alert("날짜와 일정을 입력하세요");
    await addDoc(collection(db, "schedules"), { title: scheduleTitle, date: scheduleDate });
    setScheduleTitle(""); setScheduleDate(""); loadSchedules();
  };

  const addMember = async () => {
    if (!newNickname || !newTier) return alert("닉네임과 티어를 입력하세요");
    await addDoc(collection(db, "members"), {
      nickname: newNickname, race: normalizeRace(newRace), tier: newTier.toUpperCase(), wins: 0, losses: 0, elo: 1000
    });
    setNewNickname(""); setNewRace("Terran"); setNewTier(""); loadMembers();
    alert("클랜원 등록 완료");
  };

  const deleteMember = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "members", id)); loadMembers();
  };

  const editNickname = async (member) => {
    const newName = prompt("새 닉네임", member.nickname);
    if (!newName) return;
    await updateDoc(doc(db, "members", member.id), { nickname: newName }); loadMembers();
  };

  const updateScore = async (id, type) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    await updateDoc(doc(db, "members", id), { [type]: (member[type] || 0) + 1 }); loadMembers();
  };

  const addPost = async () => {
    if (!postTitle) return alert("글 제목을 입력하세요");
    await addDoc(collection(db, "posts"), {
      title: postTitle, author: postAuthor || "익명", content: postContent, createdAt: new Date().toLocaleString(), comments: []
    });
    setPostTitle(""); setPostAuthor(""); setPostContent(""); loadPosts();
  };

  const deletePost = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "posts", id));
    if (selectedPost && selectedPost.id === id) setSelectedPost(null);
    loadPosts();
  };

  const addComment = async () => {
    if (!commentContent) return alert("댓글 내용을 입력하세요");
    const updatedComments = selectedPost.comments ? [...selectedPost.comments] : [];
    updatedComments.push({
      id: Date.now().toString(), author: commentAuthor || "익명", content: commentContent, createdAt: new Date().toLocaleString()
    });
    await updateDoc(doc(db, "posts", selectedPost.id), { comments: updatedComments });
    setSelectedPost({ ...selectedPost, comments: updatedComments });
    setCommentAuthor(""); setCommentContent(""); loadPosts();
  };

  const registerMatch = async () => {
    if (!winner || !loser) return alert("승자와 패자를 선택하세요");
    if (winner === loser) return alert("같은 사람은 선택할 수 없습니다");

    const winnerMember = members.find((m) => m.id === winner);
    const loserMember = members.find((m) => m.id === loser);
    if (!winnerMember || !loserMember) return alert("선수 정보를 불러오지 못했습니다");

    const winnerElo = winnerMember.elo || 1000;
    const loserElo = loserMember.elo || 1000;
    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser));

    setLoading(true);
    try {
      await updateDoc(doc(db, "members", winner), { wins: (winnerMember.wins || 0) + 1, elo: newWinnerElo });
      await updateDoc(doc(db, "members", loser), { losses: (loserMember.losses || 0) + 1, elo: newLoserElo });
      await addDoc(collection(db, "matches"), {
        winner: winnerMember.nickname, loser: loserMember.nickname, date: new Date().toLocaleString()
      });
      alert("경기 결과 등록 완료");
      setWinner(""); setLoser(""); loadMembers(); loadMatches();
    } catch (err) {
      console.error(err); alert("경기 등록 중 오류가 발생했습니다");
    }
    setLoading(false);
  };

  const addClanWar = async () => {
    if (!enemyClan || !ourScore || !enemyScore) return alert("모든 정보를 입력하세요");
    await addDoc(collection(db, "clanwars"), {
      enemyClan, ourScore: Number(ourScore), enemyScore: Number(enemyScore),
      result: Number(ourScore) > Number(enemyScore) ? "승리" : "패배",
      lineup: clanWarLineup || "등록된 출전 선수 명단이 없습니다.", date: new Date().toLocaleDateString()
    });
    setEnemyClan(""); setOurScore(""); setEnemyScore(""); setClanWarLineup(""); loadClanWars();
  };

  const deleteClanWar = async (id) => {
    if (!confirm("기록을 삭제하시겠습니까?")) return;
    if(id.startsWith("raw-")) return alert("기본 연동 데이터는 수동 삭제가 불가능합니다.");
    await deleteDoc(doc(db, "clanwars", id)); loadClanWars();
  };

  const filteredMembers = members.filter((m) => (m.nickname || "").toLowerCase().includes(search.toLowerCase()));
  
  // ⚡ ELO 기준 정렬 완료된 랭킹 데이터 수립
  const ranking = useMemo(() => {
    return [...members].sort((a, b) => b.elo - a.elo);
  }, [members]);
  
  const clanWins = clanWars.filter((w) => w.result === "승리").length;
  const clanLosses = clanWars.filter((w) => w.result === "패배").length;
  const clanWinRate = clanWins + clanLosses === 0 ? 0 : ((clanWins / (clanWins + clanLosses)) * 100).toFixed(1);

  // 🔥 메인 클랜전 기록 기준: 3판 이상 플레이어 대상 승률순 정렬 연산
  const topTenPlayers = useMemo(() => {
    return members
      .map((m) => {
        const total = m.wins + m.losses;
        return { ...m, total, winRate: total === 0 ? 0 : (m.wins / total) * 100 };
      })
      .filter((m) => m.total >= 3)
      .sort((a, b) => b.winRate - a.winRate || b.total - a.total)
      .slice(0, 10);
  }, [members]);

  const totalCount = members.length || 1;
  const terranCount = members.filter(m => m.race === "Terran").length;
  const zergCount = members.filter(m => m.race === "Zerg").length;
  const protossCount = members.filter(m => m.race === "Protoss").length;

  const tPercent = ((terranCount / totalCount) * 100).toFixed(1);
  const zPercent = ((zergCount / totalCount) * 100).toFixed(1);
  const pPercent = ((protossCount / totalCount) * 100).toFixed(1);

  const tierMap = {};
  members.forEach(m => {
    const t = m.tier ? m.tier.toUpperCase() : "미지정";
    tierMap[t] = (tierMap[t] || 0) + 1;
  });

  return (
    <div className="container" style={{ background: "#090d16", color: "#e2e8f0", fontFamily: "sans-serif", padding: "20px", minHeight: "100vh" }}>
      
      {/* 타이틀 배너 */}
      <div className="top-banner" style={{ textAlign: "center", padding: "40px 20px", background: "linear-gradient(to bottom, #000000, #111827)", borderBottom: "3px solid #1f2937", borderRadius: "12px" }}>
        <div style={{ fontSize: "50px", fontWeight: "900", color: "#fff", letterSpacing: "4px", textShadow: "2px 2px 4px #000" }}>THUG CLAN</div>
        <p style={{ color: "#94a3b8", fontWeight: "bold", margin: "10px 0 0 0" }}>義 • TO THE DEATH • 忠誠</p>
      </div>

      <div className="top-info" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", background: "#111827", padding: "12px 20px", marginTop: "10px", borderRadius: "8px", fontSize: "14px", border: "1px solid #1f2937" }}>
        <div>📅 {today}</div>
        <div style={{ color: "#f59e0b" }}>⚙️ 내 플레이어 프로필 변경: 
          <select value={myPlayerId} onChange={(e) => setMyPlayerId(e.target.value)} style={{ background: "#1e293b", color: "#fff", marginLeft: "6px", border: "1px solid #334155", borderRadius: "4px" }}>
            {members.map(m => <option key={m.id} value={m.id}>{m.nickname} (ELO: {m.elo})</option>)}
          </select>
        </div>
        <div>📢 THUG OFFICIAL SITE</div>
      </div>

      {/* 공지사항 */}
      <div className="notice-box" style={{ background: "#1e1b4b", borderLeft: "4px solid #4f46e5", padding: "15px", margin: "15px 0", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span><strong>📢 공지사항:</strong> {globalNotice}</span>
        {isAdmin && <button onClick={editGlobalNotice} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>공지수정</button>}
      </div>

      {/* 네비게이션 */}
      <div className="navbar" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["home", "ladder", "members", "matches", "clanwar", "board"].map((pName) => (
          <button key={pName} onClick={() => setPage(pName)} style={{ flex: 1, padding: "12px", background: page === pName ? "#334155" : "#111827", color: "#fff", border: "1px solid #1f2937", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase" }}>
            {pName === "ladder" ? "🏆 래더 시스템" : pName === "clanwar" ? "📊 클랜전 기록실" : pName}
          </button>
        ))}
      </div>

      {/* 클랜 일정 */}
      <div className="schedule-box" style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #1f2937" }}>
        <h2 style={{ marginTop: 0, borderBottom: "1px solid #1f2937", paddingBottom: "10px" }}>📅 클랜 일정</h2>
        {schedules.map((item) => (
          <div key={item.id} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>📅 {item.date} - {item.title}</span>
            {isAdmin && <button onClick={() => deleteSchedule(item.id)} style={{ background: "#ef4444", border: "none", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>삭제</button>}
          </div>
        ))}
        {isAdmin && (
          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "6px", borderRadius: "4px" }} />
            <input placeholder="일정 명 입력" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "6px", borderRadius: "4px", flex: 1 }} />
            <button onClick={addSchedule} style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px" }}>추가</button>
          </div>
        )}
      </div>

      {/* 관리자 인증 */}
      {!isAdmin ? (
        <div style={{ marginBottom: "20px", background: "#111827", padding: "15px", borderRadius: "8px", border: "1px solid #1f2937" }}>
          <input type="password" placeholder="관리자 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "8px", borderRadius: "6px" }} />
          <button onClick={login} style={{ marginLeft: "10px", padding: "8px 16px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>관리자 로그인</button>
        </div>
      ) : (
        <div style={{ marginBottom: "20px", background: "#1e1b4b", padding: "15px", borderRadius: "8px" }}>
          <strong>🛡️ 관리자 권한 활성화됨</strong> <button onClick={logout} style={{ marginLeft: "10px", background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px" }}>로그아웃</button>
        </div>
      )}

      {/* 종합 통계리스트 */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{members.length}</h2><p style={{ color: "#94a3b8", margin: 0 }}>전체 클랜원</p></div>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{ranking[0]?.elo || 1000}</h2><p style={{ color: "#94a3b8", margin: 0 }}>최고 ELO 명예</p></div>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{topTenPlayers.length}</h2><p style={{ color: "#94a3b8", margin: 0 }}>정식 랭커 (3전+)</p></div>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{clanWinRate}%</h2><p style={{ color: "#94a3b8", margin: 0 }}>클랜전 전적 ({clanWins}승 {clanLosses}패)</p></div>
      </div>

      {/* ==================== HOME VIEW ==================== */}
      {page === "home" && (
        <div>
          {/* 🔥 [신규 추가] 메인 클랜전 승률 TOP 10 (3판 이상) 위젯 */}
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #ef4444" }}>
            <h3 style={{ marginTop: 0, color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
              🔥 클랜전 승률 TOP 10 <span style={{ fontSize: "12px", color: "#94a3b8" }}>(3판 이상 대상)</span>
            </h3>
            {topTenPlayers.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>조건을 충족하는 선수가 없습니다.</p>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {topTenPlayers.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", background: "#090d16", padding: "10px 15px", borderRadius: "6px", border: "1px solid #334155" }}>
                    <span><strong style={{ color: i < 3 ? "#ef4444" : "#e2e8f0" }}>{i + 1}위</strong> - {m.nickname} ({m.race})</span>
                    <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{m.winRate.toFixed(1)}% ({m.wins}승 {m.losses}패)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 종족 차트 구성 */}
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #1f2937" }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>📊 종족별 세부 구성 비율</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px" }}>
                  <span>🔵 Terran ({terranCount}명)</span><span>{tPercent}%</span>
                </div>
                <div style={{ background: "#1e293b", width: "100%", height: "16px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ background: "#3b82f6", width: `${tPercent}%`, height: "100%" }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px" }}>
                  <span>🔴 Zerg ({zergCount}명)</span><span>{zPercent}%</span>
                </div>
                <div style={{ background: "#1e293b", width: "100%", height: "16px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ background: "#ef4444", width: `${zPercent}%`, height: "100%" }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px" }}>
                  <span>🟡 Protoss ({protossCount}명)</span><span>{pPercent}%</span>
                </div>
                <div style={{ background: "#1e293b", width: "100%", height: "16px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ background: "#eab308", width: `${pPercent}%`, height: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 티어 목록 인원 */}
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #1f2937" }}>
            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>🎖️ 서버 등록 공식 티어 분포</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.keys(tierMap).sort().map(tier => (
                <div key={tier} style={{ background: "#090d16", padding: "10px 15px", borderRadius: "8px", textAlign: "center", minWidth: "70px", border: "1px solid #1f2937" }}>
                  <div style={{ fontWeight: "bold", color: "#60a5fa", fontSize: "18px" }}>{tier}</div>
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>{tierMap[tier]}명</div>
                </div>
              ))}
            </div>
          </div>

          <input placeholder="클랜원 실시간 닉네임 서칭..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "12px", boxSizing: "border-box", background: "#111827", color: "#fff", border: "1px solid #1f2937", marginBottom: "20px", borderRadius: "8px" }} />

          {/* ELO 랭킹 TOP 10 리스트 구성 (5단계 뱃지 적용) */}
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #1f2937" }}>
            <h3 style={{ marginTop: 0 }}>🏆 THUG 명예의 전당 (ELO TOP 10)</h3>
            {ranking.slice(0, 10).map((m, i) => {
              const rBadge = getThugRank(m.elo);
              return (
                <div key={m.id} onClick={() => openPlayerProfile(m)} style={{ display: "flex", justifyContent: "space-between", background: "#090d16", padding: "10px 15px", marginBottom: "8px", borderRadius: "6px", cursor: "pointer", border: "1px solid #1f2937" }}>
                  <span><strong>{i + 1}위</strong> - {m.nickname} ({m.race})</span>
                  <span style={{ color: rBadge.color, fontWeight: "bold" }}>{rBadge.badge} ({m.elo}점)</span>
                </div>
              );
            })}
          </div>

          {/* 내부 최근 전적 */}
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #1f2937" }}>
            <h3 style={{ marginTop: 0 }}>⚔️ 최근 내부 리그 경기 기록</h3>
            {matches.slice(0, 5).map((match) => (
              <div key={match.id} style={{ background: "#090d16", padding: "10px", borderRadius: "6px", marginBottom: "6px", fontSize: "14px" }}>
                🏆 <span style={{ color: "#22c55e" }}>{match.winner}</span> 승리 VS ❌ <span style={{ color: "#ef4444" }}>{match.loser}</span> 패배 <small style={{ color: "#64748b", float: "right" }}>{match.date}</small>
              </div>
            ))}
          </div>

          {/* 내부 수동 매치 기록 권한 등록 */}
          {isAdmin && (
            <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #1f2937" }}>
              <h2 style={{ marginTop: 0 }}>내부 스크림 결과 수동 수선 등록</h2>
              <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
                <div>
                  <label style={{ marginRight: "8px" }}>WINNER</label>
                  <select value={winner} onChange={(e) => setWinner(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", borderRadius: "6px" }}>
                    <option value="">선택</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.nickname}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ marginRight: "8px" }}>LOSER</label>
                  <select value={loser} onChange={(e) => setLoser(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", borderRadius: "6px" }}>
                    <option value="">선택</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.nickname}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={registerMatch} disabled={loading} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>{loading ? "매치 등록 중..." : "결과 강제 확정"}</button>
            </div>
          )}
        </div>
      )}

      {/* ==================== LADDER SYSTEM VIEW ==================== */}
      {page === "ladder" && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
          <h2>🏆 THUG 자체 실시간 래더 매치메이킹 시스템</h2>
          
          <div style={{ background: "#090d16", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #334155", textAlign: "center" }}>
            <h3>📡 실시간 래더 매칭 콘솔</h3>
            <p>내 매칭 계정: <strong>{members.find(m => m.id === myPlayerId)?.nickname || "선택되지 않음"}</strong></p>
            
            {matchedGame ? (
              <div style={{ background: "#1e1b4b", padding: "15px", borderRadius: "8px", border: "2px solid #6366f1", margin: "15px 0" }}>
                <h4 style={{ color: "#f59e0b", margin: "0 0 10px 0" }}>🔥 매치 성사 안내 🔥</h4>
                <p style={{ fontSize: "18px", fontWeight: "bold" }}>상대 플레이어: <span style={{ color: "#ef4444" }}>{matchedGame.opponentName}</span></p>
                <p style={{ fontSize: "14px", color: "#94a3b8" }}>방 이름: {matchedGame.matchRoomId} / 게임에 접속하여 난입 수락하세요.</p>
                <button onClick={() => setMatchedGame(null)} style={{ background: "#475569", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", marginTop: "5px" }}>방 확인 완료</button>
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>{isQueueing ? "⏳ 나와 매칭 등급이 맞는 상대방(±200 ELO)을 실시간 추적 중..." : "대기열이 정지해 있습니다. 매칭 큐를 돌려보세요."}</p>
            )}

            <button onClick={toggleLadderQueue} style={{ background: isQueueing ? "#ef4444" : "#4f46e5", color: "#fff", border: "none", padding: "12px 24px", fontSize: "16px", fontWeight: "bold", borderRadius: "6px", cursor: "pointer", marginTop: "10px" }}>
              {isQueueing ? "❌ 매치 찾기 취소" : "⚔️ 래더 매치 검색 (Queue)"}
            </button>
          </div>

          {/* ⚡ 실시간 래더 랭킹보드 (정상 정렬 및 등급 뱃지 전면 세분화 수정) */}
          <h3>🏅 THUG 전체 실시간 래더 랭킹보드</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {ranking.map((member, index) => {
              const rBadge = getThugRank(member.elo);
              return (
                <div key={member.id} onClick={() => openPlayerProfile(member)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#090d16", padding: "12px 20px", borderRadius: "8px", border: "1px solid #1f2937", cursor: "pointer" }}>
                  <span><strong style={{ color: index < 3 ? "#ef4444" : "#64748b", marginRight: "8px" }}>{index + 1}위</strong> {member.nickname} ({member.race})</span>
                  <span style={{ 
                    color: rBadge.color, 
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    background: rBadge.bg,
                    border: `1px solid ${rBadge.color}`,
                    fontSize: "13px"
                  }}>
                    {rBadge.badge} ({member.elo}점)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== MEMBERS VIEW ==================== */}
      {page === "members" && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
          <h2>👥 클랜원 명단 관리</h2>
          {isAdmin && (
            <div style={{ background: "#090d16", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #334155" }}>
              <h4>➕ 신규 멤버 등록</h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input placeholder="닉네임" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
                <select value={newRace} onChange={(e) => setNewRace(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }}>
                  <option value="Terran">Terran</option>
                  <option value="Zerg">Zerg</option>
                  <option value="Protoss">Protoss</option>
                </select>
                <input placeholder="공식 티어 (ex: 스타멸망전티어)" value={newTier} onChange={(e) => setNewTier(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
                <button onClick={addMember} style={{ background: "#10b981", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>등록</button>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gap: "10px" }}>
            {filteredMembers.map(m => (
              <div key={m.id} style={{ background: "#090d16", padding: "15px", borderRadius: "8px", border: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>{m.nickname}</span> 
                  <span style={{ marginLeft: "8px", color: "#94a3b8" }}>[{m.race}] 티어: {m.tier || "미지정"}</span>
                </div>
                {isAdmin && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => editNickname(m)} style={{ background: "#fbbf24", color: "#000", border: "none", padding: "4px 8px", borderRadius: "4px" }}>수정</button>
                    <button onClick={() => deleteMember(m.id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px" }}>제명</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MATCHES VIEW ==================== */}
      {page === "matches" && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
          <h2>⚔️ 내부 리그 전체 기록</h2>
          <div style={{ display: "grid", gap: "8px" }}>
            {matches.map((m) => (
              <div key={m.id} style={{ background: "#090d16", padding: "12px 15px", borderRadius: "6px", fontSize: "15px" }}>
                🔵 <strong style={{ color: "#3b82f6" }}>{m.winner}</strong> 승리 vs 🔴 <span style={{ color: "#64748b" }}>{m.loser}</span> 패배 
                <span style={{ float: "right", color: "#475569", fontSize: "13px" }}>{m.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== CLANWAR VIEW (개선 완료) ==================== */}
      {page === "clanwar" && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
          <h2>📊 클랜전 종합 기록실</h2>
          {isAdmin && (
            <div style={{ background: "#090d16", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #334155" }}>
              <h4>➕ 신규 외부 클랜전 결과 영수증 등록</h4>
              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input placeholder="상대 클랜명" value={enemyClan} onChange={(e) => setEnemyClan(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", flex: 2 }} />
                  <input placeholder="THUG 스코어" type="number" value={ourScore} onChange={(e) => setOurScore(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", flex: 1 }} />
                  <input placeholder="상대 스코어" type="number" value={enemyScore} onChange={(e) => setEnemyScore(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", flex: 1 }} />
                </div>
                <textarea placeholder="출전 라인업 및 세부 세트별 결과 기록" value={clanWarLineup} onChange={(e) => setClanWarLineup(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", minHeight: "60px" }} />
                <button onClick={addClanWar} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>결과서 대장 등록</button>
              </div>
            </div>
          )}

          {/* 📊 한눈에 보기 편하게 개선된 클랜전 기록 테이블 구조 */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#090d16", color: "#94a3b8", textAlign: "left", borderBottom: "2px solid #1f2937" }}>
                  <th style={{ padding: "12px" }}>날짜</th>
                  <th style={{ padding: "12px" }}>상대 매치</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>스코어</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>결과</th>
                  <th style={{ padding: "12px" }}>세부 세트별 라인업 현황</th>
                  {isAdmin && <th style={{ padding: "12px", textAlign: "center" }}>관리</th>}
                </tr>
              </thead>
              <tbody>
                {clanWars.map((war) => (
                  <tr key={war.id} style={{ borderBottom: "1px solid #1f2937", background: "#111827" }}>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#94a3b8" }}>{war.date}</td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>vs {war.enemyClan}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold", fontSize: "16px", color: "#fff" }}>
                      {war.ourScore} : {war.enemyScore}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: war.result === "승리" ? "#1e3a8a" : "#7f1d1d",
                        color: war.result === "승리" ? "#60a5fa" : "#f87171"
                      }}>
                        {war.result}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#cbd5e1", maxWidth: "400px", lineHeight: "1.4" }}>
                      {war.lineup}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button onClick={() => deleteClanWar(war.id)} style={{ background: "#ef4444", border: "none", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>삭제</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== BOARD VIEW ==================== */}
      {page === "board" && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
          <h2>📋 클랜 전략 공유 및 자유게시판</h2>
          <div style={{ background: "#090d16", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <h4>✍️ 새로운 소통글 작성</h4>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input placeholder="작성자명" value={postAuthor} onChange={(e) => setPostAuthor(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
                <input placeholder="글 제목 입력" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", flex: 1 }} />
              </div>
              <textarea placeholder="전략 전술 피드백 코멘트 본문 기술" value={postContent} onChange={(e) => setPostContent(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", minHeight: "100px" }} />
              <button onClick={addPost} style={{ background: "#10b981", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold" }}>게시글 릴리즈</button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {posts.map(p => (
              <div key={p.id} style={{ background: "#090d16", padding: "15px", borderRadius: "8px", border: "1px solid #1f2937" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4 style={{ margin: 0, color: "#60a5fa", cursor: "pointer" }} onClick={() => setSelectedPost(p)}>{p.title}</h4>
                  <small style={{ color: "#475569" }}>{p.author} | {p.createdAt}</small>
                </div>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px" }}>{p.content}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#4f46e5" }} onClick={() => setSelectedPost(p)}>💬 댓글 ({p.comments?.length || 0}개)</span>
                  {isAdmin && <button onClick={() => deletePost(p.id)} style={{ background: "#ef4444", border: "none", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>삭제</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 댓글 및 상세조회 모달 팝업 가공 */}
      {selectedPost && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "#111827", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "60px", maxHeight: "80vh", overflowY: "auto", border: "1px solid #334155" }}>
            <h3>{selectedPost.title}</h3>
            <p style={{ whiteSpace: "pre-wrap", color: "#cbd5e1" }}>{selectedPost.content}</p>
            <hr style={{ borderColor: "#1f2937" }} />
            <h4>댓글 피드백 목록</h4>
            {selectedPost.comments?.map(c => (
              <div key={c.id} style={{ background: "#090d16", padding: "8px", borderRadius: "4px", marginBottom: "6px", fontSize: "13px" }}>
                <strong>{c.author}:</strong> {c.content} <small style={{ color: "#475569", float: "right" }}>{c.createdAt}</small>
              </div>
            ))}
            <div style={{ marginTop: "15px", display: "grid", gap: "6px" }}>
              <input placeholder="댓글 작성자" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} style={{ padding: "6px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
              <div style={{ display: "flex", gap: "6px" }}>
                <input placeholder="내용 입력" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} style={{ padding: "6px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", flex: 1 }} />
                <button onClick={addComment} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px" }}>등록</button>
              </div>
            </div>
            <button onClick={() => setSelectedPost(null)} style={{ marginTop: "20px", background: "#475569", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", width: "100%" }}>닫기</button>
          </div>
        </div>
      )}

      {/* 개인 이력조회 상세 모달 */}
      {selectedProfile && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 101 }}>
          <div style={{ background: "#111827", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "500px", border: "1px solid #334155" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>👤 {selectedProfile.nickname} 선수의 비밀 리포트</h3>
            <p>소속 주종족: <strong>{selectedProfile.race}</strong></p>
            <p>현재 ELO 등급 레이팅: <span style={{ color: getThugRank(selectedProfile.elo).color, fontWeight: "bold" }}>{getThugRank(selectedProfile.elo).badge} ({selectedProfile.elo} P)</span></p>
            <p>종합 전적: {selectedProfile.totalGames}전 {selectedProfile.wins}승 {selectedProfile.losses}패 (승률: {selectedProfile.globalWinRate}%)</p>
            <div style={{ background: "#090d16", padding: "10px", borderRadius: "6px", margin: "10px 0", fontSize: "13px" }}>
              <strong>상대 종족별 가상 승률 시뮬레이션</strong><br/>
              VS Terran: {selectedProfile.vsTerran}% | VS Zerg: {selectedProfile.vsZerg}% | VS Protoss: {selectedProfile.vsProtoss}%
            </div>
            <h4>최근 소화한 내부 매치업 이력</h4>
            {selectedProfile.history?.map((h, i) => (
              <div key={i} style={{ fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #1f2937" }}>
                {h.winner === selectedProfile.nickname ? "🟢 승리" : "🔴 패배"} vs {h.winner === selectedProfile.nickname ? h.loser : h.winner} <small style={{ color: "#475569", float: "right" }}>{h.date}</small>
              </div>
            ))}
            <button onClick={() => setSelectedProfile(null)} style={{ marginTop: "20px", background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", width: "100%", fontWeight: "bold" }}>메인화면 복귀</button>
          </div>
        </div>
      )}

    </div>
  );
}