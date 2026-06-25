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

  const [enemyClan, setEnemyClan] = useState("");
  const [ourScore, setOurScore] = useState("");
  const [enemyScore, setEnemyScore] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  
  // 댓글 기능을 위한 상태 추가
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const today = new Date().toLocaleDateString("ko-KR");

  // 데이터 로드 함수들
  const loadPosts = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setPosts(data.reverse());
  };

  const loadSchedules = async () => {
    const snapshot = await getDocs(collection(db, "schedules"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setSchedules(data);
  };

  const loadMembers = async () => {
    const snapshot = await getDocs(collection(db, "members"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setMembers(data);
  };

  const loadMatches = async () => {
    const snapshot = await getDocs(collection(db, "matches"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMatches(data);
  };

  const loadClanWars = async () => {
    const snapshot = await getDocs(collection(db, "clanwars"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setClanWars(data.reverse());
  };

  useEffect(() => {
    loadMembers();
    loadMatches();
    loadPosts();
    loadSchedules();
    loadClanWars();
  }, []);

  // 인증 관련
  const login = () => {
    if (password === "admin123") {
      setIsAdmin(true);
      setPassword("");
    } else {
      alert("비밀번호가 틀렸습니다");
    }
  };

  const logout = () => setIsAdmin(false);

  // 일정 관리
  const deleteSchedule = async (id) => {
    const ok = confirm("일정을 삭제하시겠습니까?");
    if (!ok) return;
    await deleteDoc(doc(db, "schedules", id));
    loadSchedules();
  };

  const addSchedule = async () => {
    if (!scheduleTitle || !scheduleDate) {
      alert("날짜와 일정을 입력하세요");
      return;
    }
    await addDoc(collection(db, "schedules"), {
      title: scheduleTitle,
      date: scheduleDate,
    });
    setScheduleTitle("");
    setScheduleDate("");
    loadSchedules();
  };

  // 클랜원 관리
  const addMember = async () => {
    if (!newNickname || !newTier) {
      alert("닉네임과 티어를 입력하세요");
      return;
    }
    await addDoc(collection(db, "members"), {
      nickname: newNickname,
      race: newRace,
      tier: newTier,
      wins: 0,
      losses: 0,
      elo: 1000,
    });
    setNewNickname("");
    setNewRace("Terran");
    setNewTier("");
    loadMembers();
    alert("클랜원 등록 완료");
  };

  const deleteMember = async (id) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;
    await deleteDoc(doc(db, "members", id));
    loadMembers();
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

  // 게시판 관리
  const addPost = async () => {
    if (!postTitle) {
      alert("글 제목을 입력하세요");
      return;
    }
    await addDoc(collection(db, "posts"), {
      title: postTitle,
      author: postAuthor || "익명",
      content: postContent,
      createdAt: new Date().toLocaleString(),
      comments: [] // 댓글 배열 초기화
    });
    setPostTitle("");
    setPostAuthor("");
    setPostContent("");
    loadPosts();
  };

  const deletePost = async (id) => {
    const ok = confirm("삭제하시겠습니까?");
    if (!ok) return;
    await deleteDoc(doc(db, "posts", id));
    if (selectedPost && selectedPost.id === id) setSelectedPost(null);
    loadPosts();
  };

  // 💬 댓글 추가 기능
  const addComment = async () => {
    if (!commentContent) {
      alert("댓글 내용을 입력하세요");
      return;
    }
    const updatedComments = selectedPost.comments ? [...selectedPost.comments] : [];
    const newComment = {
      id: Date.now().toString(),
      author: commentAuthor || "익명",
      content: commentContent,
      createdAt: new Date().toLocaleString(),
    };
    updatedComments.push(newComment);

    await updateDoc(doc(db, "posts", selectedPost.id), {
      comments: updatedComments
    });

    // 상세 보기 상태 업데이트 및 초기화
    const updatedPost = { ...selectedPost, comments: updatedComments };
    setSelectedPost(updatedPost);
    setCommentAuthor("");
    setCommentContent("");
    loadPosts(); // 게시글 목록 새로고침
  };

  // 전적 등록
  const registerMatch = async () => {
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

  // 클랜전 관리
  const addClanWar = async () => {
    if (!enemyClan || !ourScore || !enemyScore) {
      alert("모든 정보를 입력하세요");
      return;
    }

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
    const ok = confirm("클랜전 기록을 삭제하시겠습니까?");
    if (!ok) return;
    await deleteDoc(doc(db, "clanwars", id));
    loadClanWars();
  };

  // 필터링 및 랭킹 연산
  const filteredMembers = members.filter((member) =>
    (member.nickname || "").toLowerCase().includes(search.toLowerCase())
  );

  const ranking = [...members].sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
  
  const clanWins = clanWars.filter((w) => w.result === "승리").length;
  const clanLosses = clanWars.filter((w) => w.result === "패배").length;
  const clanWinRate =
    clanWins + clanLosses === 0
      ? 0
      : ((clanWins / (clanWins + clanLosses)) * 100).toFixed(1);

  const winRateRanking = [...members]
    .map((member) => {
      const wins = member.wins || 0;
      const losses = member.losses || 0;
      const total = wins + losses;
      return { ...member, winRate: total === 0 ? 0 : (wins / total) * 100 };
    })
    .filter((m) => (m.wins || 0) + (m.losses || 0) >= 1)
    .sort((a, b) => b.winRate - a.winRate);

  return (
    <div className="container">
      {/* 상단 배너 및 정보 */}
      <div className="top-banner">
        <h1>THUG CLAN</h1>
        <p>DOMINATE THE LADDER</p>
      </div>
      <div className="top-info">
        <div>📅 {today}</div>
        <div>👥 현재 접속자 : 0명</div>
        <div>📢 THUG CLAN 공식 홈페이지</div>
        <div>💰 후원계좌 : 카카오뱅크 3333-11-7317866</div>
      </div>

      {/* 네비게이션 바 */}
      <div className="navbar">
        <button onClick={() => setPage("home")}>HOME</button>
        <button onClick={() => setPage("ranking")}>랭킹</button>
        <button onClick={() => setPage("members")}>클랜원</button>
        <button onClick={() => setPage("matches")}>경기기록</button>
        <button onClick={() => setPage("clanwar")}>클랜전</button>
        <button onClick={() => setPage("board")}>게시판</button>
        <button onClick={() => setPage("gallery")}>갤러리</button>
      </div>

      <div className="notice-box">📢 공지사항 : THUG CLAN 클랜원 모집중</div>

      {/* 클랜 일정 */}
      <div className="schedule-box">
        <h2>📅 클랜 일정</h2>
        {schedules.map((item) => (
          <div key={item.id} style={{ marginBottom: "5px" }}>
            📅 {item.date} - {item.title}
            {isAdmin && (
              <button onClick={() => deleteSchedule(item.id)} style={{ marginLeft: "10px" }}>
                삭제
              </button>
            )}
          </div>
        ))}

        {isAdmin && (
          <div style={{ marginTop: "15px" }}>
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <input placeholder="일정 입력" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} />
            <button onClick={addSchedule}>일정 추가</button>
          </div>
        )}
      </div>

      {/* 관리자 로그인/로그아웃 */}
      {!isAdmin ? (
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
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <strong>관리자 모드</strong>
          <button onClick={logout} style={{ marginLeft: "10px" }}>
            로그아웃
          </button>
        </div>
      )}

      {/* 메인 통계 그리드 */}
      <div className="stat-grid">
        <div className="stat-box">
          <h2>{members.length}</h2>
          <p>클랜원</p>
        </div>
        <div className="stat-box">
          <h2>{ranking[0]?.elo || 1000}</h2>
          <p>최고 ELO</p>
        </div>
        <div className="stat-box">
          <h2>{winRateRanking.length}</h2>
          <p>랭킹 등록 인원</p>
        </div>
        <div className="stat-box">
          <h2>{clanWinRate}%</h2>
          <p>클랜전 승률 ({clanWins}승 {clanLosses}패)</p>
        </div>
      </div>

      {/* 1. 홈 페이지 추가 데이터 (기본 뷰) */}
      {page === "home" && (
        <div style={{ marginTop: "20px" }}>
          <input
            placeholder="닉네임 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px" }}
          />
          <h2>클랜원 수 : {filteredMembers.length}</h2>

          <div style={{ marginBottom: "16px", marginTop: "8px" }}>
            <h3>🏆 ELO TOP 10</h3>
            {ranking.slice(0, 10).map((m, i) => (
              <div key={m.id} style={{ marginBottom: "6px" }}>
                {i + 1}위 - {m.nickname} : {m.elo || 1000} ({m.race})
              </div>
            ))}
          </div>

          <div className="recent-match-box" style={{ marginBottom: "24px" }}>
            <h3>⚔️ 최근 경기</h3>
            {matches.slice(0, 10).map((match) => (
              <div key={match.id} style={{ marginBottom: "8px" }}>
                🏆 {match.winner} VS ❌ {match.loser} <br />
                <small style={{ color: "#94a3b8" }}>{match.date}</small>
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
                    <option key={member.id} value={member.id}>{member.nickname}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ marginRight: "8px" }}>패자</label>
                <select value={loser} onChange={(e) => setLoser(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
                  <option value="">선택하세요</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.nickname}</option>
                  ))}
                </select>
              </div>
              <button onClick={registerMatch} disabled={loading} style={{ padding: "10px 20px", borderRadius: "8px" }}>
                {loading ? "등록 중..." : "등록"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. 랭킹 페이지 */}
      {page === "ranking" && (
        <div className="rank-card" style={{ marginTop: "20px" }}>
          <h3>🏅 클랜전 승률 TOP 5</h3>
          {winRateRanking.slice(0, 5).map((m, i) => (
            <div key={m.id} style={{ background: "#1e293b", padding: "10px", marginBottom: "8px", borderRadius: "8px" }}>
              <strong>{i + 1}위</strong> - {m.nickname}
              <div>승률: {m.winRate.toFixed(1)}% ({m.wins || 0}승 {m.losses || 0}패)</div>
            </div>
          ))}
        </div>
      )}

      {/* 3. 게시판 페이지 (댓글 기능 탑재) */}
      {page === "board" && (
        <div className="rank-card" style={{ marginTop: "20px" }}>
          <h2>📝 자유게시판</h2>

          {/* 글쓰기 폼 (누구나 혹은 관리자) */}
          <div style={{ background: "#1e293b", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
            <h3 style={{ marginTop: 0 }}>새 글 작성</h3>
            <input
              type="text"
              placeholder="작성자"
              value={postAuthor}
              onChange={(e) => setPostAuthor(e.target.value)}
              style={{ padding: "8px", marginRight: "10px", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="게시글 제목 입력"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              style={{ padding: "8px", width: "50%", borderRadius: "4px", marginRight: "10px" }}
            />
            <textarea
              placeholder="내용 입력"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
              style={{ width: "100%", marginTop: "10px", padding: "10px", borderRadius: "6px", display: "block" }}
            />
            <button onClick={addPost} style={{ marginTop: "10px", padding: "8px 16px" }}>
              글쓰기
            </button>
          </div>

          {/* 게시글 리스트 */}
          {posts.length === 0 ? (
            <div>등록된 게시글이 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="member-card"
                  onClick={() => setSelectedPost(post)}
                  style={{ cursor: "pointer", background: "#1e293b", padding: "15px", borderRadius: "8px" }}
                >
                  <h3 style={{ margin: "0 0 5px 0" }}>{post.title}</h3>
                  <small style={{ color: "#94a3b8" }}>작성자: {post.author} | {post.createdAt}</small>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePost(post.id);
                      }}
                      style={{ marginLeft: "10px", float: "right" }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 게시글 상세보기 및 댓글창 */}
          {selectedPost && (
            <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", marginTop: "20px", border: "1px solid #334155" }}>
              <h2>{selectedPost.title}</h2>
              <p>👤 작성자 : {selectedPost.author} | 📅 작성일 : {selectedPost.createdAt}</p>
              <hr style={{ borderColor: "#334155" }} />
              <p style={{ whiteSpace: "pre-wrap", minHeight: "100px" }}>{selectedPost.content}</p>
              
              <hr style={{ borderColor: "#334155" }} />
              
              {/* 💬 댓글 영역 */}
              <h3>💬 댓글 ({selectedPost.comments ? selectedPost.comments.length : 0})</h3>
              <div style={{ marginBottom: "15px" }}>
                {selectedPost.comments && selectedPost.comments.map((cmt) => (
                  <div key={cmt.id} style={{ background: "#1e293b", padding: "10px", borderRadius: "6px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "between", fontSize: "0.85rem", color: "#94a3b8" }}>
                      <strong>{cmt.author}</strong> <span style={{ marginLeft: "10px" }}>{cmt.createdAt}</span>
                    </div>
                    <div style={{ marginTop: "4px" }}>{cmt.content}</div>
                  </div>
                ))}
              </div>

              {/* 댓글 작성란 */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <input 
                  placeholder="이름" 
                  value={commentAuthor} 
                  onChange={(e) => setCommentAuthor(e.target.value)} 
                  style={{ width: "20%", padding: "8px", borderRadius: "4px" }}
                />
                <input 
                  placeholder="댓글 내용을 입력하세요" 
                  value={commentContent} 
                  onChange={(e) => setCommentContent(e.target.value)} 
                  style={{ width: "70%", padding: "8px", borderRadius: "4px" }}
                />
                <button onClick={addComment} style={{ width: "10%" }}>등록</button>
              </div>

              <button onClick={() => setSelectedPost(null)} style={{ marginTop: "20px", display: "block" }}>
                닫기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. 클랜원 리스트 페이지 */}
      {page === "members" && (
        <div style={{ marginTop: "20px" }}>
          {isAdmin && (
            <div style={{ background: "#1e293b", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
              <h3>➕ 신규 클랜원 등록</h3>
              <input placeholder="닉네임" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />
              <select value={newRace} onChange={(e) => setNewRace(e.target.value)} style={{ marginLeft: "10px", padding: "5px" }}>
                <option value="Terran">Terran</option>
                <option value="Zerg">Zerg</option>
                <option value="Protoss">Protoss</option>
              </select>
              <input placeholder="티어" value={newTier} onChange={(e) => setNewTier(e.target.value)} style={{ marginLeft: "10px" }} />
              <button onClick={addMember} style={{ marginLeft: "10px" }}>등록</button>
            </div>
          )}

          <div className="members-grid" style={{ display: "grid", gap: "15px" }}>
            {filteredMembers.map((member, index) => (
              <div key={member.id} className="member-card thug-card" style={{ background: "#1e293b", padding: "15px", borderRadius: "8px" }}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="member-info">
                  <h3 className="nickname" style={{ margin: "5px 0" }}>{member.nickname}</h3>
                  <div className="meta">
                    <span style={{ marginRight: "15px" }}>종족 : {member.race}</span>
                    <span>티어 : {member.tier}</span>
                  </div>
                  <div className="stats" style={{ marginTop: "5px" }}>
                    <span>🏆 승 {member.wins || 0} </span> | <span> 💀 패 {member.losses || 0}</span>
                  </div>
                  <div className="elo" style={{ marginTop: "5px", fontWeight: "bold", color: "#f59e0b" }}>
                    ⚡ ELO {member.elo || 1000}
                  </div>
                </div>

                {isAdmin && (
                  <div className="admin-buttons" style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
                    <button onClick={() => updateScore(member.id, "wins")}>+WIN</button>
                    <button onClick={() => updateScore(member.id, "losses")}>+LOSS</button>
                    <button onClick={() => editNickname(member)}>EDIT</button>
                    <button onClick={() => deleteMember(member.id)}>DELETE</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 경기 기록 페이지 */}
      {page === "matches" && (
        <div style={{ marginTop: "20px" }}>
          <h3>⚔️ 전체 경기 기록</h3>
          {matches.map((match) => (
            <div key={match.id} style={{ background: "#1e293b", padding: "10px", marginBottom: "8px", borderRadius: "6px" }}>
              🏆 승리: <strong style={{ color: "#22c55e" }}>{match.winner}</strong> VS ❌ 패배: <strong style={{ color: "#ef4444" }}>{match.loser}</strong>
              <span style={{ marginLeft: "20px", fontSize: "0.85rem", color: "#94a3b8" }}>({match.date})</span>
            </div>
          ))}
        </div>
      )}

      {/* 6. 클랜전 기록 페이지 */}
      {page === "clanwar" && (
        <div className="rank-card" style={{ marginTop: "20px" }}>
          <h2>⚔️ THUG 클랜전 기록</h2>

          {isAdmin && (
            <div style={{ background: "#1e293b", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
              <input placeholder="상대 클랜" value={enemyClan} onChange={(e) => setEnemyClan(e.target.value)} />
              <input placeholder="THUG 점수" value={ourScore} onChange={(e) => setOurScore(e.target.value)} style={{ marginLeft: "10px", width: "80px" }} />
              <input placeholder="상대 점수" value={enemyScore} onChange={(e) => setEnemyScore(e.target.value)} style={{ marginLeft: "10px", width: "80px" }} />
              <button onClick={addClanWar} style={{ marginLeft: "10px" }}>등록</button>
            </div>
          )}

          {clanWars.map((war) => (
            <div
              key={war.id}
              className="member-card"
              style={{
                marginBottom: "15px",
                padding: "15px",
                background: "#1e293b",
                borderRadius: "8px",
                borderLeft: war.result === "승리" ? "5px solid #22c55e" : "5px solid #ef4444",
              }}
            >
              <h3>THUG VS {war.enemyClan}</h3>
              <h2>{war.ourScore} : {war.enemyScore}</h2>
              <div style={{ fontWeight: "bold", color: war.result === "승리" ? "#22c55e" : "#ef4444" }}>{war.result}</div>
              <small style={{ color: "#94a3b8" }}>{war.date}</small>
              {isAdmin && (
                <button onClick={() => deleteClanWar(war.id)} style={{ marginTop: "10px", display: "block" }}>
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 7. 갤러리 페이지 Placeholder */}
      {page === "gallery" && (
        <div style={{ marginTop: "20px", textAlign: "center", padding: "40px" }}>
          <h2>🖼️ 갤러리 준비 중</h2>
          <p>멋진 인게임 스크린샷과 포스터들이 곧 업로드됩니다!</p>
        </div>
      )}
    </div>
  );
}