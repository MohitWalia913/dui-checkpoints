import Image from "next/image";
import { ReportCheckpointForm } from "@/components/homepage/report-checkpoint-form";

const APP_FEATURES = [
  "Real-time alerts",
  "Statewide coverage",
  "Plan Your Route",
  "Stay informed",
] as const;

export function ReportCheckpoint() {
  return (
    <section
      id="report-checkpoint"
      className="report-block scroll-mt-[80px] w-full bg-[#F5F6F8] py-16 md:py-16 lg:py-20"
    >
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

            <ReportCheckpointForm />
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
