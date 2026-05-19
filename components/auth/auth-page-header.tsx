import Image from "next/image";
import Link from "next/link";
import logo from "@/app/logo.png";

export function AuthPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <Link href="/" className="inline-block">
        <Image
          src={logo}
          alt="DUI Checkpoints Locator — Statewide, Real-time Alerts"
          className="h-11 w-auto md:h-12"
          priority
        />
      </Link>
      <h1 className="font-montserrat mt-8 text-[28px] font-bold leading-tight tracking-tight text-[#040F20] sm:text-[32px]">
        {title}
      </h1>
      {description ? (
        <p className="font-montserrat mt-2 text-base font-medium leading-relaxed text-[#5C6573]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
