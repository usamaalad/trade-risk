"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowUpNarrowWide, Eye, ListFilter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IBids, ILcs } from "@/types/type";
import { acceptOrRejectBid } from "@/services/apis/bids.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { convertDateToYYYYMMDD } from "@/utils";
import { toast } from "sonner";
import { fetchSingleLc } from "@/services/apis/lcs.api";

const BidCard = ({ data }: { data: IBids }) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: acceptOrRejectBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`fetch-lcs`] });
    },
  });

  const handleSubmit = async (status: string, id: string) => {
    const { success, response } = await mutateAsync({ status, id });
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
        <div>
          <p className="text-sm text-para mb-1">Bid Number</p>
          <p className="font-semibold text-lg">{data._id.slice(1, 6)}</p>
        </div>

        <div>
          <p className="capitalize text-lg font-semibold mb-1">
            {data.userInfo?.name || ""}
          </p>
          <p className="capitalize text-sm text-para">
            {data.userInfo?.country || ""}
          </p>
        </div>

        <div>
          <p className="text-sm text-para mb-1">Confirmation Rate</p>
          <p className="text-lg font-semibold text-text">
            {data.confirmationPrice}% per annum
          </p>
        </div>

        <div>
          <p className="text-sm text-para mb-1">Discount Rate</p>
          <p className="text-lg font-semibold ">
            {data.bidType.includes("Discounting")
              ? data.discountBaseRate || "Applicable"
              : "Not Applicable"}
          </p>
        </div>

        <div>
          <p className="text-sm text-para mb-1">Discount Margin</p>
          <p className="text-lg font-semibold ">
            {data.bidType.includes("Discounting")
              ? data.discountMargin || "Applicable"
              : "Not Applicable"}
          </p>
        </div>

        <div>
          <p className="text-sm text-para mb-1">Minimum Charges</p>
          <p className="text-lg font-semibold text-text">AED 30,000.00</p>
        </div>

        <div>
          <p className="text-sm text-para mb-1">Bid Recieved</p>
          <p className="font-semibold text-lg">
            {convertDateToYYYYMMDD(data.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-sm text-para mb-1">Bid Expiry</p>
          <p className="font-semibold text-lg">
            {convertDateToYYYYMMDD(data.bidValidity)}
          </p>
        </div>
        {data.status === "Pending" && (
          <>
            <DialogClose id="close-button" className="hidden"></DialogClose>
            <Button
              size="lg"
              className="mt-2 bg-[#29C084] hover:bg-[#29C084]/90"
              onClick={() => handleSubmit("Accepted", data._id)}
              disabled={isPending}
            >
              Accept
            </Button>
            <Button
              size="lg"
              className="mt-2 text-para"
              variant="ghost"
              onClick={() => handleSubmit("Rejected", data._id)}
              disabled={isPending}
            >
              Reject
            </Button>
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

const LCInfo = ({
  label,
  value,
  noBorder,
}: {
  label: string;
  value: string;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={`flex items-start justify-between py-2 ${
        !noBorder && "border-b border-b-borderCol"
      }`}
    >
      <p className="text-para text-sm">{label}</p>
      <p className="capitalize font-semibold text-right text-sm max-w-[60%]">
        {value}
      </p>
    </div>
  );
};

export const TableDialog = ({
  lcId,
  bids,
}: {
  lcId: string;
  bids: IBids[];
}) => {
  // Get LC
  const { data: lcData, isLoading } = useQuery({
    queryKey: [`single-lc`, lcId],
    queryFn: () => fetchSingleLc(lcId),
  });

  return (
    <Dialog>
      <DialogTrigger className="center border border-borderCol rounded-md w-full px-1 py-2">
        <Eye className="size-5" />
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl p-0 !max-h-[85vh] h-full">
        <div className="flex items-center justify-between border-b border-b-borderCol px-7 !py-5 max-h-20">
          <h2 className="text-lg font-semibold">{lcData && lcData.lcType}</h2>
          <DialogClose>
            <X className="size-7" />
          </DialogClose>
        </div>

        <div className="overflow-y-hidden relative -mt-4 flex items-start justify-between h-full">
          {/* Left Section */}
          <div className="w-full  pb-5 border-r-2 border-r-borderCol h-full overflow-y-auto max-h-[75vh]">
            <div className="px-4 pt-5 bg-[#F5F7F9]">
              <h2 className="text-2xl font-semibold mb-1">
                <span className="text-para font-medium">LC Amount:</span> USD{" "}
                {(lcData && lcData.amount.toLocaleString()) || ""}
              </h2>
              <p className="text-sm text-para">
                Created at,{" "}
                {lcData && convertDateToYYYYMMDD(lcData.lcPeriod?.startDate)},
                by{" "}
                <span className="text-text capitalize">
                  {(lcData && lcData.exporterInfo?.beneficiaryName) || ""}
                </span>
              </p>

              <div className="h-[2px] w-full bg-neutral-800 mt-5" />
            </div>
            {/* Main Info */}
            <div className="px-4  bg-[#F5F7F9]">
              <LCInfo
                label="LC Issuing Bank"
                value={(lcData && lcData.issuingBank?.bank) || ""}
              />
              <LCInfo
                label="LC Applicant"
                value={(lcData && lcData.importerInfo?.applicantName) || ""}
              />
              <LCInfo
                label="Advising Bank"
                value={(lcData && lcData.advisingBank?.bank) || ""}
              />
              <LCInfo
                label="Confirming Bank"
                value={(lcData && lcData.confirmingBank?.bank) || ""}
              />
              <LCInfo
                label="Payments Terms"
                value={(lcData && lcData.paymentTerms) || ""}
                noBorder
              />
            </div>
            {/* Separator */}
            <div className="h-[2px] w-full bg-borderCol mt- 5" />
            {/* LC Details */}
            <div className="px-4 mt-4">
              <h2 className="text-xl font-semibold">LC Details</h2>
              <LCInfo
                label="LC Issuance (Expected)"
                value={
                  lcData && convertDateToYYYYMMDD(lcData.lcPeriod?.startDate)
                }
              />
              <LCInfo
                label="LC Expiry Date"
                value={
                  lcData && convertDateToYYYYMMDD(lcData.lcPeriod?.endDate)
                }
              />
              <LCInfo
                label="Transhipment"
                value={
                  lcData && lcData.transhipment === true
                    ? "Allowed"
                    : "Not allowed"
                }
              />
              <LCInfo
                label="Port of Shipment"
                value={(lcData && lcData.shipmentPort?.port) || ""}
                noBorder
              />

              <h2 className="text-xl font-semibold mt-3">Exporter Info</h2>
              <LCInfo
                label="Beneficiary"
                value={(lcData && lcData.exporterInfo?.beneficiaryName) || ""}
              />
              <LCInfo
                label="Country"
                value={(lcData && lcData.exporterInfo?.countryOfExport) || ""}
              />
              <LCInfo
                label="Charges on account of"
                value="Beneficiary"
                noBorder
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full h-full flex flex-col justify-start px-5">
            {/* Filter Section */}
            <div className="flex items-center justify-between w-full pt-5">
              <div className="flex items-center gap-x-2">
                <p className="bg-primaryCol text-white font-semibold text-lg rounded-xl py-1 px-3">
                  {bids.length}
                </p>
                <p className="text-xl font-semibold">Bids recieved</p>
              </div>

              <div className="flex items-center gap-x-4">
                <div className="flex items-center gap-x-1">
                  <ArrowUpNarrowWide />
                  <p>Sort</p>
                </div>
                <div className="flex items-center gap-x-1">
                  <ListFilter />
                  <p>Filter</p>
                </div>
              </div>
            </div>
            {/* Bids */}
            <div className="flex flex-col gap-y-4 max-h-[65vh] overflow-y-auto overflow-x-hidden mt-5">
              {bids &&
                bids.length > 0 &&
                bids.map((data: any) => <BidCard data={data} key={data._id} />)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
