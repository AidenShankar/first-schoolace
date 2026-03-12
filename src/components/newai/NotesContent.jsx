import React, { useRef, useEffect } from "react";

function renderSectionHTML(section) {
  if (!section.content) return "";
  switch (section.type) {
    case "key_points":
      return `<ul style="margin-top:8px;padding-left:18px;">${Array.isArray(section.content) ? section.content.map(p => `<li style="margin-bottom:6px;color:#d1d5db;">${p}</li>`).join("") : ""}</ul>`;
    case "reading_check":
      return Array.isArray(section.content) ? section.content.map(item => `
        <div style="margin-bottom:12px;">
          <p style="color:#818cf8;font-weight:500;">• ${item.question}</p>
          <blockquote style="margin:4px 0 0 16px;padding-left:12px;border-left:2px solid #4c1d95;color:#9ca3af;font-style:italic;">${item.answer}</blockquote>
        </div>`).join("") : "";
    case "compare_contrast":
      if (!section.content?.rows) return "";
      return `<table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead><tr>
          <th style="text-align:left;padding:8px;background:#2a2a2a;border:1px solid #3a3a3a;color:#9ca3af;font-size:12px;">Topic</th>
          <th style="text-align:left;padding:8px;background:#2a2a2a;border:1px solid #3a3a3a;color:#a78bfa;font-size:12px;">${section.content.left_label}</th>
          <th style="text-align:left;padding:8px;background:#2a2a2a;border:1px solid #3a3a3a;color:#818cf8;font-size:12px;">${section.content.right_label}</th>
        </tr></thead>
        <tbody>${section.content.rows.map((row, i) => `<tr style="background:${i%2===0?"#1e1e1e":"#242424"}">
          <td style="padding:8px;border:1px solid #2e2e2e;color:#d1d5db;">${row.label}</td>
          <td style="padding:8px;border:1px solid #2e2e2e;color:#9ca3af;">${row.left}</td>
          <td style="padding:8px;border:1px solid #2e2e2e;color:#9ca3af;">${row.right}</td>
        </tr>`).join("")}</tbody>
      </table>`;
    case "definitions":
      return Array.isArray(section.content) ? section.content.map(item => `
        <div style="margin-bottom:8px;font-size:14px;">
          <span style="color:#a78bfa;font-weight:600;">${item.term}:</span>
          <span style="color:#d1d5db;margin-left:6px;">${item.definition}</span>
        </div>`).join("") : "";
    case "timeline":
      return `<div style="padding-left:12px;border-left:2px solid #4c1d95;margin-top:8px;">
        ${Array.isArray(section.content) ? section.content.map(item => `
          <div style="margin-bottom:12px;font-size:14px;">
            <span style="color:#a78bfa;font-weight:600;">${item.date}</span>
            <span style="color:#d1d5db;margin-left:8px;">${item.event}</span>
          </div>`).join("") : ""}
      </div>`;
    case "summary":
      return `<p style="margin-top:8px;font-size:14px;line-height:1.6;color:#d1d5db;">${section.content}</p>`;
    default:
      if (Array.isArray(section.content)) {
        return `<ul style="margin-top:8px;padding-left:18px;">${section.content.map(p => `<li style="margin-bottom:6px;color:#d1d5db;">${p}</li>`).join("")}</ul>`;
      }
      if (typeof section.content === "string") {
        return `<p style="margin-top:8px;font-size:14px;color:#d1d5db;">${section.content}</p>`;
      }
      return "";
  }
}

function buildInitialHTML(notesData) {
  let html = `<h1 style="font-size:28px;font-weight:700;color:#f3f4f6;margin-bottom:20px;">${notesData.title}</h1>`;
  if (notesData.overview) {
    html += `<h2 style="font-size:16px;font-weight:700;color:#f3f4f6;margin-bottom:6px;">Brief Overview</h2>`;
    html += `<p style="font-size:14px;line-height:1.6;color:#d1d5db;margin-bottom:24px;">${notesData.overview}</p>`;
    html += `<hr style="border:none;border-top:1px solid #2e2e2e;margin:24px 0;">`;
  }
  notesData.sections?.forEach(section => {
    html += `<h2 style="font-size:18px;font-weight:700;color:#f3f4f6;margin-bottom:8px;margin-top:24px;">${section.heading}</h2>`;
    html += renderSectionHTML(section);
  });
  return html;
}

export default function NotesContent({ notesData, editorRef }) {
  const innerRef = useRef(null);
  const ref = editorRef || innerRef;

  useEffect(() => {
    if (ref.current && notesData) {
      ref.current.innerHTML = buildInitialHTML(notesData);
    }
  }, [notesData]);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#1a1a1a" }}>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className="max-w-2xl mx-auto px-10 py-10 outline-none"
        style={{ color: "#d1d5db", minHeight: "100%", lineHeight: 1.6 }}
      />
    </div>
  );
}