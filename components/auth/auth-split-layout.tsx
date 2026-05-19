import { AuthTestimonialPanel } from "@/components/auth/auth-testimonial-panel";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-montserrat flex min-h-svh flex-col bg-[#F5F6F8] lg:flex-row">
      <div className="relative flex min-h-svh flex-1 flex-col bg-white lg:w-1/2">
        <div
          className="h-1 w-full bg-gradient-to-r from-[#040F20] via-[#F57E3A] to-[#040F20] lg:hidden"
          aria-hidden
        />
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-[420px]">{children}</div>
        </div>
      </div>
      <AuthTestimonialPanel />
    </div>
  );
}
