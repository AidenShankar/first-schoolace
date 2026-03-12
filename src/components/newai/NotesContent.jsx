import React from "react";

function KeyPoints({ content }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {content.map((point, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#d1d5db" }}>
          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#6b6b6b" }} />
          {point}
        </li>
      ))}
    </ul>
  );
}

function ReadingCheck({ content }) {
  return (
    <div className="mt-2 space-y-4">
      {content.map((item, i) => (
        <div key={i}>
          <p className="text-sm font-medium" style={{ color: "#818cf8" }}>• {item.question}</p>
          <blockquote className="mt-1 ml-4 pl-3 border-l-2 text-sm italic" style={{ borderColor: "#4c1d95", color: "#9ca3af" }}>
            {item.answer}
          </blockquote>
        </div>
      ))}
    </div>
  );
}

function CompareContrast({ content }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 font-semibold text-xs" style={{ background: "#2a2a2a", border: "1px solid #3a3a3a", color: "#9ca3af" }}>Topic</th>
            <th className="text-left p-2 font-semibold text-xs" style={{ background: "#2a2a2a", border: "1px solid #3a3a3a", color: "#a78bfa" }}>{content.left_label}</th>
            <th className="text-left p-2 font-semibold text-xs" style={{ background: "#2a2a2a", border: "1px solid #3a3a3a", color: "#818cf8" }}>{content.right_label}</th>
          </tr>
        </thead>
        <tbody>
          {content.rows?.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#1e1e1e" : "#242424" }}>
              <td className="p-2 font-medium text-sm" style={{ border: "1px solid #2e2e2e", color: "#d1d5db" }}>{row.label}</td>
              <td className="p-2 text-sm" style={{ border: "1px solid #2e2e2e", color: "#9ca3af" }}>{row.left}</td>
              <td className="p-2 text-sm" style={{ border: "1px solid #2e2e2e", color: "#9ca3af" }}>{row.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Definitions({ content }) {
  return (
    <div className="mt-2 space-y-2">
      {content.map((item, i) => (
        <div key={i} className="flex gap-2 text-sm">
          <span className="font-semibold shrink-0" style={{ color: "#a78bfa" }}>{item.term}:</span>
          <span style={{ color: "#d1d5db" }}>{item.definition}</span>
        </div>
      ))}
    </div>
  );
}

function Timeline({ content }) {
  return (
    <div className="mt-2 space-y-3 pl-3 border-l-2" style={{ borderColor: "#4c1d95" }}>
      {content.map((item, i) => (
        <div key={i} className="text-sm">
          <span className="font-semibold" style={{ color: "#a78bfa" }}>{item.date}</span>
          <span className="ml-2" style={{ color: "#d1d5db" }}>{item.event}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ section }) {
  const renderContent = () => {
    if (!section.content) return null;
    switch (section.type) {
      case "key_points": return <KeyPoints content={section.content} />;
      case "reading_check": return <ReadingCheck content={section.content} />;
      case "compare_contrast": return <CompareContrast content={section.content} />;
      case "definitions": return <Definitions content={section.content} />;
      case "timeline": return <Timeline content={section.content} />;
      case "summary": return <p className="mt-2 text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{section.content}</p>;
      default:
        if (Array.isArray(section.content)) return <KeyPoints content={section.content} />;
        if (typeof section.content === "string") return <p className="mt-2 text-sm" style={{ color: "#d1d5db" }}>{section.content}</p>;
        return null;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-2" style={{ color: "#f3f4f6" }}>{section.heading}</h2>
      {renderContent()}
    </div>
  );
}

export default function NotesContent({ notesData }) {
  if (!notesData) return null;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#1a1a1a" }}>
      <div className="max-w-2xl mx-auto px-10 py-10">
        <h1 className="text-3xl font-bold mb-5" style={{ color: "#f3f4f6" }}>{notesData.title}</h1>

        {notesData.overview && (
          <div className="mb-8">
            <h2 className="text-base font-bold mb-1" style={{ color: "#f3f4f6" }}>Brief Overview</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{notesData.overview}</p>
          </div>
        )}

        <hr className="my-6" style={{ borderColor: "#2e2e2e" }} />

        {notesData.sections?.map((section, i) => (
          <Section key={i} section={section} />
        ))}
      </div>
    </div>
  );
}