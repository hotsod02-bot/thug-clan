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
  { id: "raw-6", enemyClan: "은하팸", ourScore: 2, enemyScore: 3, result: "패배", date: "2026-06-04", lineup: "1세트: 커즈(T) 승, 2세外面: 보초(T) 패, 3세트: 참새(P) 패, 4세트: GG(P) 승, 5세트: 산타(P) 패" },
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

// 🃏 THUG CLAN TIER LIST 6대 지정 등급 정보 개편
const getThugRank = (elo, tier) => {
  if (tier === "미지정" || (!elo && elo !== 0)) {
    return { name: "미지정", color: "#64748b", bg: "#0f172a", badge: "❔ 미지정" };
  }
  const score = elo;
  if (score >= 2244) return { name: "GOD", color: "#ef4444", bg: "#2d1b1b", badge: "🔱 GOD" };
  if (score >= 2028) return { name: "KING", color: "#f97316", bg: "#2d221b", badge: "👑 KING" };
  if (score >= 1740) return { name: "JACK", color: "#a855f7", bg: "#241b2d", badge: "⚔️ JACK" };
  if (score >= 1540) return { name: "JOKER", color: "#10b981", bg: "#1b2d24", badge: "🃏 JOKER" };
  return { name: "설거지", color: "#38bdf8", bg: "#112240", badge: "🧽 설거지" };
};

export default function App() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRankFilter, setSelectedRankFilter] = useState("ALL"); // 등급 필터 상태
  
  const [newNickname, setNewNickname] = useState("");
  const [newRace, setNewRace] = useState("Terran");
  const [newTier, setNewTier] = useState("미지정"); // 기본값 미지정 설정
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

  // 데이터 로드 핸들러 목록
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
        elo: rawData.elo !== undefined ? rawData.elo : 1000,
        wins: rawData.wins || 0,
        losses: rawData.losses || 0,
        tier: rawData.tier || "미지정"
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
          id: myPlayerId, nickname: me.nickname, elo: me.elo, status: "matched", matchRoomId, player1: opponent.id, player2: myPlayerId, opponentName: me.nickname
        });
        alert(`💥 매칭 성공! 상대 플레이어: ${opponent.nickname}님과 매칭되었습니다.`);
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
    if (!newNickname) return alert("닉네임을 입력하세요");
    await addDoc(collection(db, "members"), {
      nickname: newNickname, race: normalizeRace(newRace), tier: newTier, wins: 0, losses: 0, elo: newTier === "미지정" ? 1000 : 1000
    });
    setNewNickname(""); setNewRace("Terran"); setNewTier("미지정"); loadMembers();
    alert("클랜원 등록 완료");
  };

  const deleteMember = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "members", id)); loadMembers();
  };

  const registerMatch = async () => {
    if (!winner || !loser) return alert("승자와 패자를 선택하세요");
    if (winner === loser) return alert("같은 사람은 선택할 수 없습니다");

    const winnerMember = members.find((m) => m.id === winner);
    const loserMember = members.find((m) => m.id === loser);
    if (!winnerMember || !loserMember) return alert("선수 정보를 불러오지 못했습니다");

    const winnerElo = winnerMember.elo;
    const loserElo = loserMember.elo;
    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser));

    setLoading(true);
    try {
      // 매칭 시 미지정 티어였던 유저는 기록 발생에 따라 자동 갱신되도록 tier 보정 가능
      await updateDoc(doc(db, "members", winner), { wins: (winnerMember.wins || 0) + 1, elo: newWinnerElo, tier: winnerMember.tier === "미지정" ? "등록" : winnerMember.tier });
      await updateDoc(doc(db, "members", loser), { losses: (loserMember.losses || 0) + 1, elo: newLoserElo, tier: loserMember.tier === "미지정" ? "등록" : loserMember.tier });
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

  // ⚡ 서열 정렬 조건이 탑재된 핵심 멤버 가공 필터 파트
  const processedMembers = useMemo(() => {
    let list = [...members];
    
    // 1단계: 검색어 필터링
    if (search) {
      list = list.filter((m) => (m.nickname || "").toLowerCase().includes(search.toLowerCase()));
    }
    
    // 2단계: 서열 조건 부여 분기점 분석 정렬
    list.sort((a, b) => {
      const rankA = getThugRank(a.elo, a.tier).name;
      const rankB = getThugRank(b.elo, b.tier).name;
      const order = { "GOD": 1, "KING": 2, "JACK": 3, "JOKER": 4, "설거지": 5, "미지정": 6 };
      return (order[rankA] || 9) - (order[rankB] || 9) || b.elo - a.elo;
    });

    // 3단계: 상단 등급 전용 대시보드 필터링 가동
    if (selectedRankFilter !== "ALL") {
      list = list.filter(m => getThugRank(m.elo, m.tier).name === selectedRankFilter);
    }

    return list;
  }, [members, search, selectedRankFilter]);

  const ranking = useMemo(() => {
    return [...members].sort((a, b) => b.elo - a.elo);
  }, [members]);
  
  const clanWins = clanWars.filter((w) => w.result === "승리").length;
  const clanLosses = clanWars.filter((w) => w.result === "패배").length;
  const clanWinRate = clanWins + clanLosses === 0 ? 0 : ((clanWins / (clanWins + clanLosses)) * 100).toFixed(1);

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

      {/* 네비게이션 버튼 배치 */}
      <div className="navbar" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["home", "ladder", "members", "matches", "board"].map((pName) => (
          <button key={pName} onClick={() => setPage(pName)} style={{ flex: 1, padding: "12px", background: page === pName ? "#334155" : "#111827", color: "#fff", border: "1px solid #1f2937", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", textTransform: "uppercase" }}>
            {pName === "ladder" ? "🏆 래더 시스템" : pName === "members" ? "👥 클랜원 목록" : pName === "matches" ? "📊 내부 리그 기록" : pName}
          </button>
        ))}
      </div>

      {/* 종합 통계 리스트 */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{members.length}</h2><p style={{ color: "#94a3b8", margin: 0 }}>전체 클랜원</p></div>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{ranking[0]?.elo || 1000}</h2><p style={{ color: "#94a3b8", margin: 0 }}>최고 ELO 명예</p></div>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{topTenPlayers.length}</h2><p style={{ color: "#94a3b8", margin: 0 }}>정식 랭커 (3전+)</p></div>
        <div style={{ background: "#111827", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid #1f2937" }}><h2>{clanWinRate}%</h2><p style={{ color: "#94a3b8", margin: 0 }}>클랜전 전적 ({clanWins}승 {clanLosses}패)</p></div>
      </div>

      {/* ==================== HOME VIEW ==================== */}
      {page === "home" && (
        <div>
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

          {/* 👑 [필터 결합] 서열 정의 서칭/대시보드 영역 */}
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #1f2937" }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>🔍 등급별 서열 필터링 대시보드</h3>
            
            {/* 가로 스크롤 가능한 등급 필터 탭 바 (모바일 대응) */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "15px" }}>
              {["ALL", "GOD", "KING", "JACK", "JOKER", "설거지", "미지정"].map((rankName) => (
                <button
                  key={rankName}
                  onClick={() => setSelectedRankFilter(rankName)}
                  style={{
                    padding: "8px 16px",
                    background: selectedRankFilter === rankName ? "#4f46e5" : "#090d16",
                    color: "#fff",
                    border: "1px solid #334155",
                    borderRadius: "20px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontWeight: "bold",
                    fontSize: "13px"
                  }}
                >
                  {rankName === "ALL" ? "🌐 전체보기" : rankName}
                </button>
              ))}
            </div>

            <input 
              placeholder="클랜원 닉네임 실시간 서칭..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              style={{ width: "100%", padding: "12px", boxSizing: "border-box", background: "#090d16", color: "#fff", border: "1px solid #1f2937", marginBottom: "15px", borderRadius: "8px" }} 
            />

            {/* 메인 선수 목록 카드 레이아웃 */}
            <div style={{ display: "grid", gap: "8px" }}>
              {processedMembers.map((m) => {
                const rBadge = getThugRank(m.elo, m.tier);
                return (
                  <div 
                    key={m.id} 
                    onClick={() => openPlayerProfile(m)} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      background: "#090d16", 
                      padding: "12px 15px", 
                      borderRadius: "8px", 
                      cursor: "pointer", 
                      border: "1px solid #1f2937",
                      transition: "0.2s"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: "bold", fontSize: "15px" }}>{m.nickname}</span>
                      <small style={{ marginLeft: "8px", color: m.race === "Terran" ? "#3b82f6" : m.race === "Zerg" ? "#ef4444" : "#eab308" }}>
                        ({m.race})
                      </small>
                    </div>
                    <span style={{ color: rBadge.color, fontWeight: "bold", background: rBadge.bg, padding: "4px 10px", borderRadius: "6px", fontSize: "13px" }}>
                      {rBadge.badge} ({m.elo}점)
                    </span>
                  </div>
                );
              })}
              {processedMembers.length === 0 && (
                <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px" }}>해당 조건에 일치하는 클랜원이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== LADDER SYSTEM VIEW ==================== */}
      {page === "ladder" && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937" }}>
          <h2>🏆 THUG 실시간 래더 매치메이킹 콘솔</h2>
          <div style={{ background: "#090d16", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
            <p>내 매칭 계정: <strong>{members.find(m => m.id === myPlayerId)?.nickname || "미지정"}</strong></p>
            <button onClick={toggleLadderQueue} style={{ background: isQueueing ? "#ef4444" : "#10b981", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              {isQueueing ? "🛑 대기열 취소" : "🎯 매칭 시작하기"}
            </button>
          </div>
        </div>
      )}

      {/* 클랜원 신규 수동 등록 파트 (관리자 전용) */}
      {isAdmin && (
        <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginTop: "20px", border: "1px solid #1f2937" }}>
          <h3 style={{ marginTop: 0 }}>🛡️ 신규 클랜원 수동 명부 등록</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input placeholder="닉네임 입력" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
            <select value={newRace} onChange={(e) => setNewRace(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }}>
              <option value="Terran">Terran</option>
              <option value="Zerg">Zerg</option>
              <option value="Protoss">Protoss</option>
            </select>
            <select value={newTier} onChange={(e) => setNewTier(e.target.value)} style={{ padding: "8px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }}>
              <option value="지정">기본 평가점 부여</option>
              <option value="미지정">미지정 (대기군 분류)</option>
            </select>
            <button onClick={addMember} style={{ background: "#10b981", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px" }}>등록</button>
          </div>
        </div>
      )}

      {/* 관리자 비밀번호 세션 */}
      <div style={{ marginTop: "30px", background: "#111827", padding: "15px", borderRadius: "8px", textAlign: "right" }}>
        {!isAdmin ? (
          <>
            <input type="password" placeholder="Admin Pass" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", padding: "6px", borderRadius: "4px" }} />
            <button onClick={login} style={{ marginLeft: "6px", padding: "6px 12px", background: "#334155", color: "#fff", border: "none", borderRadius: "4px" }}>인증</button>
          </>
        ) : (
          <button onClick={logout} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px" }}>관리자 로그아웃</button>
        )}
      </div>

      {/* ==================== 팝업 모달창 (선수 상세 프로필 모달) ==================== */}
      {selectedProfile && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "15px", boxSizing: "border-box" }}>
          <div style={{ background: "#111827", border: `2px solid ${getThugRank(selectedProfile.elo, selectedProfile.tier).color}`, borderRadius: "12px", width: "100%", maxWith: "450px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            
            {/* 헤더 */}
            <div style={{ background: "linear-gradient(to right, #000, #1e293b)", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>👤 THUG 인게임 프로필</span>
              <button onClick={() => setSelectedProfile(null)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {/* 내부 콘텐츠 */}
            <div style={{ padding: "20px", display: "grid", gap: "12px", fontSize: "14px" }}>
              <div>닉네임: <strong style={{ fontSize: "16px", color: "#fff" }}>{selectedProfile.nickname}</strong></div>
              <div>소속: <span style={{ color: "#a855f7" }}>THUG CLAN</span></div>
              <div>주종족: <strong style={{ color: selectedProfile.race === "Terran" ? "#3b82f6" : selectedProfile.race === "Zerg" ? "#ef4444" : "#eab308" }}>{selectedProfile.race}</strong></div>
              <div>현재 서열 등급: <span style={{ color: getThugRank(selectedProfile.elo, selectedProfile.tier).color, fontWeight: "bold" }}>{getThugRank(selectedProfile.elo, selectedProfile.tier).badge}</span></div>
              
              <hr style={{ border: "0", borderTop: "1px solid #1f2937", margin: "10px 0" }} />
              
              <div style={{ fontWeight: "bold", color: "#f59e0b" }}>📊 리그 통산 전적</div>
              <div>전체 기록: {selectedProfile.totalGames}전 {selectedProfile.wins}승 {selectedProfile.losses}패 (승률 {selectedProfile.globalWinRate}%)</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", background: "#090d16", padding: "10px", borderRadius: "6px", textAlign: "center", marginTop: "5px", fontSize: "12px" }}>
                <div>전T 승률<br/><span style={{ color: "#3b82f6" }}>{selectedProfile.vsTerran}%</span></div>
                <div>전Z 승률<br/><span style={{ color: "#ef4444" }}>{selectedProfile.vsZerg}%</span></div>
                <div>전P 승률<br/><span style={{ color: "#eab308" }}>{selectedProfile.vsProtoss}%</span></div>
              </div>

              {/* 최근 스크림 내역 */}
              <div style={{ marginTop: "10px" }}>
                <div style={{ fontWeight: "bold", color: "#10b981", marginBottom: "6px" }}>⚔️ 최근 매치 히스토리</div>
                {selectedProfile.history && selectedProfile.history.length > 0 ? (
                  selectedProfile.history.map((h, idx) => (
                    <div key={idx} style={{ background: "#090d16", padding: "6px 10px", borderRadius: "4px", marginBottom: "4px", fontSize: "12px" }}>
                      {h.winner === selectedProfile.nickname ? <span style={{ color: "#22c55e" }}>[승리]</span> : <span style={{ color: "#ef4444" }}>[패배]</span>} vs {h.winner === selectedProfile.nickname ? h.loser : h.winner}
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#64748b", margin: 0, fontSize: "12px" }}>최근 치러진 전적 데이터가 기록되지 않았습니다.</p>
                )}
              </div>
            </div>

            {/* 푸터 버튼 */}
            <div style={{ background: "#090d16", padding: "12px", textAlign: "right", borderTop: "1px solid #1f2937" }}>
              <button onClick={() => setSelectedProfile(null)} style={{ background: "#334155", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "4px", cursor: "pointer" }}>닫기</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}