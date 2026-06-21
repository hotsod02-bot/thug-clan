import { useEffect, useState } from "react";
import { db } from "../firebase";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Admin() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const loadMembers = async () => {
    const snapshot = await getDocs(
      collection(db, "members")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMembers(data);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const deleteMember = async (id) => {
    const ok = confirm("정말 삭제하시겠습니까?");

    if (!ok) return;

    await deleteDoc(doc(db, "members", id));

    loadMembers();
  };

  const filteredMembers = members.filter(
    (member) =>
      (member.nickname || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "30px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
        }}
      >
        THUG CLAN 관리자
      </h1>

      <input
        placeholder="닉네임 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      />

      <h2>
        클랜원 수 : {filteredMembers.length}
      </h2>

      {filteredMembers.map((member) => (
        <div
          key={member.id}
          style={{
            background: "#1e293b",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3>{member.nickname}</h3>

            <div>종족 : {member.race}</div>

            <div>티어 : {member.tier}</div>

            <div>
              승 {member.wins || 0} 패 {member.losses || 0}
            </div>

            <div>ELO : {member.elo || 1000}</div>
          </div>

          <button onClick={() => deleteMember(member.id)}>
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
