import Image from "next/image";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatFileSize } from "@/utils";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import useStepStore from "@/store/lcsteps.store";
import { ATTACHMENTS } from "@/utils/constant/lg";
import FileUploadService from "@/services/apis/fileUpload.api";
import { Attachment } from "@/types/type";
import { toast } from "sonner";

interface FileAttachment extends Attachment {
  file: File;
}

const FileCard = ({
  file,
  onRemoveFile,
}: {
  file: FileAttachment;
  onRemoveFile: (name: string) => void;
}) => {
  return (
    <div className="cursor-pointer flex items-center justify-between gap-x-2 w-full border border-borderCol p-2 rounded-lg p-3">
      <div className="flex items-center gap-x-2">
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
          <p className="text-sm text-lightGray">
            {file.userFileName.length > 30
              ? `${file.userFileName.slice(0, 26)}...${file.userFileName.slice(
                  -7
                )}`
              : file.userFileName}
          </p>{" "}
          {/* Display user's file name */}
          <p className="text-[12px] text-para">
            {file.fileType}, {formatFileSize(file.fileSize)}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => onRemoveFile(file.firebaseFileName)}
      >
        <X className="text-lightGray" />
      </Button>
    </div>
  );
};

export const Step7 = ({
  register,
  step,
  setValue,
  watch,
  setStepCompleted,
}: {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  step: number;
  watch: UseFormWatch<any>;
  setStepCompleted: any;
}) => {
  const attachments = watch("attachments");
  const [files, setFiles] = useState<
    {
      file: File;
      url: string;
      userFileName: string;
      firebaseFileName: string;
      fileSize: number;
      fileType: string;
    }[]
  >([]);
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { addStep, removeStep } = useStepStore();

  useEffect(() => {
    if (files.length > 0) {
      addStep(ATTACHMENTS);
    } else {
      removeStep(ATTACHMENTS);
    }
  }, [files]);

  useEffect(() => {
    if (attachments?.length > 0) {
      setFiles(attachments);
    }
  }, [attachments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);

      // Define allowed MIME types, not just file extensions
      const allowedFileTypes = [
        "application/pdf", // PDF
        "image/jpeg", // JPEG/JPG
        "image/jpg", // JPG (not always required as image/jpeg covers this)
        "image/tiff", // TIFF
        "application/msword", // DOC
        "image/png",
      ];

      // Filter files based on MIME types
      const filteredFiles = newFiles.filter((file) => {
        return allowedFileTypes.includes(file.type);
      });

      if (filteredFiles.length + files.length > 3) {
        setUploadError("You can upload up to 3 files only.");
        return;
      }

      // Check for duplicate file names
      const duplicateFiles = filteredFiles.filter((newFile) =>
        files.some((existingFile) => existingFile.userFileName === newFile.name)
      );

      if (duplicateFiles.length > 0) {
        setUploadError(
          "Duplicate file(s) detected. Please choose unique files."
        );
        toast.error(`Duplicate file(s) detected. Please choose unique files.`);
        return;
      }

      // Proceed with the file upload for valid files
      filteredFiles.forEach((file) => {
        FileUploadService.upload(
          file,
          (url, firebaseFileName) => {
            const newFile = {
              file,
              url,
              userFileName: file.name, // User's file name for display
              firebaseFileName, // Firebase's file name for deletion
              fileSize: file.size,
              fileType: file.type.split("/")[1].toUpperCase(), // Get file type from MIME type
            };

            setFiles((prevFiles) => {
              const updatedFiles = [...prevFiles, newFile];
              setValue(
                "attachments",
                updatedFiles.map((f) => ({
                  url: f.url,
                  userFileName: f.userFileName,
                  firebaseFileName: f.firebaseFileName,
                  fileSize: f.fileSize,
                  fileType: f.fileType,
                }))
              );
              return updatedFiles.slice(0, 3); // Limit to 3 files
            });
          },
          (error) => {
            setUploadError(error.message);
          },
          (progressBar, progress) => {
            setShowProgressBar(progressBar);
            setProgress(progress);
          }
        );
      });
    }
  };

  const handleRemoveFile = (userFileName: string) => {
    const fileToRemove = files.find(
      (file) => file.userFileName === userFileName
    );
    console.log(fileToRemove, "fileToRemove");
    if (fileToRemove) {
      FileUploadService.delete(
        fileToRemove.firebaseFileName, // Use Firebase file name for deletion
        () => {
          const updatedFiles = files.filter(
            (file) => file.userFileName !== userFileName
          );
          setFiles(updatedFiles);
          setValue(
            "attachments",
            updatedFiles.map((f) => ({
              url: f.url,
              userFileName: f.userFileName,
              firebaseFileName: f.firebaseFileName,
              fileSize: f.fileSize,
              fileType: f.fileType,
            }))
          );
        },
        (error) => {
          setUploadError(error.message);
        }
      );
    }
  };

  return (
    <div
      id="step7"
      className="w-full border border-borderCol rounded-lg py-3 px-4 h-full scroll-target"
    >
      <div className="mb-3 ml-2 flex items-center gap-x-2">
        <p className="center size-6 rounded-full bg-primaryCol text-sm font-semibold text-white">
          {step}
        </p>
        <p className="text-[16px] font-semibold text-lightGray">Attachments</p>
      </div>

      {files.length < 3 && (
        <div>
          <p className="ml-3 text-sm font-semibold">
            Add Documents:{" "}
            <span className="font-medium"> e.g Drafts / Invoice </span>{" "}
            (PDF,JPG,PNG,TIFF)
          </p>
          <div className="bg-[#F5F7F9] p-1 mt-1 rounded-md">
            <label
              htmlFor="attachment-input"
              className="cursor-pointer flex flex-col justify-center items-center border-[3px] border-borderCol border-dotted py-4 rounded-md bg-[#F5F7F9]"
            >
              <input
                id="attachment-input"
                type="file"
                onChange={(e) => {
                  handleFileChange(e);
                  e.target.value = "";
                }}
                multiple
                style={{ display: "none" }}
                disabled={files.length >= 3}
                accept=".jpg,.jpeg,.pdf,.tiff,.doc,.png"
              />
              <div className="center size-12 rounded-full bg-white shadow-sm">
                <Image
                  src="/images/attachment.svg"
                  alt="att"
                  width={27}
                  height={27}
                />
              </div>
              <p className="mt-4 text-lg font-semibold text-lightGray">
                Drag your files here
              </p>
              <p className="text-lightGray">
                or click to select from your device
              </p>
              <p className="mt-2 text-sm text-para">
                {files.length}/3 files selected
              </p>
            </label>
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-5 flex flex-col gap-y-3">
          {files.map((file) => (
            <FileCard
              key={file.userFileName}
              file={file}
              onRemoveFile={handleRemoveFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { FileCard };
