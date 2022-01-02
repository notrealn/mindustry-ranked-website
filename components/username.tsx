import Link from "next/link";
// i think using any is funny
export function Username({ name, id, won }: any) {
  return (
    <Link href={`/player/${id}`}>
      <a>
        {name.replaceAll(/\[[^\]]+]/g, "")}
        {won ? " ★" : ""}
      </a>
    </Link>
  );
}
