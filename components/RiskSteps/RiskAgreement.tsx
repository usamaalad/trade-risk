import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
import { formatFileSize } from "@/utils";

export const RiskAgreement = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList[] | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter((file) => {
        return !selectedFiles?.some((fileList) =>
          Array.from(fileList).some((f) => f.name === file.name)
        );
      });
      setSelectedFiles((prevFiles: any) => [...(prevFiles ?? []), newFiles]);
    }
  };

  const handleRemoveFile = (name: string) => {
    const filterFiles = selectedFiles?.filter((file) => file[0]?.name !== name);
    setSelectedFiles(filterFiles as FileList[]);
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

        {selectedFiles?.length > 0 ? (
          <div className="flex flex-col gap-y-3 mt -5  w-full">
            {Array.from(selectedFiles).map((fileList, index) => (
              <FileCard
                key={fileList[0].name}
                file={fileList}
                onRemoveFile={handleRemoveFile}
              />
            ))}
          </div>
        ) : (
          <label
            htmlFor="attachment-input"
            className="cursor-pointer w-full flex flex-col justify-center items-center bord er-4 bor der-borderCol border-dotte d py-4 roun ded-md bg- [#F5F7F9]"
          >
            <input
              id="attachment-input"
              type="file"
              onChange={handleFileChange}
              multiple
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

const FileCard = ({
  file,
  onRemoveFile,
}: {
  file: FileList;
  onRemoveFile: (name: string) => void;
}) => {
  return (
    <div className="flex w-full h-[66px] items-center justify-between gap-x-2 border border-borderCol p-2 rounded-lg">
      <div className="flex items-center gap-x-2 w-full">
        <Button type="button" className="bg-red-200 p-1 hover:bg-red-300">
          <Image
            src="/images/pdf.png"
            alt="pdf"
            width={500}
            height={500}
            className="size-8"
          />
        </Button>
        <div>
          <p className="text-lightGray text-sm">{file[0]?.name}</p>
          <p className="text-[12px] text-para">
            {file[0]?.type.split("/")[1].toUpperCase()},{" "}
            {formatFileSize(file[0]?.size)}
          </p>
        </div>
      </div>

      <Button variant="ghost" onClick={() => onRemoveFile(file[0]?.name)}>
        <X className="text-lightGray" />
      </Button>
    </div>
  );
};
