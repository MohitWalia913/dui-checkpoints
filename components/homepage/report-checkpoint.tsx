import Image from "next/image";
import { ArrowRight } from "lucide-react";

const APP_FEATURES = [
  "Real-time alerts",
  "Statewide coverage",
  "Plan Your Route",
  "Stay informed",
] as const;

const inputClassName =
  "font-inter w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-base text-[#040F20] placeholder:text-[#9CA3AF] focus:border-[#F57E3A] focus:outline-none focus:ring-1 focus:ring-[#F57E3A]";

export function ReportCheckpoint() {
  return (
    <section className="w-full bg-[#F5F6F8] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          {/* Left — report form */}
          <div>
            <h2 className="font-inter text-[32px] font-bold leading-tight text-[#040F20] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
              Report a{" "}
              <span className="text-[#F57E3A]">Checkpoint</span>
            </h2>
            <p className="font-inter mt-4 max-w-lg text-[18px] font-normal leading-[1.6] text-[#5C6573]">
              Do you know of a new checkpoint in California? Submit the
              information below, and we&apos;ll add it to the live map.
            </p>

            <form className="mt-8 space-y-4" action="#" method="post">
              <div>
                <label htmlFor="full-name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="inquiry-type" className="sr-only">
                  Type of Inquiry
                </label>
                <select
                  id="inquiry-type"
                  name="inquiryType"
                  className={`${inputClassName} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m4%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 text-[#9CA3AF]`}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Type of Inquiry
                  </option>
                  <option value="checkpoint">Report a checkpoint</option>
                  <option value="general">General inquiry</option>
                  <option value="legal">Legal help</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  How can we help you?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="How can we help you?"
                  className={`${inputClassName} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="font-inter flex w-full items-center justify-center gap-2 rounded-lg bg-[#F57E3A] px-6 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
              >
                Send Message
                <ArrowRight className="h-5 w-5" aria-hidden />
              </button>
            </form>
          </div>

          {/* Right — app promo card */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_8px_32px_rgba(4,15,32,0.08)] md:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-4">
              <div className="relative z-10 max-w-md">
                <h2 className="font-inter text-[32px] font-bold leading-tight text-[#040F20] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                  Protect Your Rights.
                </h2>
                <span className="font-inter mt-1 block text-[32px] font-bold leading-tight text-[#F57E3A] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                  Download the App Today.
                </span>

                <ul className="mt-8 space-y-5">
                  {APP_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Image
                        src="/tick.png"
                        alt=""
                        width={24}
                        height={24}
                        className="mt-1 h-6 w-6 shrink-0"
                      />
                      <span className="font-inter text-[24px] font-semibold leading-[1.6] text-[#040F20]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex justify-center lg:justify-end lg:-mr-8">
                <Image
                  src="/meehanlaw.png"
                  alt="Meehan Law Firm mobile app"
                  width={320}
                  height={640}
                  className="relative z-10 h-auto w-[min(100%,280px)] max-w-[320px] object-contain drop-shadow-xl sm:w-[300px] lg:w-[320px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
