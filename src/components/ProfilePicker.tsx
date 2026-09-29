"use client";

import { useState, useTransition } from "react";
import { AVATARS, getAvatarStyle } from "@/lib/constants";
import type { AvatarId } from "@/lib/constants";
import type { Profile } from "@prisma/client";
import { createProfile, updateProfile, deleteProfile, switchProfile } from "@/actions/profiles";
import { useRouter } from "next/navigation";
import type { IconWeight } from "@phosphor-icons/react";
import {
  IceCream, Popcorn, FilmSlate, Ghost, RocketLaunch, Crown,
  Cat, Dog, Alien, TelevisionSimple, Planet, Skull,
  Plus, PencilSimple, Trash,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ComponentType<{ size: number; weight: IconWeight }>> = {
  "ice-cream": IceCream, popcorn: Popcorn, "film-slate": FilmSlate, ghost: Ghost,
  "rocket-launch": RocketLaunch, crown: Crown, cat: Cat, dog: Dog,
  alien: Alien, "television-simple": TelevisionSimple, planet: Planet, skull: Skull,
};

function AvatarIcon({ avatarId, size }: { avatarId: string; size: number }) {
  const Icon = ICON_MAP[avatarId];
  if (!Icon) return null;
  return <Icon size={size} weight="duotone" />;
}

export function ProfileAvatar({ avatarId, size = 32 }: { avatarId: string; size?: number }) {
  const avatar = AVATARS.find((a) => a.id === avatarId);
  const style = getAvatarStyle(avatar?.hue ?? 0);
  return (
    <span
      className="grid place-items-center rounded-xl flex-none"
      style={{ width: size, height: size, background: style.bg, color: style.fg }}
    >
      <AvatarIcon avatarId={avatarId} size={Math.round(size * 0.8)} />
    </span>
  );
}

type Props = {
  profiles: Profile[];
};

export function ProfilePicker({ profiles: initialProfiles }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [creating, setCreating] = useState(!initialProfiles.length);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState<AvatarId>(AVATARS[0].id);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isFormOpen = creating || !!editingId;

  const handlePick = (profileId: string) => {
    if (managing) return;
    startTransition(async () => {
      await switchProfile(profileId);
      router.push("/home");
      router.refresh();
    });
  };

  const handleCreate = () => {
    if (!draftName.trim()) return;
    startTransition(async () => {
      if (editingId) {
        const updated = await updateProfile(editingId, draftName.trim(), draftAvatar);
        setProfiles((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const created = await createProfile(draftName.trim(), draftAvatar);
        setProfiles((prev) => [...prev, created]);
        setCreating(false);
        router.push("/home");
        router.refresh();
      }
      setDraftName("");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setDraftName(p.name);
    setDraftAvatar(p.avatarId as AvatarId);
  };

  const startCreate = () => {
    setCreating(true);
    setManaging(false);
    setDraftName("");
    setDraftAvatar(AVATARS[profiles.length % AVATARS.length].id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 text-center">
      {!isFormOpen ? (
        <>
          <h2 style={{ fontSize: 40, margin: 0 }}>Who&apos;s watching?</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {profiles.map((p) => {
              const avatar = AVATARS.find((a) => a.id === p.avatarId);
              const style = getAvatarStyle(avatar?.hue ?? 0);
              return (
                <div key={p.id} className="flex flex-col items-center gap-2 relative">
                  <button
                    onClick={() => handlePick(p.id)}
                    disabled={isPending}
                    className="border-0 bg-transparent p-0 cursor-pointer flex flex-col items-center gap-3 text-inherit hover:text-[var(--color-accent)]"
                    style={{ font: "inherit" }}
                  >
                    <span
                      className="profile-square rounded-xl grid place-items-center"
                      style={{ background: style.bg, color: style.fg, boxShadow: "var(--shadow-md)" }}
                    >
                      <AvatarIcon avatarId={p.avatarId} size={124} />
                    </span>
                    <span className="profile-label">{p.name}</span>
                  </button>
                  {managing && (
                    <div className="flex gap-1">
                      <button className="btn btn-ghost" onClick={() => startEdit(p)} style={{ fontSize: 14 }}>
                        <PencilSimple size={16} weight="duotone" /> Edit
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleDelete(p.id)}
                        style={{ fontSize: 14, color: "var(--color-accent-2-700)" }}
                      >
                        <Trash size={16} weight="duotone" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={startCreate}
              className="border-0 bg-transparent p-0 cursor-pointer flex flex-col items-center gap-3 text-inherit hover:text-[var(--color-accent)]"
              style={{ font: "inherit" }}
            >
              <span
                className="profile-square rounded-xl grid place-items-center"
                style={{ border: "2px dashed var(--color-neutral-400)", color: "var(--color-neutral-600)" }}
              >
                <Plus size={56} weight="duotone" />
              </span>
              <span className="profile-label">Add profile</span>
            </button>
          </div>
          {profiles.length > 0 && (
            <button className="btn btn-ghost" onClick={() => setManaging(!managing)}>
              {managing ? "Done" : "Manage profiles"}
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-6" style={{ width: "min(640px, 100%)" }}>
          <div>
            <h2 style={{ fontSize: 40, margin: 0 }}>{editingId ? "Edit profile" : "Create a profile"}</h2>
            <p style={{ fontStyle: "italic", fontSize: 18, margin: "8px 0 0" }}>
              {editingId
                ? "Change the name or pick a new avatar."
                : profiles.length
                  ? "Add someone else who watches here."
                  : "Set up a profile to get started. Watchlist picks are tagged with who added them."}
            </p>
          </div>
          <ProfileAvatar avatarId={draftAvatar} size={140} />
          <div className="field" style={{ width: "min(360px, 100%)", textAlign: "left" }}>
            <label>Name</label>
            <input
              className="input"
              type="text"
              maxLength={20}
              placeholder="Your name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              style={{ minHeight: 44, fontSize: 17 }}
            />
          </div>
          <div style={{ width: "100%", textAlign: "left" }}>
            <h6 style={{ margin: "0 0 12px" }}>Choose an avatar</h6>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
              {AVATARS.map((a) => {
                const style = getAvatarStyle(a.hue);
                const selected = a.id === draftAvatar;
                return (
                  <button
                    key={a.id}
                    onClick={() => setDraftAvatar(a.id)}
                    aria-label={a.label}
                    aria-pressed={selected}
                    className="rounded-xl border-0 grid place-items-center cursor-pointer"
                    style={{
                      aspectRatio: 1,
                      background: style.bg,
                      color: style.fg,
                      outline: selected ? "3px solid var(--color-text)" : "none",
                      outlineOffset: 3,
                    }}
                  >
                    <AvatarIcon avatarId={a.id} size={60} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            {profiles.length > 0 && (
              <button className="btn btn-ghost" onClick={() => { setCreating(false); setEditingId(null); }}>
                Cancel
              </button>
            )}
            <button className="btn btn-primary" onClick={handleCreate} disabled={!draftName.trim() || isPending}>
              {editingId ? "Save changes" : "Create profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
