import Link from "next/link";

export const getNames = (players: any) => {
  let names: JSX.Element[] = [];
  for (const id in players) {
    names.push(
      <div key={id}>
        {formatName(players[id].name, id)}
        {players[id].place === 1 ? " ★" : ""}
        {", "}
      </div>
    );
  }
  // remove the last comma
  names[names.length - 1] = (
    <div key={names[names.length - 1].key}>
      {names[names.length - 1].props.children.slice(0, -2)}
    </div>
  );
  return names;
};

export const formatName = (name: string, id: string) => (
  <Link href={`/player/${id}`}>{name.replaceAll(/\[[^\]]+]/g, "")}</Link>
);
