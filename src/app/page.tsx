import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          SoulGen
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Create distinct AI agent personalities with an interactive wizard.
          Configure temperament, communication style, and more — then generate
          ready-to-use personality files.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/wizard">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
