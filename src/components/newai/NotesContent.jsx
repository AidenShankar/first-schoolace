import React from "react";
import ReactMarkdown from "react-markdown";

function KeyPoints({ content }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {content.map((point, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
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
          <p className="text-sm font-medium text-purple-600">• {item.question}</p>
          <blockquote className="mt-1 ml-4 pl-3 border-l-2 border-purple-200 text-sm text-gray-600 italic">
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
            <th className="text-left p-2 bg-purple-50 border border-purple-100 font-semibold text-gray-700 w-1/4">Topic</th>
            <th className="text-left p-2 bg-purple-50 border border-purple-100 font-semibold text-purple-700">{content.left_label}</th>
            <th className="text-left p-2 bg-indigo-50 border border-indigo-100 font-semibold text-indigo-700">{content.right_label}</th>
          </tr>
        </thead>
        <tbody>
          {content.rows?.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="p-2 border border-gray-100 font-medium text-gray-700">{row.label}</td>
              <td className="p-2 border border-gray-100 text-gray-600">{row.left}</td>
              <td className="p-2 border border-gray-100 text-gray-600">{row.right}</td>
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
          <span className="font-semibold text-purple-700 shrink-0">{item.term}:</span>
          <span className="text-gray-700">{item.definition}</span>
        </div>
      ))}
    </div>
  );
}

function Timeline({ content }) {
  return (
    <div className="mt-2 space-y-3 pl-3 border-l-2 border-purple-200">
      {content.map((item, i) => (
        <div key={i} className="text-sm">
          <span className="font-semibold text-purple-600">{item.date}</span>
          <span className="text-gray-700 ml-2">{item.event}</span>
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
      case "summary": return <p className="mt-2 text-sm text-gray-700 leading-relaxed">{section.content}</p>;
      default:
        if (Array.isArray(section.content)) return <KeyPoints content={section.content} />;
        if (typeof section.content === "string") return <p className="mt-2 text-sm text-gray-700">{section.content}</p>;
        return null;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">{section.heading}</h2>
      {renderContent()}
    </div>
  );
}

export default function NotesContent({ notesData }) {
  if (!notesData) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Toolbar strip */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="truncate text-gray-400 text-xs">{notesData.fileName}</span>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{notesData.title}</h1>

        {notesData.overview && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-800 mb-1">Brief Overview</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{notesData.overview}</p>
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {notesData.sections?.map((section, i) => (
          <Section key={i} section={section} />
        ))}
      </div>
    </div>
  );
}