import Image from "next/image";
import { ArrowRight } from "lucide-react";

const APP_FEATURES = [
  "Real-time alerts",
  "Statewide coverage",
  "Plan Your Route",
  "Stay informed",
] as const;

const inputClassName =
  "py-[11px] px-[10px] bg-white border border-[#97979D] font-open-sans font-normal text-[14px] leading-[19px] text-[#97979D] w-full rounded-[0px] placeholder:text-[#97979D] focus:border-[#F57E3A] focus:outline-none focus:ring-1 focus:ring-[#F57E3A]";

export function ReportCheckpoint() {
  return (
    <section className="report-block w-full bg-[#F5F6F8] py-16 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1324px] px-6 md:px-10 lg:px-14">
        <div className="flex flex-col items-start gap-12 w-full lg:flex-row lg:grid-cols-2 lg:gap-10 xl:gap-14">
          {/* Left — report form */}
          <div className="w-full max-w-full lg:max-w-[482px]">
            <h2 className=" font-inter text-[28px] font-bold leading-tight text-[#242E4E] sm:text-[32px] md:text-[36px] lg:text-[40px] lg:leading-[50px] xl:text-[46px] xl:leading-[54px]">
              Report a{" "}
              <span className="text-[#F57E3A]">Checkpoint</span>
            </h2>
            <p className="font-inter mt-4 max-w-lg  text-[16px] md:text-[18px] font-normal leading-[1.6] text-[#242E4E]">
              Do you know of a new checkpoint in California? Submit the
              information below, and we&apos;ll add it to the live map.
            </p>

            <form className="mt-[20px] md:mt-[30px] space-y-4" action="#" method="post">

              <div className="form-flex flex justify-between gap-5 mb-[20px]"> 
              <div className="w-full">
                <label htmlFor="full-name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="full-name" 
                  name="fullName"
                  type="text"
                  placeholder="Full Name" 
                  className={inputClassName } 
                  required
                />
              </div>
              <div className="w-full">
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
 </div>
          <div className="form-flex flex justify-between gap-5 mb-[20px]"> 
              <div className="w-full">
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
              <div className="w-full">
                <label htmlFor="inquiry-type" className="sr-only">
                  Type of Inquiry
                </label>
                <select
                  id="inquiry-type"
                  name="inquiryType"
                  className={`${inputClassName} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m4%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10 text-[#242E4E]`}
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

            </div>
              <div className="w-full mt-[0px] mb-[20px]">
                <label htmlFor="message" className="sr-only ">
                  How can we help you?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={1}
                  placeholder="How can we help you?"
                  className={`${inputClassName} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="font-inter !mt-[20px] flex w-full items-center justify-center gap-2 rounded-[0px] bg-[#F57E3A] p-[16px]  md:p-[21px] text-lg font-medium text-white transition-opacity hover:opacity-90 hover:bg-[#000] focus:outline-none"
              >
                Send Message
                <ArrowRight className="h-5 w-5" aria-hidden />
              </button>
            </form>
          </div>

          {/* Right — app promo card */}
          <div className="protect-right relative w-full  max-w-full lg:max-w-[697px] rounded-2xl lg:mt-[85px] bg-white shadow-[0_0_14px_rgba(0,0,0,0.25)] rounded-[20px] p-[25px] md:p-[30px] lg:p-[35px] xl:p-[40px]">
            <div className="protect-right-inner flex justify-between md:gap-[20px] lg:gap-[20px] lg:grid-cols-2 lg:items-center lg:gap-4">
              <div className="protect-right-inner-text relative z-10 max-w-md">
                <h2 className="font-inter text-[20px] md:text-[24px] font-semibold leading-[160%] text-[#242E4E]">
                  Protect Your Rights.
                  <span className=" block text-[#F57E3A]">
                  Download the App Today.
                </span>
                </h2>
                

                <ul className="mt-[20px] space-y-5">
                  {APP_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Image
                        src="/tick.png"
                        alt=""
                        width={24}
                        height={24}
                        className="mt-1 h-6 w-6 shrink-0"
                      />
                      <span className="font-inter font-normal text-[18px] leading-[160%] text-[#242E4E]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="report-right-image-box relative flex justify-center lg:justify-end  relative right-0 h-[387px] lg:mt-[-144px]">
                <Image
                  src="/meehanlaw.png"
                  alt="Meehan Law Firm mobile app"
                  width={187}
                  height={387}
                  className="relative z-10 h-auto max-w-[100%] object-contain drop-shadow-xl w-full max-w-full object-contain h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
