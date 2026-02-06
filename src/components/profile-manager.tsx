"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Trash2, Edit2, Check, X, Upload, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AgentDNA } from "@/types";
import { useProfileStore } from "@/stores/profile-store";
import { importDnaJson } from "@/lib/export";

// ─── Types ───────────────────────────────────────────────────────

interface ProfileManagerProps {
  currentDna: AgentDNA;
  onLoadProfile: (dna: AgentDNA) => void;
}

// ─── Profile List Item ───────────────────────────────────────────

function ProfileItem({
  id,
  name,
  updatedAt,
  onLoad,
  onDelete,
  onRename,
}: {
  id: string;
  name: string;
  updatedAt: string;
  onLoad: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const handleSaveRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    }
    setIsEditing(false);
    setEditName(name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(name);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete profile "${name}"?`)) {
      onDelete();
    }
  };

  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveRename}
              className="h-7 w-7 p-0"
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <>
            <p className="font-medium text-sm truncate">{name}</p>
            <p className="text-xs text-muted-foreground">Updated {formattedDate}</p>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoad}
            className="h-7 gap-1 px-2"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="text-xs">Load</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export function ProfileManager({ currentDna, onLoadProfile }: ProfileManagerProps) {
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [importJson, setImportJson] = useState("");

  const { profiles, saveProfile, loadProfile, deleteProfile, renameProfile } =
    useProfileStore();

  const handleSaveProfile = () => {
    const trimmed = profileName.trim();
    if (!trimmed) {
      toast.error("Please enter a profile name");
      return;
    }
    saveProfile(trimmed, currentDna);
    setProfileName("");
    toast.success(`Profile "${trimmed}" saved`);
  };

  const handleLoadProfile = (id: string, name: string) => {
    const dna = loadProfile(id);
    if (dna) {
      onLoadProfile(dna);
      setOpen(false);
      toast.success(`Loaded profile "${name}"`);
    }
  };

  const handleDeleteProfile = (id: string, name: string) => {
    deleteProfile(id);
    toast.success(`Deleted profile "${name}"`);
  };

  const handleRenameProfile = (id: string, newName: string) => {
    renameProfile(id, newName);
    toast.success("Profile renamed");
  };

  const handleImportJson = () => {
    const trimmed = importJson.trim();
    if (!trimmed) {
      toast.error("Please paste DNA JSON to import");
      return;
    }

    const dna = importDnaJson(trimmed);
    if (!dna) {
      toast.error("Invalid DNA JSON format");
      return;
    }

    onLoadProfile(dna);
    setImportJson("");
    setOpen(false);
    toast.success("Imported DNA configuration");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" />
          Manage Profiles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Profiles</DialogTitle>
          <DialogDescription>
            Save, load, and manage your agent configurations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Save Current Profile */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Save Current Profile</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Profile name..."
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveProfile();
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveProfile}
                className="h-9 gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>

          {/* Saved Profiles */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Saved Profiles</h4>
            {profiles.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No saved profiles yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save your current configuration above
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <ProfileItem
                    key={profile.id}
                    id={profile.id}
                    name={profile.name}
                    updatedAt={profile.updatedAt}
                    onLoad={() => handleLoadProfile(profile.id, profile.name)}
                    onDelete={() => handleDeleteProfile(profile.id, profile.name)}
                    onRename={(newName) => handleRenameProfile(profile.id, newName)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Import from JSON */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Import from JSON</h4>
            <Textarea
              placeholder="Paste DNA JSON here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="min-h-24 font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportJson}
              className="gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
