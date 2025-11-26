function getMimeType(name: string) {
  const ext = name.split(".").pop();

  const map = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  txt: "text/plain"
  };

  return (ext && (map as Record<string, string>)[ext]) || "application/octet-stream";
}
export { getMimeType };