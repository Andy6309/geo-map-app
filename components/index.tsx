import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome {session.user.email}!</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
