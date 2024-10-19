import api from "../middleware/middleware";

interface UploadResponse {
  url: string;
  fileName: string;
}

interface UploadError {
  message: string;
}

const FileUploadService = {
  upload: async (
    file: File,
    onSuccess: (url: string, fileName: string) => void,
    onError: (error: UploadError) => void,
    onProgress: (progressBar: boolean, progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("FormData contents:", Array.from(formData.entries()));
    try {
      const response = await api.post<{
        statusCode: number;
        data: UploadResponse;
      }>("/firebasestorage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(true, percentCompleted);
          } else {
            onProgress(true, progressEvent.loaded);
          }
        },
      });
      console.log(response, "response");
      if (response.data.statusCode === 200) {
        onSuccess(response.data.data.url, response.data.data.fileName);
      } else {
        onError({ message: "Upload failed" });
      }
    } catch (error: any) {
      onError({ message: (error as any).message });
    }
  },

  delete: async (
    fileName: string,
    onSuccess: () => void,
    onError: (error: UploadError) => void
  ) => {
    try {
      const response = await api.delete<{
        statusCode: number;
      }>(`/firebasestorage/${fileName}`);
      console.log(response, "response");
      if (response.data.statusCode === 200) {
        onSuccess();
      } else {
        onError({ message: "Delete failed" });
      }
    } catch (error: any) {
      onError({ message: (error as any).message });
    }
  },
};

export default FileUploadService;
