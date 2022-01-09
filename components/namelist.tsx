import Username from "./username";
// import styles from "../styles/Home.module.css";
// wtf do i call this thing
export default function Namelist({ players }: any) {
  return (
    <div>
      {Object.keys(players)
        .map((id: string) => (
          <span key={id}>
            <Username
              name={players[id].name}
              id={id}
              won={players[id].place == 1}
            />
          </span>
        ))
        .reduce((pre: any, cur: JSX.Element) => [pre, ", ", cur] as any)}
    </div>
  );
}
