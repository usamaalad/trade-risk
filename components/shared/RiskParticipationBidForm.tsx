import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBid, addRiskBid } from "@/services/apis/bids.api";
import { toast } from "sonner";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "../helpers";
import { addBidTypes, getRiskAddBidTypes } from "@/validation/bids.validation";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { formatFirstLetterOfWord } from "../LG-Output/helper";

export const RiskParticipationBidForm = ({
  riskData,
  isDiscount,
  onSubmitSuccess,
}: {
  riskData: any;
  isDiscount: boolean;
  onSubmitSuccess: () => void;
}) => {
  const queryClient = useQueryClient();
  const [isCounterOffer, setCounterOffer] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { mutateAsync } = useMutation({
    mutationFn: addRiskBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid-status"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-risks"] });
      queryClient.invalidateQueries({ queryKey: ["single-lc"] });
      onSubmitSuccess();
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(getRiskAddBidTypes(isCounterOffer, riskData)),
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    const confirmationPrice = isCounterOffer
      ? data.confirmationPrice
      : riskData?.riskParticipationTransaction?.pricingOffered;

    const baseData = {
      price: confirmationPrice,
      risk: riskData?._id,
      isCounterOffer: isCounterOffer,
      bidValidity: data.bidValidity,
    };
    const { success, response } = await mutateAsync(baseData);

    if (!success) return toast.error(response);
    else {
      buttonRef?.current?.click();
      toast.success("Bid added");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-4 py-4 px-4 mt-5 border border-borderCol rounded-lg"
    >
      <div>
        <label
          htmlFor="bidValidity"
          className="text-[16px] block font-semibold mb-2"
        >
          Bid Validity
        </label>
        <DatePicker
          setValue={setValue}
          name="bidValidity"
          key={riskData?._id}
          disabled={{
            before:
              riskData?.lcPeriod?.date &&
              new Date(riskData?.lcPeriod?.date) > new Date()
                ? new Date(riskData?.lcPeriod?.date)
                : new Date(),
            after: new Date(riskData?.lcPeriod?.lcExpiry),
          }}
          isPast={false}
        />
        {errors.bidValidity && (
          <span className="text-red-500 text-[12px]">
            {errors.bidValidity.message}
          </span>
        )}
      </div>
      {isCounterOffer ? (
        <div>
          <div className="mb-2 flex justify-between items-center">
            <label
              htmlFor="confirmation"
              className="text-[16px] block font-semibold"
            >
              Counter Offer
            </label>
            <span className="text-[#29C084] text-[14px]">
              Pricing Offer:{" "}
              {riskData.riskParticipationTransaction.pricingOffered}% Per Annum
            </span>
          </div>
          <input
            placeholder="Enter your pricing per annum (%)"
            type="text"
            inputMode="numeric"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            )}
            max={100}
            {...register("confirmationPrice")}
            onChange={(event) => {
              const newValue = event.target.value.replace(/[^0-9.]/g, "");
              event.target.value = newValue;
              setValue("confirmationPrice", newValue);
            }}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
              if (
                !event.target.value.includes("%") &&
                event.target.value.length > 0
              ) {
                event.target.value += "%";
              }
            }}
            onKeyUp={(event: any) => {
              if (Number(event.target.value.replace("%", "")) > 100) {
                event.target.value = "100.0%";
              }
            }}
          />
          {errors.confirmationPrice && (
            <span className="text-red-500 text-[12px]">
              {errors.confirmationPrice.message}
            </span>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="confirmation" className="block font-semibold mb-2">
            Pricing Offered
          </label>
          <p className="font-semibold">
            <span className="text-[#5625F2]">
              {riskData.riskParticipationTransaction.pricingOffered}%
            </span>{" "}
            Per Annum
          </p>
        </div>
      )}
      {isCounterOffer ? (
        <div className="flex items-center gap-2 mt-2">
          <button
            ref={buttonRef}
            className="hidden"
            type="button"
            aria-label="hidden-close"
          />
          <Button
            className="bg-[#29C084] hover:bg-[#29C084]/90 text-white w-full"
            size="lg"
            type="submit"
            disabled={isSubmitting}
          >
            Submit Offer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => setCounterOffer(false)}
            className="bg-borderCol hover:bg-borderCol/90 text-para w-full"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <button
            ref={buttonRef}
            className="hidden"
            type="button"
            aria-label="hidden-close"
          />

          <Button
            className="bg-[#29C084] hover:bg-[#29C084]/90 text-white w-full"
            size="lg"
            type="submit"
            disabled={isSubmitting}
          >
            Accept Offer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="bg-[#CDBEFC] hover:bg-[#CDBEFC]/90 text-black w-full"
            onClick={() => setCounterOffer(true)} // Toggle state here
          >
            Make a Counter Offer
          </Button>
        </div>
      )}
    </form>
  );
};
