import { AuthStatusPanel } from "@/components/auth/auth-status-panel";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p>Code error: {params.error}</p>
      ) : (
        <p>An unspecified error occurred.</p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <AuthStatusPanel
      title="Sorry, something went wrong."
      footerHref="/"
      footerLabel="Return home"
    >
      <Suspense>
        <ErrorContent searchParams={searchParams} />
      </Suspense>
    </AuthStatusPanel>
  );
}
