import { Button, HTMLTable, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import useSwr from "swr";
import AppBar from "../../components/appbar";
import Namelist from "../../components/namelist";
import styles from "../../styles/Home.module.css";
import { maps } from "../../util";

export default function Match() {
  const [statType, setStatType] = useState("unit");

  const router = useRouter();
  const { id } = router.query;

  const match = useSwr(
    `https://ranked.ddns.net/api/match?matchId=${id}`,
    (url: string) => axios.get(url).then((res) => res.data)
  );

  const matchStats = useSwr(
    `https://ranked.ddns.net/api/matchStats?matchId=${id}`,
    (url: string) => axios.get(url).then((res) => res.data)
  );

  const buildOrder = useSwr(
    `https://ranked.ddns.net/api/buildOrder?matchId=${id}&parse=true&types=4,5&aggregate=true`,
    (url: string) => axios.get(url).then((res) => res.data)
  );

  if (typeof id !== "string" || isNaN(+id)) return <div>Invalid id type</div>;
  if (match.error || buildOrder.error || matchStats.error)
    return <div>Failed to load.</div>;
  if (!match.data || !buildOrder.data || !matchStats.data)
    return <div>Loading...</div>;

  // create an object where keys are team id and values is an array of player ids
  const teams: { [teamId: string]: string[] } = {};
  for (const [playerId, stuff] of Object.entries(match.data.players)) {
    teams[(stuff as any).team] = [playerId];
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Homepage | Mindustry Ranked</title>
        <meta name="description" content="Mindustry Ranked match" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <AppBar />
        <h1>Match #{match.data.match_id}</h1>
        <Namelist players={match.data.players} />
        Map: {match.data.map}
        <br />
        {isNaN(match.data.finished_at)
          ? "Ongoing"
          : `Duration: ${Math.round(
              (match.data.finished_at - match.data.started_at) / 60000
            )} minutes`}
        <br />
        <h1>Match Stats</h1>
        <Popover2
          content={
            <Menu>
              <MenuItem
                text="Units Created"
                onClick={() => setStatType("unit")}
              />
              <MenuItem
                text="Buildings Built"
                onClick={() => setStatType("build")}
              />
              <MenuItem text="Items Left" onClick={() => setStatType("item")} />
            </Menu>
          }
        >
          <Button text="Choose type..." />
        </Popover2>
        <HTMLTable striped={true}>
          <thead>
            <tr>
              <th>
                {`${statType[0].toUpperCase()}${statType.slice(
                  1,
                  statType.length
                )}`}{" "}
                type
              </th>
              <th>Team {Object.keys(teams)[0]}</th>
              <th>Team {Object.keys(teams)[1]}</th>
            </tr>
          </thead>
          <tbody>
            <StatTable type={statType} data={matchStats.data} teams={teams} />
          </tbody>
        </HTMLTable>
        <h1>Build Order</h1>
        <HTMLTable striped={true}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Team</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {buildOrder.data.map((stat: any, index: number) => {
              return (
                <tr key={index}>
                  <td>{Math.round(stat.time / 600) / 100} minutes</td>
                  <td>{stat.teamId}</td>
                  <td>{maps.units[stat.unitType]}</td>
                </tr>
              );
            })}
          </tbody>
        </HTMLTable>
      </main>
    </div>
  );
}

function StatTable({
  type,
  data,
  teams,
}: {
  type: string;
  data: any;
  teams: { [teamId: string]: string[] };
}) {
  const team1 = data.team.find(
    (team: any) => team.team == Object.keys(teams)[0]
  );
  const team2 = data.team.find(
    (team: any) => team.team == Object.keys(teams)[1]
  );
  switch (type) {
    default:
      return (
        <>
          {maps.units.map((unit, index) => {
            const a = team1?.createdUnits[index];
            const b = team2?.createdUnits[index];
            if (a || b)
              return (
                <tr key={index}>
                  <td>{unit}</td>
                  <td>{a ? a : 0}</td>
                  <td>{b ? b : 0}</td>
                </tr>
              );
          })}
        </>
      );
    case "build":
      return (
        <>
          {maps.blocks.map((block, index) => {
            const a = Object.entries(team1?.createdBuildingsByUnitTypes).reduce(
              (pre, cur: any[]) => (cur[1][index] ? pre + cur[1][index] : pre),
              0
            );
            const b = Object.entries(team2?.createdBuildingsByUnitTypes).reduce(
              (pre, cur: any[]) => (cur[1][index] ? pre + cur[1][index] : pre),
              0
            );
            if (a || b)
              return (
                <tr key={index}>
                  <td>{block}</td>
                  <td>{a}</td>
                  <td>{b}</td>
                </tr>
              );
          })}
        </>
      );
    case "item":
      return (
        <>
          {maps.items.map((unit, index) => {
            const a = team1?.unusedItems[index];
            const b = team2?.unusedItems[index];
            if (a || b)
              return (
                <tr key={unit}>
                  <td>{unit}</td>
                  <td>{a ? a : 0}</td>
                  <td>{b ? b : 0}</td>
                </tr>
              );
          })}
        </>
      );
  }
}
