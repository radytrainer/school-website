import { Suspense } from "react";
import { getSiteSettings } from "@/lib/queries";
import { resolveImageUrl } from "@/lib/utils";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const settings = await getSiteSettings();
  const backgroundImageUrl = resolveImageUrl(settings.login_background_url);

  return (
    <Suspense>
      <LoginForm backgroundImageUrl={backgroundImageUrl} />
    </Suspense>
  );
}
