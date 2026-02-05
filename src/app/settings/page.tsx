"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProviderSelector } from "@/components/provider-selector";
import { useMounted } from "@/hooks/use-mounted";

export default function SettingsPage() {
  const mounted = useMounted();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Back to home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LLM Provider</CardTitle>
          <CardDescription>
            Choose your AI provider, model, and enter your API key. Your key is
            stored locally and sent only to our API route, which proxies it to
            the provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <ProviderSelector />
          ) : (
            <div className="h-48 animate-pulse rounded-md bg-muted" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
