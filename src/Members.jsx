export default function Members() {
  const members = [
    "THUG_Alpha",
    "THUG_Beta",
    "THUG_Gamma",
  ];

  return (
    <div>
      <h2>클랜원 목록</h2>

      {members.map((m) => (
        <div key={m}>{m}</div>
      ))}
    </div>
  );
}
