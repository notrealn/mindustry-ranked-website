import { HTMLTable } from "@blueprintjs/core";
import axios from "axios";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import useSwr from "swr";
import AppBar from "../components/appbar";
import { Namelist } from "../components/namelist";
import { Username } from "../components/username";
import styles from "../styles/Home.module.css";
// props: any is definitely best practices, dont @ me
const Home: NextPage = (props: any) => {
  const leaderboard = useSwr(
    "https://ranked.ddns.net/api/leaderboard?limit=10",
    (url: string) => axios.get(url).then((res) => res.data)
  );
  const recentMatches = useSwr(
    "https://ranked.ddns.net/api/matches?limit=10",
    (url: string) => axios.get(url).then((res) => res.data)
  );

  if (leaderboard.error || recentMatches.error)
    return <div>Failed to load.</div>;
  if (!leaderboard.data || !recentMatches.data) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Homepage | Mindustry Ranked</title>
        <meta name="description" content="Mindustry Ranked homepage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <AppBar />
        <h1>Top 10 Players</h1>
        <HTMLTable striped={true}>
          <thead>
            <tr>
              <th>Place</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.data.playerList.map((player: any, index: number) => (
              <tr key={player.player_id}>
                <td>{index + 1}</td>
                <td>
                  <Username name={player.name} id={player.player_id} />
                </td>
                <td>{player.ratings["1v1"].rating}</td>
                <td>
                  {(() => {
                    // totally best practices
                    for (let i = 0; i < props.ranks.length; i++) {
                      if (
                        player.ratings["1v1"].rating < props.ranks[i].startsAt
                      )
                        return props.ranks[i - 1]?.name;
                    }
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        <h1>Recent Games</h1>
        <HTMLTable striped={true}>
          <thead>
            <tr>
              <th>Match ID</th>
              <th>Players</th>
              <th>Map</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {recentMatches.data.historyList.map((match: any) => (
              <tr key={match.match_id}>
                <td>
                  <Link href={`/match/${match.match_id}`} passHref={true}>
                    <a>{match.match_id}</a>
                  </Link>
                </td>
                <td>
                  <Namelist players={match.players} />
                </td>
                <td>{match.map}</td>
                <td>
                  {isNaN(match.finished_at)
                    ? "Ongoing"
                    : `${Math.round(
                        (match.finished_at - match.started_at) / 60000
                      )} minutes`}
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </main>

      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer> */}
    </div>
  );
};

export const getStaticProps: GetStaticProps = () => {
  return new Promise((resolve) => {
    axios
      .get("https://ranked.ddns.net/api/ranks")
      .then((res) => resolve({ props: { ranks: res.data } }));
  });
};

export default Home;
