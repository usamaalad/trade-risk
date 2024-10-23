import { useAuth } from "@/context/AuthProvider";
import {
  acceptOrRejectBid,
  riskAcceptRejectBid,
} from "@/services/apis/bids.api";
import { IBids } from "@/types/type";
import {
  formatNumberByAddingDigitsToStart,
  convertDateAndTimeToStringGMTNoTsx,
} from "@/utils";
import { convertDateAndTimeToStringGMT } from "@/utils/helper/dateAndTimeGMT";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatFirstLetterOfWord } from "../LG-Output/helper";
import { Button } from "../ui/button";

export const RiskParticipationBidCard = ({
  data,
  riskOwner,
  setShowPreview,
}: {
  data: IBids;
  riskOwner: string;
  setShowPreview?: (value: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: riskAcceptRejectBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid-status"] });
    },
  });

  const isExpired = new Date(data.bidValidity) < new Date();

  const handleSubmit = async (status: string, id: string) => {
    const { success, response } = await mutateAsync({
      status,
      id,
    });
    if (!success) return toast.error(response as string);
    else {
      toast.success(`Bid ${status}`);
    }
  };

  return (
    <div
      className={`rounded-lg border border-borderCol px-3 py-5 ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      <div className="grid grid-cols-2 gap-y-4">
        <div>
          <p className="mb-1 text-sm text-para">Bid Number</p>
          <p className="text-lg font-semibold">
            {formatNumberByAddingDigitsToStart(data.bidNumber)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm capitalize text-para">Submitted by</p>
          <p className="text-lg font-semibold capitalize">
            {formatFirstLetterOfWord(data.business?.name) || ""}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-para ">Pricing</p>
          <p className="text-lg font-semibold capitalize">
            {data.price}% per annum
          </p>
          <p className="text-[#808080] text-base">
            {data.isCounterOffer ? "Counter Offer" : "Offered pricing accepted"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-para ">Country</p>
          <p className="text-lg font-semibold capitalize">
            {data.business.country}
          </p>
        </div>
        {data.status === "Pending" && data.user !== user?._id && (
          <div>
            <p className="mb-1 text-sm text-para">Bid Created</p>
            <p className="text-lg font-semibold">
              {convertDateAndTimeToStringGMT({
                date: data.createdAt,
                sameLine: false,
              })}
            </p>
          </div>
        )}
        <div>
          <p className="mb-1 text-sm text-para">Bid Expiry</p>
          <p className="text-lg font-semibold">
            {convertDateAndTimeToStringGMT({
              date: data.bidValidity,
              sameLine: false,
            })}
          </p>
        </div>
        {data.status === "Pending" && riskOwner === user?._id && (
          <>
            {isExpired ? (
              // Show Bid Expired div if the bid is expired
              <div className="col-span-2 mt-2 flex justify-center items-center bg-black text-white rounded-lg py-2">
                Bid Expired
              </div>
            ) : (
              // Show Accept and Reject buttons if the bid is not expired
              <div className="col-span-2 mt-2 flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 bg-[#29C084] hover:bg-[#29C084]/90"
                  onClick={() => handleSubmit("Accepted", data._id)}
                  disabled={isPending}
                >
                  Accept
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-[#f4f7fa] text-para"
                  variant="ghost"
                  onClick={() => handleSubmit("Rejected", data._id)}
                  disabled={isPending}
                >
                  Reject
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {(data.status !== "Pending" ||
        (data.status === "Pending" && data.user === user?._id)) && (
        <div
          className={`${
            data.status === "Accepted"
              ? "bg-[#29C08433] hover:bg-[#29C08433]"
              : data.status === "Rejected"
              ? "bg-[#FF02021A] hover:bg-[#FF02021A]"
              : "bg-[#F4D0131A] hover:bg-[#F4D0131A]"
          } mt-2 w-full cursor-default text-black font-medium text-center py-3 rounded-xl`}
        >
          {data.status === "Accepted"
            ? "Bid Accepted"
            : data.status === "Rejected"
            ? "Bid Rejected"
            : data.status === "Pending"
            ? `Bid Submitted on ${convertDateAndTimeToStringGMTNoTsx(
                data.createdAt
              )}`
            : ""}
        </div>
      )}
      {data.status === "Rejected" && data.user === user?._id && (
        <Button
          className="bg-[#5625F2] text-white hover:bg-[#5625F2] mt-5"
          onClick={() => setShowPreview(false)}
        >
          Submit A New Bid
        </Button>
      )}
    </div>
  );
};
