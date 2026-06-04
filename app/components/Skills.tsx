const skills = [
  {
    category: "Frontend",
    items: [
      { name: "Next.js", level: 90 },
      { name: "React", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Tailwind CSS", level: 85 },
    ],
  },
  {
    category: "Backend & DB",
    items: [
      { name: "Supabase", level: 85 },
      { name: "PostgreSQL", level: 80 },
      { name: "Node.js", level: 75 },
      { name: "REST API", level: 80 },
    ],
  },
  {
    category: "Tools & Other",
    items: [
      { name: "Git / GitHub", level: 85 },
      { name: "Vercel", level: 80 },
      { name: "Claude Code", level: 90 },
      { name: "Figma", level: 60 },
    ],
  },
];

export default function Skills() {
  return (
    <section
      id="skills"
      className="py-24"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-title">Skills</h2>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          技術スタック
        </p>
        <div className="accent-line" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((group) => (
            <div key={group.category} className="card p-6">
              <h3
                className="text-sm font-semibold mb-5 uppercase tracking-wider"
                style={{ color: "var(--accent)" }}
              >
                {group.category}
              </h3>
              <div className="space-y-4">
                {group.items.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color: "var(--text-primary)" }}>
                        {skill.name}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {skill.level}%
                      </span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--border)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${skill.level}%`,
                          background:
                            skill.level >= 85
                              ? "var(--accent-green)"
                              : "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
