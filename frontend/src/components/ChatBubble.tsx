import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, SourceCitation } from "../types/chat";

interface ModalViewData {
  title: string;
  items: { source: SourceCitation; index: number }[];
}

function sanitizeMarkdown(content: string): string {
  if (!content) return "";
  const lines = content.split("\n");
  const processed = lines.map((line) => {
    let trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      if (!trimmed.endsWith("|")) {
        trimmed += " |";
      }
      return trimmed.replace(/<br\s*\/?>/gi, "; ");
    }
    return line.replace(/<br\s*\/?>/gi, "\n");
  });
  return processed.join("\n");
}


export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [modalData, setModalData] = useState<ModalViewData | null>(null);

  const cleanContent = sanitizeMarkdown(message.content);


  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!message.sources || message.sources.length === 0) return;
    const rowElement = event.currentTarget;
    const cells = rowElement.querySelectorAll("td");
    if (!cells.length) return; // Header row

    const rowTitle = cells[0].textContent?.trim() || "Selected Point";
    const rowFullText = Array.from(cells)
      .map((c) => c.textContent)
      .join(" ");

    // Extract citation numbers e.g. [1], [2]
    const matches = Array.from(rowFullText.matchAll(/\[(\d+)\]/g));
    const citationIndices = matches
      .map((m) => parseInt(m[1], 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= message.sources!.length);

    // Filter unique indices or use all if none matched
    const uniqueIndices = Array.from(new Set(citationIndices));
    const targetIndices =
      uniqueIndices.length > 0
        ? uniqueIndices
        : message.sources.map((_, i) => i + 1);

    const items = targetIndices
      .map((idx) => ({
        source: message.sources![idx - 1],
        index: idx,
      }))
      .filter((item) => item.source !== undefined);

    if (items.length > 0) {
      setModalData({
        title: rowTitle,
        items,
      });
    }
  };

  const markdownComponents = {
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-4 rounded-xl border border-slate-300 shadow-xs bg-white">
        <table className="w-full text-left border-collapse border border-slate-300 text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-slate-100/90 text-slate-900 border-b-2 border-slate-300 font-bold" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-slate-300 px-4 py-3 font-bold text-slate-900 bg-slate-100" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-slate-200 px-4 py-3 text-slate-800 leading-relaxed font-normal" {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr
        onClick={handleRowClick}
        title="Click row to view contributing document chunks"
        className="border-b border-slate-200 hover:bg-blue-50/70 cursor-pointer transition-colors"
        {...props}
      />
    ),
  };

  return (
    <>
      <div
        className={`max-w-[88%] p-4 sm:p-5 rounded-2xl transition-all ${
          isUser
            ? "self-end bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-500/20"
            : "self-start bg-white/80 border border-white/90 backdrop-blur-md text-slate-800 rounded-bl-xs shadow-xs"
        }`}
      >
        <div className="prose max-w-none text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {cleanContent}
          </ReactMarkdown>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/80">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <span>📚</span>
              <span>Sources & References (Click any table row or chip to view chunk)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((s, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setModalData({
                      title: s.fileName,
                      items: [{ source: s, index: i + 1 }],
                    })
                  }
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 shadow-xs rounded-xl px-3 py-1.5 text-xs text-slate-700 transition-all cursor-pointer group"
                >
                  <span className="bg-blue-600 group-hover:bg-blue-700 text-white text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                    [{i + 1}]
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                    {s.fileName}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                    Page {s.pageNumber ?? s.chunkIndex + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Modal Dialog for Row / Citation Chunks */}
      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setModalData(null)}
        >
          <div
            className="w-11/12 max-w-2xl max-h-[60vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg">
                  Source Chunks
                </span>
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {modalData.title}
                </h3>
              </div>
              <button
                onClick={() => setModalData(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors font-bold text-lg cursor-pointer shrink-0 ml-2"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body showing exact chunks file by file */}
            <div className="p-6 overflow-y-auto max-h-[48vh] space-y-4">
              {modalData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                        [{item.index}]
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        📄 {item.source.fileName}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-md">
                      Page {item.source.pageNumber ?? item.source.chunkIndex + 1}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200/70 rounded-lg text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {item.source.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
