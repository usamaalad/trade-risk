"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Eye, ListFilter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IBids } from "@/types/type";
import { acceptOrRejectBid } from "@/services/apis/bids.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { convertDateAndTimeToStringGMTNoTsx } from "@/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import { convertDateAndTimeToStringGMT } from "@/utils/helper/dateAndTimeGMT";
import {
  formatFirstLetterOfWord,
  getLgBondTotal,
  LcLgInfo,
} from "../LG-Output/helper";
import {
  formatAmount,
  formatNumberByAddingDigitsToStart,
} from "../../utils/helper/helper";
import SharedLCDetails from "./SharedLCDetails";
import { getStatusStyles } from "./AddBid";
import { fetchSingleLc } from "@/services/apis/lcs.api";
import SharedRiskParticipationDetails from "./SharedRiskParticipationDetails";
import { RiskParticipationBidCard } from "./RiskParticipationBidCard";

export const RiskParticipationTableDialog = ({
  riskData: passedriskData,
  bids,
  isViewAll,
  buttonTitle,
  id,
  myBidsPage = false,
}: {
  riskData: any;
  bids: IBids[];
  isBank?: boolean;
  buttonTitle?: string;
  isViewAll?: boolean;
  id?: string;
  myBidsPage?: boolean;
}) => {
  const { data: riskData = passedriskData, isLoading } = useQuery({
    queryKey: [`single-lc`, id],
    queryFn: () => fetchSingleLc(id),
    enabled: myBidsPage && !!id && !passedriskData,
  });

  const sortedBids = (bidsArray: IBids[]) => {
    return bidsArray?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getMatchingBids = () => {
    if (
      myBidsPage &&
      riskData &&
      riskData.bids &&
      riskData.bids.length > 0 &&
      bids
    ) {
      return riskData.bids.filter((lcBid: any) => lcBid._id === bids._id);
    }
    return [];
  };

  const matchedBids = getMatchingBids();

  return (
    <Dialog>
      {myBidsPage ? (
        <DialogTrigger
          style={getStatusStyles(bids.status)}
          className="rounded-md w-full h-10"
        >
          {bids.status}
        </DialogTrigger>
      ) : (
        <DialogTrigger
          className={`${
            isViewAll
              ? "font-roboto text-sm font-light text-primaryCol underline"
              : `center w-full rounded-md border px-1.5 py-2 ${
                  buttonTitle === "Accept" || buttonTitle === "Reject"
                    ? "bg-[#2F3031] px-7 text-white"
                    : null
                } `
          }`}
        >
          {isViewAll ? (
            <p>View all</p>
          ) : buttonTitle ? (
            <p> {buttonTitle}</p>
          ) : (
            <Eye className="size-5" />
          )}
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
          <div className="flex h-full w-full flex-col justify-start px-5">
            {/* Filter Section */}
            <div className="flex w-full items-center justify-between pt-5">
              <div className="flex items-center gap-x-2">
                <p className="rounded-xl bg-primaryCol px-3 py-1 text-lg font-semibold text-white">
                  {riskData?.bids?.length || matchedBids.length || 0}
                </p>
                <p className="text-xl font-semibold">{"Bids received"}</p>
              </div>
            </div>
            {/* Bids */}
            <div className="mt-5 flex max-h-[90vh] flex-col gap-y-4 overflow-y-auto overflow-x-hidden pb-5">
              {myBidsPage
                ? matchedBids?.map((bid) => (
                    <RiskParticipationBidCard
                      data={bid}
                      key={bid._id}
                      riskOwner={riskData.user}
                    />
                  ))
                : riskData &&
                  riskData.bids &&
                  riskData.bids.length > 0 &&
                  sortedBids(riskData.bids).map((data: IBids) => (
                    <RiskParticipationBidCard
                      data={data}
                      riskOwner={riskData.user}
                      key={data._id}
                    />
                  ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
