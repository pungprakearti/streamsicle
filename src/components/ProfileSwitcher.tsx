"use client";

import { ProfileAvatar } from "./ProfilePicker";
import { clearProfile } from "@/actions/profiles";
import { CaretDown } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  name: string;
  avatarId: string;
};

export function ProfileSwitcher({ name, avatarId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = () => {
    startTransition(async () => {
      await clearProfile();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      title="Switch profile"
      className="border-0 bg-transparent p-1 cursor-pointer flex items-center gap-2 text-inherit hover:text-[var(--color-accent)] rounded-xl"
      style={{ font: "inherit", fontSize: 15 }}
    >
      <ProfileAvatar avatarId={avatarId} size={32} />
      <span>{name}</span>
      <CaretDown size={14} weight="duotone" />
    </button>
  );
}
