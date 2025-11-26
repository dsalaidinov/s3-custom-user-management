import { getMimeType } from "./getMimeType";

export const vueFinderItems = (objects: any[], prefix = "", allowDeep = false) => {
  const files: any[] = [];

  for (const obj of objects) {
    const name = obj.name || obj.prefix;
    if (!name) continue;

    const relative = prefix ? name.replace(prefix, "") : name;
    if (!relative) continue;

    // 🔥 Если поиск — пропускаем ограничение по глубине
    if (!allowDeep) {
      if (relative.includes("/") && !relative.endsWith("/")) {
        continue;
      }
    }

    if (relative.endsWith("/")) {
      files.push({
        type: "dir",
        path: name,
        basename: relative.replace(/\/$/, ""),
        extension: "",
        visibility: "public",
        last_modified: obj.lastModified || Date.now(),
      });
      continue;
    }

    // Файл
    files.push({
      type: "file",
      path: name,
      basename: relative,
      extension: relative.includes(".") ? relative.split(".").pop() : "",
      visibility: "public",
      last_modified: obj.lastModified || Date.now(),
      file_size: obj.size || 0,
      mime_type: getMimeType(relative),
    });
  }

  return {
    dirname: prefix,
    files,
  };
};



