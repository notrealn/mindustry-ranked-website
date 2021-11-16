import { Alignment, Button, Navbar } from "@blueprintjs/core";
import Link from "next/link";

export default function AppBar() {
  return (
    <Navbar fixedToTop={true}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Ranked</Navbar.Heading>
        <Navbar.Divider />
        <Link href="/" passHref={true}>
          <Button className="bp3-minimal" icon="home" text="Home" />
        </Link>
        <Link href="https://discord.com/invite/F3Z9JvDs4r" passHref={true}>
          <Button className="bp3-minimal" icon="share" text="Discord" />
        </Link>
      </Navbar.Group>
    </Navbar>
  );
}
