import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ConfirmationModal } from "../ConfirmationModal";
import { formatAmount } from "@/utils";
import { formatFirstLetterOfWord } from "../helper";
import { useAuth } from "@/context/AuthProvider";
import { formatNumberByAddingDigitsToStart } from "../../../utils/helper/helper";
import { DatePicker } from "@/components/helpers";
import { toast } from "sonner";

interface BidPreviewProps {
  onBack: () => void;
  handleSubmit: (bidValidity: string) => void;
  userBidStatus: any;
  data: any;
  handleNewBid: () => void;
  bidNumber?: number | string;
  allBondsFilled: any;
  otherBond: any;
}

export const BidPreviewWithinCountry: React.FC<BidPreviewProps> = ({
  onBack,
  data,
  handleNewBid,
  allBondsFilled,
  formData,
  bidNumber,
  handleSubmit,
  bondPrices,
  availableBonds,
  bidValidityDate,
  userBidStatus,
}) => {
  const [selectedBidValidity, setSelectedBidValidity] = useState<Date>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleConfirmSubmit = () => {
    const bidData = {
      bidType: "LG Issuance within the country",
      bidValidity: selectedBidValidity || bidValidityDate,
      issueLg: {
        branchAddress: formData.issueLg.branchAddress,
        branchName: formData.issueLg.branchName,
        city: formData.issueLg.city || data?.lgIssueIn?.city,
      },
      collectLg: {
        branchAddress: formData.collectLg.branchAddress,
        branchName: formData.collectLg.branchName,
        city: formData.collectLg.city || data?.lgCollectIn?.city,
      },
      bids: availableBonds.map((bond) => ({
        bidType: bond.type,
        price: bondPrices[bond.type]
          ? parseInt(bondPrices[bond.type].replace("%", ""), 10)
          : 0, // Convert price to integer and
        bank: "",
        perAnnum: true,
      })),
    };
    handleSubmit(bidData);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1">
      <h2 className="text-xl font-semibold mb-4 gap-1 flex items-center justify-between">
        <div className="flex justify-between items-center w-full">
          {userBidStatus.status !== "Pending" &&
          userBidStatus.status !== "Accepted" &&
          userBidStatus.status !== "Rejected" &&
          userBidStatus.status !== "Not Accepted" &&
          userBidStatus.status !== "Not Applicable" ? (
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-1 p-1">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span>Preview Before Final Submission</span>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <p>Your Bid</p>
            </div>
          )}
        </div>
      </h2>

      <div className="border border-[#E2E2EA] p-4 rounded">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Bid Summary</h3>
          <div className="flex space-x-6">
            {bidNumber && (
              <div className="text-center">
                <p className="text-base font-normal">
                  {formatNumberByAddingDigitsToStart(bidNumber)}
                </p>
                <p className="text-base text-[#A1A1A8] font-light">
                  Bid Number
                </p>
              </div>
            )}
            {(bidValidityDate || selectedBidValidity) && (
              <div className="text-center">
                <p className="text-base font-normal">
                  {bidValidityDate ||
                    new Date(selectedBidValidity).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                </p>
                <p className="text-base text-[#A1A1A8] font-light">
                  Bid Validity
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto h-full pr-1 mb-2 flex-1">
          <div className="p-3 border border-[#E2E2EA] mb-2 rounded-md bg-[#F5F7F9]">
            {availableBonds.map((lgType: any) => {
              const bondPrice = bondPrices[lgType.type] || lgType?.price;
              return (
                <div
                  key={lgType.type}
                  className={`pb-2 mb-2 border-b-[1px] border-black border-opacity-20`}
                >
                  <p className="text-[14px] font-light">
                    {data?.otherBond?.Contract
                      ? `${data?.otherBond.name} - ${
                          data?.otherBond.currencyType
                        } ${formatAmount(data?.otherBond.cashMargin)}`
                      : `${lgType.type} - ${
                          lgType.value.currencyType
                        } ${formatAmount(lgType.value.cashMargin)}`}
                  </p>
                  <p className="text-[#5625F2] font-bold text-lg">
                    {`${bondPrice} `} {/* Display bond price */}
                    <span className="text-gray-600 font-normal text-[12px]">
                      Per Annum
                    </span>
                  </p>
                  <p className="text-[14px] text-[#696974] font-light">
                    Bid Pricing
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 border p-4 rounded-md bg-[#f6f7f9]">
          <h4 className="font-semibold">LG Issue Information</h4>
          <p className="text-[#5f5f5f]">
            Branch Name -{" "}
            <span className="text-[#5625f1] font-medium">
              {formData?.issueLg?.branchName || "-"}
            </span>
          </p>
          {formData?.issueLg.city && (
            <p className="text-[#5f5f5f]">
              City -{" "}
              <span className="text-[#5625f1] font-medium">
                {formatFirstLetterOfWord(formData?.issueLg?.city) || "-"}
              </span>
            </p>
          )}
          <p className="text-[#5f5f5f]">
            Branch Address -{" "}
            <span className="text-[#5625f1] font-medium">
              {formData?.issueLg?.branchAddress || "-"}
            </span>
          </p>
        </div>

        <div className="mt-4 border p-4 rounded-md bg-[#f6f7f9]">
          <h4 className="font-semibold">LG Collect Information</h4>
          <p className="text-[#5f5f5f]">
            Branch Name -{" "}
            <span className="text-[#5625f1] font-medium">
              {formData?.collectLg?.branchName || "-"}
            </span>
          </p>
          {formData?.collectLg.city && (
            <p className="text-[#5f5f5f]">
              City -{" "}
              <span className="text-[#5625f1] font-medium">
                {formatFirstLetterOfWord(formData?.collectLg?.city) || "-"}
              </span>
            </p>
          )}
          <p className="text-[#5f5f5f]">
            Branch Address -{" "}
            <span className="text-[#5625f1] font-medium">
              {formData?.collectLg?.branchAddress || "-"}
            </span>
          </p>
        </div>
        {userBidStatus.status !== "Pending" &&
          userBidStatus.status !== "Accepted" &&
          userBidStatus.status !== "Rejected" &&
          userBidStatus.status !== "Expired" &&
          userBidStatus.status !== "Not Accepted" &&
          userBidStatus.status !== "Not Applicable" && (
            <div className="w-full my-2">
              <label htmlFor="bidValidity" className="block font-semibold mb-2">
                Bid Validity
              </label>
              <DatePicker
                placeholder="Select Date"
                name="bidValidity"
                value={selectedBidValidity}
                setValue={setSelectedBidValidity}
                disabled={{
                  before: new Date(),
                  after: new Date(data?.lastDateOfReceivingBids),
                }}
                isLg={true}
                leftText={false}
              />
            </div>
          )}
        <div className="flex flex-col gap-2 mt-2.5">
          {["Pending", "Not Accepted", "Rejected", "Expired"].includes(
            userBidStatus.status
          ) ? (
            <div
              className={`text-center text-sm font-semibold text-black py-3 rounded-md ${
                userBidStatus.status === "Pending"
                  ? "bg-[#FEFBE8]"
                  : userBidStatus.status === "Rejected"
                  ? "bg-[#FAB4B4]"
                  : userBidStatus.status === "Expired"
                  ? "bg-[#F6F6F6]"
                  : userBidStatus.status === "Not Accepted"
                  ? "bg-[#FFE6E6]"
                  : ""
              }`}
            >
              {userBidStatus.label}
            </div>
          ) : userBidStatus.status === "Accepted" ? (
            <div
              className={`text-base text-[#A5A5A5] font-normal text-black py-1 rounded-md text-left justify-start`}
            >
              {userBidStatus.label}
            </div>
          ) : (
            <>
              <Button
                className="w-full mt-4 bg-[#44C894] text-white hover:bg-[#44C894]"
                onClick={() => {
                  if (!selectedBidValidity) {
                    toast.error("Please select bid validity date");
                    return;
                  }
                  setIsModalOpen(true);
                }}
              >
                Submit Bid
              </Button>
            </>
          )}
        </div>
      </div>
      {userBidStatus.status === "Rejected" && (
        <Button
          className="w-full mt-4 bg-[#5625F2] text-white hover:bg-[#44C894]"
          onClick={handleNewBid}
        >
          Submit another bid
        </Button>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};
