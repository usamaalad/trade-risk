"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker, Loader } from "../helpers";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { convertDateToYYYYMMDD } from "@/utils";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { addBidTypes } from "@/validation/bids.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBid, fetchSingleBid } from "@/services/apis/bids.api";
import { toast } from "sonner";
import { ChangeEvent, useCallback, useState } from "react";
import { fetchSingleLc } from "@/services/apis/lcs.api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ValidatingCalendar } from "../LCSteps/Step3Helpers";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
      <p className="font-semibold text-right text-sm max-w-[60%]">{value}</p>
    </div>
  );
};

export const AddBid = ({
  isDiscount,
  isInfo,
  status,
  triggerTitle,
  border,
  lcId,
}: {
  isDiscount?: boolean;
  isInfo?: boolean;
  status?: string;
  triggerTitle: string;
  border?: boolean;
  lcId: string;
}) => {
  const queryClient = useQueryClient();
  const [discountBaseRate, setDiscountBaseRate] = useState("");
  const [discountMargin, setDiscountMargin] = useState("");

  // Get LC
  const { data: lcData, isLoading } = useQuery({
    queryKey: [`single-lc-${lcId}`],
    queryFn: () => fetchSingleLc(lcId),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: addBid,
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof addBidTypes>>({
    resolver: zodResolver(addBidTypes),
  });

  const onSubmit: SubmitHandler<z.infer<typeof addBidTypes>> = async (
    data: z.infer<typeof addBidTypes>
  ) => {
    if (isDiscount && !discountBaseRate)
      return toast.error("Please provide discount base rate");
    if (isDiscount && !discountMargin)
      return toast.error("Please provide discount margin");

    const { success, response } = await mutateAsync({
      confirmationPrice: data.confirmationPrice,
      lc: lcData._id,
      type: lcData.lcType!,
      validity: new Date(),
      ...(isDiscount && {
        discountMargin: discountMargin,
        discountBaseRate: discountBaseRate,
      }),
      // ...(isDiscount && {
      //   discountingPrice: (
      //     Number(discountBaseRate) + Number(discountMargin)
      //   ).toString(),
      // }),
      // discountingPrice: 10,
    });

    if (!success) return toast.error("Something went wrong");
    else {
      queryClient.invalidateQueries({
        queryKey: [`bid-status`, "fetch-lcs", response._id],
      });
      let closeBtn = document.getElementById("submit-button-close");
      // @ts-ignore
      closeBtn.click();
      toast.success("Bid added");
    }
  };

  // const { isLoading: isInfoLoading, data } = useQuery({
  //   queryKey: ["single-bid-", id],
  //   queryFn: () => fetchSingleBid(id),
  // });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [validityDate, setValidityDate] = useState();

  // useCallback(() => {

  // })
  return (
    <Dialog>
      <DialogTrigger
        className={`${
          status === "Rejected"
            ? `bg-[#FF020229] hover:bg-[#FF020229] text-[#D20000] hover:text-[#D20000] ${
                border && "border border-[#D20000]"
              }`
            : status === "Accepted"
            ? `bg-[#29C08433] hover:bg-[#29C08433] text-[#29C084] hover:text-[#29C084] ${
                border && "border border-[#29C084]"
              }`
            : status === "Expired"
            ? `bg-[#97979752] hover:bg-[#97979752] text-[#7E7E7E] hover:text-[#7E7E7E] ${
                border && "border border-[#7E7E7E] bg-transparent"
              }`
            : status === "Add bid"
            ? "bg-primaryCol hover:bg-primaryCol text-white hover:text-white"
            : "px-3 mt-2 bg-[#1A1A26] hover:bg-[#1A1A26]/90 text-white"
        } rounded-md w-full p-2 capitalize hover:opacity-85`}
      >
        {triggerTitle || "Pending"}
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl p-0 !max-h-[85vh] h-full">
        <div className="flex items-center justify-between border-b border-b-borderCol px-7 !py-5 max-h-20">
          <h2 className="text-lg font-semibold">{lcData?.lcType || ""}</h2>
          <DialogClose>
            <X className="size-7" />
          </DialogClose>
        </div>

        <div className="overflow-y-hidden relative -mt-4 flex items-start justify-between h-full">
          {/* Left Section */}
          <div className="w-full py-5 border-r-2 border-r-borderCol h-full overflow-y-auto max-h-[75vh]">
            {isLoading ? (
              <div className="w-full h-full center">
                <Loader />
              </div>
            ) : (
              <>
                <div className="px-4">
                  <h2 className="text-2xl font-semibold mb-1">
                    <span className="text-para font-medium">LC Amount:</span>{" "}
                    USD
                    {lcData?.amount || ""}
                  </h2>
                  <div className="h-[2px] w-full bg-neutral-800 mt-5" />
                </div>
                {/* Main Info */}
                <div className="px-4">
                  <LCInfo
                    label="LC Issuing Bank"
                    value={lcData?.issuingBank?.bank || ""}
                  />
                  <LCInfo
                    label="Country of LC Issuing Bank"
                    value={lcData?.issuingBank?.country || ""}
                  />
                  <LCInfo
                    label="LC Applicant"
                    value={lcData?.importerInfo?.applicantName || ""}
                  />
                  <LCInfo
                    label="LC Advising Bank"
                    value={lcData?.advisingBank?.bank || ""}
                  />
                  <LCInfo
                    label="Confirming Bank"
                    value={lcData?.confirmingBank?.bank || ""}
                  />
                  <LCInfo
                    label="Payments Terms"
                    value={lcData?.paymentTerms || ""}
                    noBorder
                  />
                  <div className="border border-borderCol p-2 flex items-center justify-between w-full gap-x-2 rounded-lg">
                    <div className="flex items-center gap-x-2">
                      <Button
                        type="button"
                        className="block bg-red-200 p-1 hover:bg-red-300"
                      >
                        <Image
                          src="/images/pdf.png"
                          alt="pdf"
                          width={500}
                          height={500}
                          className="size-8"
                        />
                      </Button>
                      <div>
                        <p className="text-sm">LC-12390</p>
                        <p className="text-para text-[12px]">PDF, 1.4 MB</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium cursor-pointer underline">
                      View attachments
                    </p>
                  </div>
                </div>
                {/* Separator */}
                <div className="h-[2px] w-full bg-borderCol mt-5" />
                {/* LC Details */}
                <div className="px-4 mt-4">
                  <h2 className="text-xl font-semibold">LC Details</h2>
                  <LCInfo
                    label="LC Issuance (Expected)"
                    value={convertDateToYYYYMMDD(
                      lcData?.lcPeriod?.startDate || ""
                    )}
                  />
                  <LCInfo
                    label="LC Expiry Date"
                    value={convertDateToYYYYMMDD(
                      lcData?.lcPeriod?.endDate || ""
                    )}
                  />
                  <LCInfo
                    label="Confirmation Date (Expected)"
                    value={convertDateToYYYYMMDD(
                      lcData?.lcPeriod?.endDate || ""
                    )}
                  />
                  <LCInfo
                    label="Transhipment"
                    value={
                      lcData?.transhipment === true ? "Allowed" : "Not allowed"
                    }
                  />
                  <LCInfo
                    label="Port of Shipment"
                    value={lcData?.shipmentPort?.port || ""}
                  />
                  <LCInfo
                    label="Product Description"
                    value={lcData?.productDescription || ""}
                    noBorder
                  />

                  <h2 className="text-xl font-semibold mt-3">Exporter Info</h2>
                  <LCInfo
                    label="Country"
                    value={lcData?.exporterInfo?.countryOfExport || ""}
                  />
                  <LCInfo
                    label="Charges on account of"
                    value="Beneficiary"
                    noBorder
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="w-full h-full flex flex-col justify-start px-5">
            <p className="text-xl font-semibold pt-5">Bid</p>
            {isInfo ? (
              <>
                {/* Bid info and status */}
                <div className="flex flex-col gap-y-2 py-4 px-4 mt-3 border border-borderCol rounded-lg">
                  <div>
                    <p className="text-sm text-para">Bid Number</p>
                    <p className="font-semibold text-lg">100928</p>
                  </div>

                  <div>
                    <p className="font-semibold text-lg">Habib Bank Limited</p>
                    <p className="text-sm text-para">Pakistan</p>
                  </div>

                  <div>
                    <p className="text-sm text-para">Bid Submitted</p>
                    <p className="font-semibold text-lg">Jan 9 2023, 23:59</p>
                  </div>

                  <div>
                    <p className="text-sm text-para">Bid Expiry</p>
                    <p className="font-semibold text-lg">Jan 9 2023, 23:59</p>
                  </div>

                  <div>
                    <p className="text-sm text-para">Confirmation Rate</p>
                    <p className="text-lg font-semibold text-text">
                      1.75% per annum
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-para">Discounting Base Rate</p>
                    <p className="font-semibold text-lg">
                      KIBOR + <span className="text-text">2.22% per annum</span>
                    </p>
                  </div>

                  <Button
                    className={`${
                      status === "Accepted"
                        ? "bg-[#29C08433] hover:bg-[#29C08433]"
                        : status === "Rejected"
                        ? "bg-[#FF02021A] hover:bg-[#FF02021A]"
                        : status === "Expired"
                        ? "bg-[#97979733] hover:bg-[#97979733]"
                        : status === "Submitted"
                        ? "bg-[#F4D0131A] hover:bg-[#F4D0131A]"
                        : ""
                    } mt-2 text-black`}
                  >
                    {status === "Accepted"
                      ? "Bid Accepted"
                      : status === "Rejected"
                      ? "Bid Rejected"
                      : status === "Expired"
                      ? "Request Expired"
                      : status === "Submitted"
                      ? "Bid Submitted"
                      : ""}
                  </Button>
                </div>

                {status === "Rejected" && (
                  <AddBid
                    triggerTitle={"Submit a new bid"}
                    status={"Add bid"}
                    isInfo={false}
                    isDiscount={lcData?.lcType.includes("Discount")}
                    lcId={lcData?._id}
                  />
                )}
              </>
            ) : (
              // Add Bids
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-y-4 py-4 px-4 mt-5 border border-borderCol rounded-lg"
              >
                <div>
                  <div>
                    <label
                      htmlFor="validity"
                      className="block font-semibold mb-2"
                    >
                      Bid Validity
                    </label>
                    <DatePicker setValue={setValue} />
                  </div>
                  {errors.validity && (
                    <span className="text-red-500 text-[12px]">
                      {errors.validity.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmation"
                    className="block font-semibold mb-2"
                  >
                    Confirmation Pricing
                  </label>
                  <Input
                    type="number"
                    name="confirmationPrice"
                    register={register}
                    placeholder="Enter your pricing (%)"
                    id="confirmation"
                  />
                  {errors.confirmationPrice && (
                    <span className="text-red-500 text-[12px]">
                      {errors.confirmationPrice.message}
                    </span>
                  )}
                </div>

                {isDiscount && (
                  <div className="">
                    <label
                      htmlFor="discount"
                      className="block font-semibold mb-2"
                    >
                      Discount Pricing
                    </label>
                    <div className="flex flex-col gap-y-3 items-center w-full">
                      <label
                        id="base-rate"
                        className="border border-borderCol py-2.5 px-3 rounded-md w-full flex items-center justify-between"
                      >
                        <p className="text-sm w-full text-muted-foreground">
                          Select Base Rate
                        </p>
                        <input
                          type="number"
                          id="base-rate"
                          value={discountBaseRate}
                          onChange={(e) => setDiscountBaseRate(e.target.value)}
                          className="max-w-[120px] text-sm block bg-none border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]"
                          placeholder="0"
                        />
                      </label>
                      <Plus strokeWidth={4.5} className="size-4" />
                      <input
                        type="text"
                        placeholder="Margin (%)"
                        id="margin"
                        value={discountMargin}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setDiscountMargin(e.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-x-2 mt-2">
                  <DialogClose
                    id="submit-button-close"
                    className="hidden"
                  ></DialogClose>
                  <Button
                    className="bg-[#29C084] hover:bg-[#29C084]/90 text-white hover:text-white w-full"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                  <DialogClose className="w-full">
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="bg-borderCol hover:bg-borderCol/90 text-para hover:text-para w-full"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
