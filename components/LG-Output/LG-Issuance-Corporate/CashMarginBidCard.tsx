import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "../ConfirmationModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { respondBid } from "@/services/apis/lg.apis";
import { convertDateAndTimeToString } from "@/utils";
import { formatFirstLetterOfWord } from "../helper";

export const CashMarginBidCard = ({
  bidDetail,
  refId,
}: {
  bidDetail: any;
  refId: string;
}) => {
  const queryClient = useQueryClient();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [statusToSubmit, setStatusToSubmit] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      requestData,
      status,
    }: {
      requestData: any;
      status: string;
    }) => respondBid(requestData, status),
    onSuccess: (data) => {
      console.log("API Response:", data);
      queryClient.invalidateQueries({
        queryKey: ["bid-status"],
      });
      queryClient.invalidateQueries(["fetch-lcs"]);
    },
    onError: (error) => {
      console.error("Error updating bid status:", error);
    },
  });

  const handleOpenModal = (status: string) => {
    setStatusToSubmit(status);
    setIsConfirmationOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (statusToSubmit) {
      const requestData = {
        id: bidDetail._id,
      };
      mutation.mutate({ requestData, status: statusToSubmit });
    }
    setIsConfirmationOpen(false); // Close the modal after confirming
  };

  return (
    <div className={`border border-borderCol rounded-lg mt-4`}>
      <div className="border-b-2 border-[#979797] py-3 px-3">
        <div className="grid grid-cols-2">
          <div>
            <p className="text-[#92929D] text-sm">Bid Number</p>
            <p className="font-semibold text-xl">{bidDetail.bidNumber}</p>
          </div>
          <div>
            <p className="text-[#92929D] text-sm">Submitted By</p>
            <p className="font-semibold text-xl">{bidDetail.bidBy.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 mt-4">
          <div className="text-start">
            <p className="text-[#92929D] text-sm">Bid Pricing</p>
            <p className="font-semibold text-xl text-[#0062FF]">
              {bidDetail.confirmationPrice}% per annum
            </p>
          </div>
          <div>
            <p className="text-[#92929D] text-sm">Country</p>
            <p className="font-semibold text-xl">
              {formatFirstLetterOfWord(bidDetail.bidBy.country)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 mt-4">
          <div className="text-start">
            <p className="text-[#92929D] text-sm">Bid Received</p>
            <p className="font-semibold text-xl">
              {convertDateAndTimeToString(bidDetail?.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[#92929D] text-sm">Bid Expiry</p>
            <p className="font-semibold text-xl">
              {convertDateAndTimeToString(bidDetail?.bidValidity)}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-[17px]">
          Please visit the following branch to issue this guarantee.
        </p>
        <p className="text-[17px] text-black">
          If you accept our bid, you will need for:
        </p>
        <p className="text-[17px] mt-5">
          For "LG Issuance", please visit{" "}
          <span className="font-semibold text-[#007AFF]">
            {bidDetail?.issueLg?.branchAddress}
          </span>
          , with your reference number{" "}
          <span className="font-semibold text-[#007AFF]">{refId}</span>. For
          further details or inquiries, you may also contact us via email at{" "}
          <span className="font-semibold text-[#007AFF]">
            {bidDetail?.issueLg?.email}
          </span>
          .
        </p>
        <p className="text-[17px] mt-5">
          For "LG Collection", please visit{" "}
          <span className="font-semibold text-[#007AFF]">
            {bidDetail?.collectLg?.branchAddress}
          </span>
          , with your reference number{" "}
          <span className="font-semibold text-[#007AFF]">{refId}</span>. For
          further details or inquiries, you may also contact us via email at{" "}
          <span className="font-semibold text-[#007AFF]">
            {bidDetail?.collectLg?.email}
          </span>
          .
        </p>
      </div>
      {bidDetail.status === "Expired" ? (
        <div className="pt-0 px-2 pb-2">
          <Button className="bg-[#e2e2ea] hover:bg-[#acacac] w-full">
            Bid Expired
          </Button>
        </div>
      ) : bidDetail.status === "Accepted" ? (
        <div className="pt-0 px-2 pb-2">
          <Button className="bg-[#54cd9c] hover:bg-[#54cd9c] w-full text-white">
            Bid Accepted
          </Button>
        </div>
      ) : bidDetail.status === "Rejected" ? (
        <div className="pt-0 px-2 pb-2">
          <Button className="bg-[#ffdddc] hover:bg-[#ffdddc] w-full text-[#696974]">
            Bid Rejected
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-0 px-2 pb-2">
          <Button
            onClick={() => handleOpenModal("Accepted")}
            className="bg-[#29C084] hover:bg-[#29C084]"
          >
            Accept
          </Button>
          <Button
            className="bg-[#F1F1F5] text-black hover:bg-[#F1F1F5]"
            onClick={() => handleOpenModal("Rejected")}
          >
            Reject
          </Button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsConfirmationOpen(false)}
      />
    </div>
  );
};
