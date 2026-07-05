export function handleFilesUpload(files: File[]) {
  console.log(
    "[handleFilesUpload] File upload not implemented yet. Selected files:",
    files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  );
}
