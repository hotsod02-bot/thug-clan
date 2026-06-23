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
  const [search, setSearch] = useState("");
  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [matches, setMatches] = useState([]);
const [page, setPage] = useState("home");
const [posts, setPosts] = useState([]);
const [postTitle, setPostTitle] = useState("");
const today = new Date().toLocaleDateString("ko-KR");
const loadPosts = async () => {
  const snapshot = await getDocs(collection(db, "posts"));
  const data = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  setPosts(data.reverse());
};
const loadMatches = async () => {
  const snapshot = await getDocs(collection(db, "matches"));

  const data = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  setMatches(data.reverse());
};
useEffect(() => {
  loadMembers();
  loadMatches();
  loadPosts(); // 👈 추가
}, []);

  const login = () => {
    if (password === "admin123") {
      setIsAdmin(true);
      setPassword("");
    } else {
      alert("비밀번호가 틀렸습니다");
    }
  };

  const logout = () => setIsAdmin(false);

  const deleteMember = async (id) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    await deleteDoc(doc(db, "members", id));
    loadMembers();
  };
  if (!postTitle) return alert("글 제목 입력");

  await addDoc(collection(db, "posts"), {
    title: postTitle,
    date: new Date().toLocaleString(),
  });

  setPostTitle("");
  loadPosts();
};
    if (!winner || !loser) {
      alert("승자와 패자를 선택하세요");
      return;
    }
    if (winner === loser) {
      alert("같은 사람은 선택할 수 없습니다");
      return;
    }

    const winnerMember = members.find((m) => m.id === winner);
    const loserMember = members.find((m) => m.id === loser);
    if (!winnerMember || !loserMember) {
      alert("선수 정보를 불러오지 못했습니다");
      return;
    }

    const winnerElo = winnerMember.elo || 1000;
    const loserElo = loserMember.elo || 1000;
    const K = 32;

    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser));

    setLoading(true);

    try {
      await updateDoc(doc(db, "members", winner), {
        wins: (winnerMember.wins || 0) + 1,
        elo: newWinnerElo,
      });

      await updateDoc(doc(db, "members", loser), {
        losses: (loserMember.losses || 0) + 1,
        elo: newLoserElo,
      });

      await addDoc(collection(db, "matches"), {
        winner: winnerMember.nickname,
        loser: loserMember.nickname,
        date: new Date().toLocaleString(),
      });

alert("경기 결과 등록 완료");
setWinner("");
setLoser("");

loadMembers();
loadMatches();
    } catch (err) {
      console.error(err);
      alert("경기 등록 중 오류가 발생했습니다");
    }

    setLoading(false);
  };

  const editNickname = async (member) => {
    const newName = prompt("새 닉네임", member.nickname);

    if (!newName) return;

    await updateDoc(doc(db, "members", member.id), {
      nickname: newName,
    });

    loadMembers();
  };

  const updateScore = async (id, type) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    await updateDoc(doc(db, "members", id), {
      [type]: (member[type] || 0) + 1,
    });

    loadMembers();
  };

  const filteredMembers = members.filter((member) => (member.nickname || "").toLowerCase().includes(search.toLowerCase()));

  const ranking = [...members].sort((a, b) => (b.elo || 1000) - (a.elo || 1000));

  const winRateRanking = [...members]
    .map((member) => {
      const wins = member.wins || 0;
      const losses = member.losses || 0;
      const total = wins + losses;
      return { ...member, winRate: total === 0 ? 0 : (wins / total) * 100 };
    })
    .filter((m) => (m.wins || 0) + (m.losses || 0) >= 5)
    .sort((a, b) => b.winRate - a.winRate);

  return (
  <div className="container">
   <div className="top-banner">
  <h1>THUG CLAN</h1>
  <p>
    DOMINATE THE LADDER
  </p>
</div>
<div className="top-info">
  <div>📅 {today}</div>
  <div>👥 현재 접속자 : 0명</div>
  <div>📢 THUG CLAN 공식 홈페이지</div>
  <div>💰 후원계좌 : 카카오뱅크 3333-11-7317866</div>
</div>
<div className="navbar">
  <button onClick={() => setPage("home")}>HOME</button>
  <button onClick={() => setPage("ranking")}>랭킹</button>
  <button onClick={() => setPage("members")}>클랜원</button>
  <button onClick={() => setPage("matches")}>경기기록</button>
  <button onClick={() => setPage("board")}>게시판</button>
  <button onClick={() => setPage("gallery")}>갤러리</button>
</div>
<div className="notice-box">
  📢 공지사항 : THUG CLAN 클랜원 모집중
</div>
<div className="schedule-box">
  <h2>📅 클랜 일정</h2>

  <div>🔥 6월 22일 THUG VS STC</div>
  <div>🏆 7월 3일 내부 리그</div>
  <div>⚔️ 7월 10일 정기전</div>
</div>
      {!isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          />
          <button onClick={login} style={{ marginLeft: "10px", padding: "8px 12px" }}>
            로그인
          </button>
        </div>
      )}

      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <strong>관리자 모드</strong>
          <button onClick={logout} style={{ marginLeft: "10px" }}>
            로그아웃
          </button>
        </div>
      )}
<div className="stat-grid">
  <div className="stat-box">
    <h2>{members.length}</h2>
    <p>클랜원</p>
  </div>
{page === "board" && (
  <div className="rank-card">
    <h2>📝 자유게시판</h2>

    <div className="member-card">
      <h3>THUG CLAN 홈페이지 오픈</h3>
      <p>관리자</p>
    </div>

    <div className="member-card">
      <h3>클랜원 모집중</h3>
      <p>관리자</p>
    </div>
  </div>
)}
  <div className="stat-box">
    <h2>{ranking[0]?.elo || 1000}</h2>
    <p>최고 ELO</p>
  </div>

  <div className="stat-box">
    <h2>{winRateRanking.length}</h2>
    <p>랭킹 등록 인원</p>
  </div>
</div>
      <input
        placeholder="닉네임 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "12px", marginTop: "20px", marginBottom: "20px", borderRadius: "8px" }}
      />

      <h2>클랜원 수 : {filteredMembers.length}</h2>

      <div style={{ marginBottom: "16px", marginTop: "8px" }}>
        <h3>🏆 ELO TOP 10</h3>
        {ranking.slice(0, 10).map((m, i) => (
          <div key={m.id} style={{ marginBottom: "6px" }}>
            {i + 1}위 - {m.nickname} : {m.elo || 1000}
          </div>
        ))}
      </div>
<div className="recent-match-box">
  <h3>⚔️ 최근 경기</h3>

  {matches.slice(0, 10).map((match) => (
    <div key={match.id}>
      🏆 {match.winner} VS ❌ {match.loser}
      <br />
      <small>{match.date}</small>
    </div>
  ))}
</div>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ marginTop: "8px" }}>🏅 클랜전 승률 TOP 5</h3>
        {winRateRanking.slice(0, 5).map((m, i) => (
          <div key={m.id} style={{ background: "#1e293b", padding: "10px", marginBottom: "8px", borderRadius: "8px" }}>
            <strong>{i + 1}위</strong> - {m.nickname}
            <div>승률: {m.winRate.toFixed(1)}% ({m.wins || 0}승 {m.losses || 0}패)</div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", marginBottom: "24px" }}>
          <h2>경기 결과 등록</h2>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ marginRight: "8px" }}>승자</label>
            <select value={winner} onChange={(e) => setWinner(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
              <option value="">선택하세요</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.nickname}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ marginRight: "8px" }}>패자</label>
            <select value={loser} onChange={(e) => setLoser(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
              <option value="">선택하세요</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.nickname}
                </option>
              ))}
            </select>
          </div>

          <button onClick={registerMatch} disabled={loading} style={{ padding: "10px 20px", borderRadius: "8px" }}>
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      )}
{page === "members" && (
  <div className="members-grid">
    {filteredMembers.map((member, index) => (
      <div key={member.id} className="member-card thug-card">

        <div className="rank-badge">
          #{index + 1}
        </div>

        <div className="member-info">
          <h3 className="nickname">{member.nickname}</h3>

          <div className="meta">
            <span>종족 : {member.race}</span>
            <span>티어 : {member.tier}</span>
          </div>

          <div className="stats">
            <div>🏆 승 {member.wins || 0}</div>
            <div>💀 패 {member.losses || 0}</div>
          </div>

          <div className="elo">
            ⚡ ELO {member.elo || 1000}
          </div>
        </div>

        {isAdmin && (
          <div className="admin-buttons">
            <button onClick={() => updateScore(member.id, "wins")}>+WIN</button>
            <button onClick={() => updateScore(member.id, "losses")}>+LOSS</button>
            <button onClick={() => editNickname(member)}>EDIT</button>
            <button onClick={() => deleteMember(member.id)}>DELETE</button>
          </div>
        )}

      </div>
    ))}
  </div>
)}