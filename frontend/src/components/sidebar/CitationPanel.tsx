import type { Citation } from "../../types";
import { BookOpen } from "lucide-react";

interface Props {
  citations: Citation[];
}

export default function CitationPanel({ citations }: Props) {
  if (!citations.length) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        <BookOpen size={24} className="mx-auto mb-2 opacity-40" />
        Click a citation to see the source chunks
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Source chunks ({citations.length})
      </p>
      {citations.map((c, i) => (
        <div
          key={c.id}
          className="bg-gray-50 border border-gray-100 rounded-xl p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              [{i + 1}]{c.page_number ? ` · Page ${c.page_number}` : ""}
            </span>
            <span className="text-xs text-gray-400">
              {Math.round(c.score * 100)}% match
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
            {c.text}
          </p>
        </div>
      ))}
    </div>
  );
}
