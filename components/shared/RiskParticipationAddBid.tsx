"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Eye, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IBids, ILcs } from "@/types/type";
import { useAuth } from "@/context/AuthProvider";
import { convertDateAndTimeToStringGMT } from "@/utils/helper/dateAndTimeGMT";
import {
  convertDateAndTimeToStringGMTNoTsx,
  formatAmount,
} from "../../utils/helper/helper";
import SharedRiskParticipationDetails from "./SharedRiskParticipationDetails";
import { RiskParticipationBidForm } from "./RiskParticipationBidForm";
import { RiskParticipationBidCard } from "./RiskParticipationBidCard";
import { formatFirstLetterOfWord } from "../LG-Output/helper";

export const getStatusStyles = (status: string) => {
  switch (status) {
    case "Add Bid":
      return {
        backgroundColor: "blue",
        color: "white",
      };
    case "Rejected":
      return {
        backgroundColor: "#FF020229",
        color: "red",
      };
    case "Pending":
      return {
        backgroundColor: "rgba(242, 153, 74, 0.2)",
        color: "orange",
      };
    case "Accepted":
      return {
        backgroundColor: "rgba(41, 192, 132, 0.2)",
        color: "rgba(41, 192, 132, 1)",
      };
    case "Expired":
      return {
        backgroundColor: "rgba(151, 151, 151, 0.32)",
        color: "rgba(126, 126, 126, 1)",
      };
    case "Not Applicable":
      return {
        backgroundColor: "black",
        color: "white",
      };
    default:
      return {};
  }
};

export const RiskParticipationAddBid = ({
  isEyeIcon = false,
  riskData,
}: {
  isEyeIcon?: boolean;
  bidData?: any;
  riskData: ILcs;
}) => {
  const { user } = useAuth();
  const isDiscount = riskData?.type?.includes("Discount");
  const [showPreview, setShowPreview] = useState(false);
  const [userBidStatus, setUserBidStatus] = useState<any>({});
  const [userBids, setUserBids] = useState();

  const bidDeadline = new Date(riskData?.lastDateOfReceivingBids);
  const isExpired = new Date() > bidDeadline;

  const handleFormSubmitSuccess = () => {
    setShowPreview(false);
  };

  useEffect(() => {
    const userBids =
      riskData?.bids
        ?.filter((bid: any) => bid.user === user?._id)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) || [];

    const mostRecentBid = userBids.length > 0 ? userBids[0] : null;
    setUserBids(userBids);
    if (userBids.length > 0) {
      setShowPreview(true);
    }

    const anotherBankBidAccepted = riskData?.bids?.some(
      (bid: any) => bid.status === "Accepted" && bid.user !== user?._id
    );

    if (mostRecentBid && anotherBankBidAccepted) {
      setUserBidStatus({
        label: "Another Bank Bid Accepted",
        status: "Not Accepted",
      });
    } else if (!mostRecentBid && anotherBankBidAccepted) {
      setUserBidStatus({
        label: "Bid Not Applicable",
        status: "Not Applicable",
      });
    } else if (mostRecentBid) {
      if (mostRecentBid.status === "Pending") {
        setUserBidStatus({
          label: `Bid Submitted on ${convertDateAndTimeToStringGMTNoTsx(
            mostRecentBid.createdAt
          )}`,
          status: "Pending",
        });
      } else if (mostRecentBid.status === "Accepted") {
        setUserBidStatus({
          label: "Bid Accepted",
          status: "Accepted",
        });
      } else if (mostRecentBid.status === "Rejected") {
        setUserBidStatus({
          label: "Bid Rejected",
          status: "Rejected",
        });
      } else if (new Date(mostRecentBid.bidValidity) < new Date()) {
        setUserBidStatus({
          label: "Bid Expired",
          status: "Expired",
        });
      }
    }
  }, [riskData?.bids, user?._id]);

  const computedStatus = isExpired
    ? "Expired"
    : userBidStatus.status
    ? userBidStatus.status
    : "Add Bid";

  return (
    <Dialog>
      {isEyeIcon ? (
        <DialogTrigger
          className={`center border rounded-md w-full px-1.5 py-2`}
        >
          <Eye className="size-5" color="black" />
        </DialogTrigger>
      ) : (
        <DialogTrigger
          style={getStatusStyles(computedStatus)}
          className="rounded-md w-full h-10"
        >
          {computedStatus}
        </DialogTrigger>
      )}
      <DialogContent className="h-full !max-h-[95vh] w-full max-w-6xl !p-0 flex flex-col">
        <div className="flex items-center justify-between border-b border-b-borderCol px-7 !py-5 max-h-20">
          <div className="flex flex-col items-center w-1/2">
            <h2 className="text-2xl font-semibold text-center">
              Risk Participation - LC Confirmation Request
            </h2>
          </div>
          <DialogClose>
            <X className="size-7" />
          </DialogClose>
        </div>
        {
          <div className="overflow-y-hidden relative mt-0 flex items-start justify-between h-full">
            {/* Left Section */}
            <div className="w-full border-r-2 border-r-borderCol h-full overflow-y-auto max-h-[95vh]">
              <>
                <div className="pt-5 px-4 bg-bg">
                  <h2 className="text-2xl font-semibold mb-1">
                    <span className="text-para font-medium">
                      Risk Participation offered:
                    </span>{" "}
                    {riskData?.riskParticipationTransaction.currency || "USD"}{" "}
                    {formatAmount(
                      riskData?.riskParticipationTransaction.participationValue
                    )}
                  </h2>
                  <h2 className="text-lg font-medium text-[#515151] mb-1">
                    <span className="text-para font-normal">
                      LC Issuing Bank:
                    </span>{" "}
                    {formatFirstLetterOfWord(riskData?.issuingBank.bank)},{" "}
                    {formatFirstLetterOfWord(riskData?.issuingBank.country)}
                  </h2>
                  <p className="font-roboto text-sm text-para">
                    Created at,{" "}
                    {riskData &&
                      convertDateAndTimeToStringGMT({
                        date: riskData.createdAt,
                      })}
                    , by{" "}
                    <span className="capitalize text-text">
                      {riskData && riskData.exporterInfo?.name}
                    </span>
                  </p>
                  <div className="h-[2px] w-full bg-neutral-800 mt-5" />
                </div>
                <SharedRiskParticipationDetails riskData={riskData} />
              </>
            </div>

            {/* Right Section */}
            {isExpired ? (
              <div className="w-full h-full flex justify-center items-center px-5 overflow-y-auto max-h-[95vh]">
                <p className="text-xl font-medium">
                  This LC is not accepting bids at the moment
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-start px-5 overflow-y-auto max-h-[95vh]">
                <p className="text-xl font-semibold pt-5">
                  {computedStatus == "Add bid" || !showPreview
                    ? "Submit Your Bid"
                    : "View Bids"}
                </p>
                {showPreview ? (
                  <>
                    {userBids && userBids.length > 0 ? (
                      userBids.map((bid: IBids, index: number) => (
                        <RiskParticipationBidCard
                          data={bid}
                          key={bid._id}
                          riskOwner={riskData.user}
                          setShowPreview={setShowPreview}
                        />
                      ))
                    ) : (
                      <p>No bids found for the logged-in user.</p>
                    )}
                  </>
                ) : (
                  <RiskParticipationBidForm
                    riskData={riskData}
                    isDiscount={isDiscount}
                    onSubmitSuccess={handleFormSubmitSuccess}
                  />
                )}
              </div>
            )}
          </div>
        }
      </DialogContent>
    </Dialog>
  );
};
