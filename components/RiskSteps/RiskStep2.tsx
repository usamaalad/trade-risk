import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

export const RiskStep2 = () => {
  return (
    <div className="bg-white rounded-lg border border-borderCol py-4 px-4">
      <div className="flex items-center justify-between gap-x-2 w-full">
        <p className="text-lightGray font-semibold text-[17px] ml-2">
          BAFT Agreement
        </p>
        <ChevronDown className="text-[#92929D] cursor-pointer" />
      </div>
      <p className="font-semibold mt-3 ml-2">
        Download BAFT agreement and upload a signed copy
      </p>
      <div className="flex items-center gap-x-2 w-full mt-2">
        <div className="flex items-center justify-between gap-x-2 w-full border border-borderCol p-2 rounded-lg">
          <div className="flex items-center gap-x-2 ">
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
              <p className="text-lightGray">BAFT Agreement</p>
              <p className="text-sm text-[#92929D]">PDF, 1.4 MB</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-x-2 w-full border border-borderCol p-2 rounded-lg">
          <div className="flex items-center gap-x-2 ">
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
              <p className="text-lightGray">BAFT Agreement</p>
              <p className="text-sm text-[#92929D]">PDF, 1.4 MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
