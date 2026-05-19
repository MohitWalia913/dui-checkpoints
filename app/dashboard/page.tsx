export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div>
        <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
          Welcome back
        </p>
        <h1 className="font-montserrat mt-2 text-3xl font-bold text-[#040F20] md:text-4xl">
          Dashboard
        </h1>
        <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-[#5C6573]">
          Stay informed with real-time DUI checkpoints and incident mapping
          across California. Use the navigation to open the map, report a
          checkpoint, or browse resources.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Checkpoint Map",
            description: "View live checkpoints and incidents on the map.",
            href: "/map",
          },
          {
            title: "Report Checkpoint",
            description: "Submit a new checkpoint for the community.",
            href: "/report",
          },
          {
            title: "Resources",
            description: "Know your rights and access legal resources.",
            href: "/resources",
          },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-[#E8EAED] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-montserrat text-lg font-semibold text-[#040F20] group-hover:text-[#F57E3A]">
              {card.title}
            </h2>
            <p className="font-inter mt-2 text-sm leading-relaxed text-[#5C6573]">
              {card.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
