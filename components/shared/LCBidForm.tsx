import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBid } from "@/services/apis/bids.api";
import { toast } from "sonner";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "../helpers";
import { addBidTypes } from "@/validation/bids.validation";
import { DDInput } from "../LCSteps/helpers";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { formatFirstLetterOfWord } from "../LG-Output/helper";
import { baseRatesByCountry } from "@/utils";

export const BidForm = ({
  lcData,
  isDiscount,
  onSubmitSuccess,
}: {
  lcData: any;
  isDiscount: boolean;
  onSubmitSuccess: () => void;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [discountBaseRate, setDiscountBaseRate] = useState("");
  const [discountMargin, setDiscountMargin] = useState("");
  const [confirmationPriceType, setConfirmationPriceType] = useState("");
  const [baseRateOptions, setBaseRateOptions] = useState<string[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { mutateAsync } = useMutation({
    mutationFn: addBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid-status"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-lcs"] });
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
    resolver: yupResolver(addBidTypes),
  });

  useEffect(() => {
    // Combine all unique base rates for testing purposes with country labels
    const allBaseRates = Array.from(
      new Set(
        Object.entries(baseRatesByCountry).flatMap(([country, rates]) =>
          rates.map((rate) => `${rate} (${country.toUpperCase()})`)
        )
      )
    );
    setBaseRateOptions(allBaseRates);
  }, []);
  // useEffect(() => {
  //   const country = formatFirstLetterOfWord(user?.business?.accountCountry);
  //   if (country && eurozoneCountries.includes(country)) {
  //     setBaseRateOptions(baseRatesByCountry.Eurozone);
  //   } else if (country && baseRatesByCountry[country]) {
  //     setBaseRateOptions(baseRatesByCountry[country]);
  //   } else {
  //     setBaseRateOptions(["OIS", "REPO", "IBOR"]);
  //   }
  // }, [user?.business?.accountCountry]);

  const onSubmit: SubmitHandler<typeof addBidTypes> = async (data) => {
    if (isDiscount && !discountBaseRate)
      return toast.error("Please provide discount base rate");
    if (isDiscount && !discountMargin)
      return toast.error("Please provide discount margin");

    const baseData = {
      confirmationPrice: data.confirmationPrice,
      lc: lcData?._id,
      type: lcData?.type!,
      validity: data.validity,
    };

    const reqData = isDiscount
      ? {
          ...baseData,
          discountMargin,
          discountBaseRate,
          perAnnum: confirmationPriceType === "perAnnum" ? true : false,
        }
      : baseData;

    const { success, response } = await mutateAsync(reqData);

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
        <label htmlFor="validity" className="block font-semibold mb-2">
          Bid Validity
        </label>
        <DatePicker
          setValue={setValue}
          key={lcData?._id}
          disabled={{
            before:
              lcData?.period?.startDate &&
              new Date(lcData.period.startDate) > new Date()
                ? new Date(lcData.period.startDate)
                : new Date(),
            after: new Date(lcData?.period?.endDate),
          }}
          isPast={false}
        />
        {errors.validity && (
          <span className="text-red-500 text-[12px]">
            {errors.validity.message}
          </span>
        )}
      </div>

      {/* Pricing Section */}
      <div>
        <label htmlFor="confirmation" className="block font-semibold mb-2">
          {isDiscount ? "Discount Pricing" : "Your Pricing"}
        </label>
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

      {/* Discount Specific Fields */}
      {isDiscount && (
        <>
          <div className="flex flex-col gap-y-3">
            <label className="font-semibold">Base Rate</label>
            <DDInput
              id="baseRate"
              label="Base Rate"
              type="baseRate"
              value={discountBaseRate}
              placeholder="Select Value"
              buttonStyle="w-full"
              setValue={setValue}
              extStyle="pl-[0px]"
              onSelectValue={setDiscountBaseRate}
              data={baseRateOptions} // Dynamically generated options
            />
            <input
              type="text"
              placeholder="Margin (%)"
              inputMode="numeric"
              value={discountMargin}
              max={100}
              onFocus={(e: ChangeEvent<HTMLInputElement>) => {
                e.target.value = discountMargin.replace("%", "");
              }}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                if (
                  !e.target.value.includes("%") &&
                  e.target.value.length > 0
                ) {
                  setDiscountMargin(`${e.target.value}%`);
                }
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                let newValue = e.target.value.replace(/[^0-9.]/g, "");
                if (Number(newValue) > 100) {
                  newValue = "100";
                }
                e.target.value = newValue;
                setDiscountMargin(newValue);
              }}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>
        </>
      )}

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
          Submit
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="bg-borderCol hover:bg-borderCol/90 text-para w-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
