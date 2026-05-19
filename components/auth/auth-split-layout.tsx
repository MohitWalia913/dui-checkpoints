import { AuthTestimonialPanel } from "@/components/auth/auth-testimonial-panel";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-montserrat flex min-h-svh flex-col bg-[#F5F6F8] lg:flex-row">
      <div className="relative flex min-h-svh w-full shrink-0 flex-col bg-white lg:w-[44%] lg:max-w-[560px] xl:w-[42%] xl:max-w-[600px]">
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
