export default function Ranking() {
  const players = [
    { name: "THUG_Member1", elo: 1650 },
    { name: "THUG_Member2", elo: 1580 },
    { name: "THUG_Member3", elo: 1490 },
  ];

  return (
    <div>
      <h2>ELO 랭킹</h2>
      <table border="1">
        <thead>
          <tr>
            <th>순위</th>
            <th>닉네임</th>
            <th>ELO</th>
          </tr>
        </thead>
        <tbody>
          {players
            .sort((a, b) => b.elo - a.elo)
            .map((p, i) => (
              <tr key={p.name}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.elo}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
