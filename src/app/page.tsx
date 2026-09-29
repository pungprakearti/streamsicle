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
    <div className="min-h-screen flex flex-col p-8">
      <div className="text-center">
        <Logo />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <ProfilePicker profiles={profiles} />
      </div>
    </div>
  );
}
