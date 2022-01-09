import { HTMLTable } from "@blueprintjs/core";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSwr from "swr";
import AppBar from "../../components/appbar";
import Namelist from "../../components/namelist";
import styles from "../../styles/Home.module.css";

export default function Player() {
  const router = useRouter();
  const { id } = router.query;

  const player = useSwr(
    `https://ranked.ddns.net/api/player?playerId=${id}`,
    (url: string) => axios.get(url).then((res) => res.data)
  );

  const match = useSwr(
    `https://ranked.ddns.net/api/playerMatches?playerId=${id}&limit=10`,
    (url: string) => axios.get(url).then((res) => res.data)
  );

  if (typeof id !== "string" || isNaN(+id)) return <div>Invalid id type</div>;
  if (player.error || match.error) return <div>Failed to load.</div>;
  if (!player.data || !match.data) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Homepage | Mindustry Ranked</title>
        <meta name="description" content="Mindustry Ranked player" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <AppBar />
        <h1>{player.data.name.replaceAll(/\[[^\]]+]/g, "")}</h1>
        Place on leaderboard: {player.data.place}
        <br />
        Last connection:
        {` ${(
          (Date.now() - player.data.last_connect_timestamp) /
          3600000
        ).toFixed(1)}`}
        hours ago
        <HTMLTable>
          <thead>
            <tr>
              <th>MatchId</th>
              <th>Players</th>
              <th>Map</th>
              <th>Rating</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {match.data.history.length > 0 ? (
              match.data.history.map((match: any, index: number) => {
                return (
                  <tr key={match.match_id}>
                    <td>
                      <Link href={`/match/${match.match_id}`}>
                        <a>{match.match_id}</a>
                      </Link>
                    </td>
                    <td>
                      <Namelist players={match.players} />
                    </td>
                    <td>{match.map}</td>
                    <td>{`${match.players[id].rating_before} → ${match.players[id].rating_after}`}</td>
                    <td>
                      {isNaN(match.finished_at)
                        ? "Ongoing"
                        : `${Math.round(
                            (match.finished_at - match.started_at) / 60000
                          )} minutes`}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td>No recent matches.</td>
              </tr>
            )}
          </tbody>
        </HTMLTable>
      </main>
    </div>
  );
}
// export async function getStaticProps(context: any) {
//   console.log(context.params);
//   return {
//     props: {}, // will be passed to the page component as props
//   };
// }
