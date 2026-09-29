import { redirect } from "next/navigation";
import { getActiveProfileId, getProfiles } from "@/actions/profiles";
import { ProfilePicker } from "@/components/ProfilePicker";
import { Logo } from "@/components/Logo";

export default async function GatePage() {
  const profileId = await getActiveProfileId();
  if (profileId) {
    redirect("/home");
  }

  const profiles = await getProfiles();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <Logo size={96} />
      <ProfilePicker profiles={profiles} />
    </div>
  );
}
