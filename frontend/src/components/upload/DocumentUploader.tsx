import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useUploadDocument } from "../../hooks/useDocuments";

export default function DocumentUploader() {
  const { mutate: upload, isPending } = useUploadDocument();

  const onDrop = useCallback(
    (files: File[]) => {
      files.forEach((file) => upload(file));
    },
    [upload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-gray-400" size={28} />
      <p className="text-sm font-medium text-gray-700">
        {isPending ? "Uploading..." : "Drop files here or click to upload"}
      </p>
      <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT supported</p>
    </div>
  );
}
