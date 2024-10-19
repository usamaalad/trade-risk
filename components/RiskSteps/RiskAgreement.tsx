import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
import { formatFileSize } from "@/utils";
import FileUploadService from "@/services/apis/fileUpload.api";
import { toast } from "sonner";
import { FileCard } from "../LCSteps/Step7";

interface Props {
  register: any;
  watch: any;
  setValue: any;
}

export const RiskAgreement = ({ register, watch, setValue }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    console.log(event, "event");
    if (selectedFile) {
      // Define allowed MIME types, not just file extensions
      const allowedFileTypes = [
        "application/pdf", // PDF
        "image/jpeg", // JPEG/JPG
        "image/jpg", // JPG (not always required as image/jpeg covers this)
        "image/tiff", // TIFF
        "application/msword", // DOC
        "image/png",
      ];

      // Check if the selected file type is allowed
      if (!allowedFileTypes.includes(selectedFile.type)) {
        toast.error("File type not allowed. Please select a valid file.");
        return;
      }

      // Proceed with the file upload for the valid file
      FileUploadService.upload(
        selectedFile,
        (url, firebaseFileName) => {
          const newFile = {
            file: selectedFile,
            url,
            userFileName: selectedFile.name, // User's file name for display
            firebaseFileName, // Firebase's file name for deletion
            fileSize: selectedFile.size,
            fileType: selectedFile.type.split("/")[1].toUpperCase(), // Get file type from MIME type
          };

          setSelectedFile(newFile);
          setValue("uploadSignedCopy", [
            {
              url: newFile.url,
              userFileName: newFile.userFileName,
              firebaseFileName: newFile.firebaseFileName,
              fileSize: newFile.fileSize,
              fileType: newFile.fileType,
            },
          ]);
        },
        (error) => {
          toast.error("Unable to upload file. Please try again.");
        },
        (progressBar, progress) => {
          console.log(progress, "progress");
          console.log(progressBar, "progressBar");
        }
      );
    }
  };

  const handleRemoveFile = (userFileName: string) => {
    if (selectedFile && selectedFile.firebaseFileName === userFileName) {
      FileUploadService.delete(
        selectedFile.firebaseFileName,
        () => {
          setSelectedFile(null);
          setValue("uploadSignedCopy", []);
        },
        (error) => {
          toast.error("Unable to delete file. Please try again.");
        }
      );
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/pdf/report.pdf"; // Use the relative path from the public directory
    link.download = "BAFT_Agreement.pdf"; // Optional: specify the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg border border-borderCol py-4 px-4">
      <div className="gap-x-2 w-full">
        <p className="text-lightGray font-semibold text-[16px] ml-2">
          BAFT Agreement
        </p>
      </div>
      <p className="font-semibold mt-3 ml-2 text-[14px]">
        Download BAFT agreement and upload a signed copy
      </p>
      <div className="flex items-center gap-x-2 w-full mt-2">
        <div
          onClick={handleDownload}
          className="cursor-pointer flex items-center justify-between gap-x-2 w-full border border-borderCol p-2 rounded-lg"
        >
          <div className="flex items-center gap-x-2 ">
            <Button type="button" className="bg-red-200 p-1 hover:bg-red-300">
              <Image
                src="/images/pdf.svg"
                alt="pdf"
                width={500}
                height={500}
                className="size-8"
              />
            </Button>
            <div>
              <p className="text-lightGray text-[14px]">BAFT Agreement</p>
              <p className="text-[12px] text-[#92929D]">PDF, 1.4 MB</p>
            </div>
          </div>
          <Image
            src="/images/download.svg"
            alt="pdf"
            width={500}
            height={500}
            className="size-12"
          />
        </div>

        {selectedFile ? (
          <div className="flex items-center gap-x-2 h-20 w-full">
            <FileCard
              key={selectedFile.userFileName}
              file={selectedFile}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        ) : (
          <label
            htmlFor="attachment-input"
            className="cursor-pointer flex items-center justify-between gap-x-2 w-full p-2 rounded-lg"
          >
            <input
              id="attachment-input"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className="flex items-center justify-between gap-x-2 w-full border border-borderCol p-2 rounded-lg">
              <div className="flex items-center gap-x-2 ">
                <Button
                  type="button"
                  className="bg-[#F3F3F3] p-1 hover:bg-[#F3F3F3]/90 size-10 center"
                >
                  <Image
                    src="/images/attachment.svg"
                    alt="pdf"
                    width={500}
                    height={500}
                    className="size-6"
                  />
                </Button>
                <p className="text-lightGray text-[14px]">Upload signed copy</p>
              </div>
              <Image
                src="/images/upload.svg"
                alt="pdf"
                width={500}
                height={500}
                className="size-12"
              />
            </div>
          </label>
        )}
      </div>
    </div>
  );
};
