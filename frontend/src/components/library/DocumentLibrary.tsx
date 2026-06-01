import { useDocuments, useDeleteDocument } from "../../hooks/useDocuments";
import { FileText, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Document } from "../../types";

const StatusBadge = ({ status }: { status: Document["status"] }) => {
  const map = {
    processing: {
      icon: <Loader2 size={12} className="animate-spin" />,
      cls: "text-yellow-700 bg-yellow-50",
      label: "Processing",
    },
    ready: {
      icon: <CheckCircle size={12} />,
      cls: "text-green-700 bg-green-50",
      label: "Ready",
    },
    failed: {
      icon: <XCircle size={12} />,
      cls: "text-red-700 bg-red-50",
      label: "Failed",
    },
  };
  const s = map[status];
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

export default function DocumentLibrary() {
  const { data: docs, isLoading } = useDocuments();
  const { mutate: deleteDoc } = useDeleteDocument();
  const navigate = useNavigate();

  if (isLoading) return <p className="text-sm text-gray-400">Loading...</p>;
  if (!docs?.length)
    return (
      <p className="text-sm text-gray-400">
        No documents yet. Upload one above.
      </p>
    );

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
        >
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
            onClick={() =>
              doc.status === "ready" && navigate(`/chat/${doc.id}`)
            }
          >
            <FileText size={18} className="text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {doc.filename}
              </p>
              <p className="text-xs text-gray-400">
                {doc.page_count ? `${doc.page_count} pages · ` : ""}
                {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <StatusBadge status={doc.status} />
            <button
              onClick={() => deleteDoc(doc.id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
