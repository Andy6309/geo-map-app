import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function TestPage() {
  const signOut = async () => {
    "use server";
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    redirect("/sign-in");
  };
  return (
    <form action={signOut}>
      <Button>Sign out</Button>
    </form>
  );
}
