import { acceptOrRejectBid } from "@/services/apis/bids.api";
import { IBids } from "@/types/type";
import {
  convertDateToYYYYMMDD,
  formatNumberByAddingDigitsToStart,
} from "@/utils/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";

export const BidCard = ({
  data,
  isBank,
  isRisk,
}: {
  data: IBids;
  isBank?: boolean;
  isRisk?: boolean;
}) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: acceptOrRejectBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid-status"] });
      // queryClient.invalidateQueries({
      //   queryKey: ["bid-status"],
      // });
    },
  });

  const handleSubmit = async (status: string, id: string) => {
    const { success, response } = await mutateAsync({
      status,
      id,
      key: isRisk ? "risk" : "lc",
    });
    if (!success) return toast.error(response as string);
    else {
      let closeBtn = document.getElementById("close-button");
      // @ts-ignore
      closeBtn.click();
      toast.success(`Bid ${status}`);
    }
  };

  return (
    <div className="border border-borderCol py-5 px-3 rounded-lg">
      <div className="grid grid-cols-2 gap-y-4">
        <div className={data.status === "Expired" ? "opacity-50" : ""}>
          <p className="text-sm text-para mb-1">Bid Number</p>
          <p className="font-semibold text-lg">
            {formatNumberByAddingDigitsToStart(data.bidNumber)}
          </p>
        </div>

        <div className={data.status === "Expired" ? "opacity-50" : ""}>
          <p className="capitalize text-lg font-semibold mb-1">
            {data.userInfo?.name || ""}
          </p>
          <p className="capitalize text-sm text-para">
            {data.userInfo?.country || ""}
          </p>
        </div>

        <div className={data.status === "Expired" ? "opacity-50" : ""}>
          <p className="text-sm text-para mb-1">Confirmation Rate</p>
          <p className="text-lg font-semibold text-text">
            {data.amount || 0}% per annum
          </p>
        </div>

        {data?.discountMargin !== undefined &&
          data?.discountMargin !== null && (
            <div className={data.status === "Expired" ? "opacity-50" : ""}>
              <p className="mb-1 text-sm text-para">Discount Spread</p>
              <p className="text-lg font-semibold">{data.discountMargin}%</p>
            </div>
          )}

        <div className={data.status === "Expired" ? "opacity-50" : ""}>
          <p className="text-sm text-para mb-1">Bid Received</p>
          <p className="font-semibold text-lg">
            {convertDateToYYYYMMDD(data.createdAt)}
          </p>
        </div>

        <div className={data.status === "Expired" ? "opacity-50" : ""}>
          <p className="text-sm text-para mb-1">Bid Expiry</p>
          <p className="font-semibold text-lg text-[#A10909]">
            {convertDateToYYYYMMDD(data.bidValidity)}
          </p>
        </div>
        {data.status === "Pending" && !isBank && (
          <>
            <DialogClose id="close-button" className="hidden"></DialogClose>
            <div className="col-span-2 flex gap-4 mt-2">
              <Button
                size="lg"
                className="bg-[#29C084] hover:bg-[#29C084]/90 flex-1"
                onClick={() => handleSubmit("Accepted", data._id)}
                disabled={isPending}
              >
                Accept
              </Button>
              <Button
                size="lg"
                className="text-para flex-1"
                variant="ghost"
                onClick={() => handleSubmit("Rejected", data._id)}
                disabled={isPending}
              >
                Reject
              </Button>
            </div>
          </>
        )}
      </div>

      {data.status !== "Pending" && (
        <Button
          className={`${
            data.status === "Accepted"
              ? "bg-[#29C08433] hover:bg-[#29C08433]"
              : data.status === "Rejected"
              ? "bg-[#FF02021A] hover:bg-[#FF02021A]"
              : data.status === "Expired"
              ? "bg-[#97979733] hover:bg-[#97979733]"
              : data.status === "Submitted"
              ? "bg-[#F4D0131A] hover:bg-[#F4D0131A]"
              : ""
          } mt-2 text-black w-full cursor-default`}
        >
          {data.status === "Accepted"
            ? "Bid Accepted"
            : data.status === "Rejected"
            ? "Bid Rejected"
            : data.status === "Expired"
            ? "Request Expired"
            : data.status === "Submitted"
            ? "Bid Submitted"
            : ""}
        </Button>
      )}
    </div>
  );
};
