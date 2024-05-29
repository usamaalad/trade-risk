import { useEffect } from "react";
import { BgRadioInput } from "./helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";

export const Step6 = ({
  title,
  isDiscount,
  register,
  setValue,
  watch,
}: {
  title: string;
  isDiscount?: boolean;
  register: any;
  setValue: any;
  watch: any;
}) => {
  const behalfOf = watch(
    isDiscount ? "discountingInfo.behalfOf" : "confirmationInfo.behalfOf"
  );
  const discountAtSight = watch(
    isDiscount ? "discountingInfo.discountAtSight" : "discountAtSight"
  );

  let pricePerAnnum = isDiscount
    ? watch("discountingInfo.pricePerAnnum")
    : watch("confirmationInfo.pricePerAnnum");

  useEffect(() => {
    if (pricePerAnnum) {
      isDiscount
        ? setValue(
            "discountingInfo.pricePerAnnum",
            `${pricePerAnnum.toString()}`
          )
        : setValue(
            "confirmationInfo.pricePerAnnum",
            `${pricePerAnnum.toString()}`
          );
    }
  }, [pricePerAnnum]);

  const handleIncrement = () => {
    const currentValue = isDiscount
      ? watch("discountingInfo.pricePerAnnum") || "0"
      : watch("confirmationInfo.pricePerAnnum") || "0";
    const newValue = (parseFloat(currentValue) + 0.5).toFixed(1);
    if (Number(newValue) > 100) {
      return;
    }
    isDiscount
      ? setValue("discountingInfo.pricePerAnnum", `${newValue}%`)
      : setValue("confirmationInfo.pricePerAnnum", `${newValue}%`);
  };

  const handleDecrement = () => {
    const currentValue = isDiscount
      ? watch("discountingInfo.pricePerAnnum") || "0"
      : watch("confirmationInfo.pricePerAnnum") || "0";
    let newValue = parseFloat(currentValue) - 0.5;

    if (newValue < 0) newValue = 0;
    // @ts-ignore
    newValue = newValue.toFixed(1);
    isDiscount
      ? setValue("discountingInfo.pricePerAnnum", `${newValue}%`)
      : setValue("confirmationInfo.pricePerAnnum", `${newValue}%`);
  };

  return (
    <div
      id="step6"
      className="py-3 px-2 border border-borderCol rounded-lg w-full h-full"
    >
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="text-sm size-6 rounded-full bg-primaryCol center text-white font-semibold">
          6
        </p>
        <p className="font-semibold text-[16px] text-lightGray">{title}</p>
      </div>
      {isDiscount && (
        <div className="border border-borderCol py-3 px-2 rounded-md mb-4 bg-[#F5F7F9]">
          <p className="font-semibold ml-3 mb-2">Discount at sight</p>
          <BgRadioInput
            id="discount-yes"
            label="Yes"
            name={
              isDiscount ? "discountingInfo.discountAtSight" : "discountAtSight"
            }
            value="yes"
            register={register}
            checked={discountAtSight === "yes"}
          />
          <BgRadioInput
            id="discount-no"
            label="No"
            name={
              isDiscount ? "discountingInfo.discountAtSight" : "discountAtSight"
            }
            value="no"
            register={register}
            checked={discountAtSight === "no"}
          />
        </div>
      )}
      <div className="border border-borderCol py-3 px-2 rounded-md bg-[#F5F7F9]">
        <p className="font-semibold text-sm ml-3 mb-2">Charges on account of</p>
        <BgRadioInput
          id="account-beneficiary"
          label="Exporter/Supplier (Beneficiary)"
          name={
            isDiscount
              ? "discountingInfo.behalfOf"
              : "confirmationInfo.behalfOf"
          }
          value="Exporter"
          register={register}
          checked={behalfOf === "Exporter"}
        />
        <BgRadioInput
          id="account-importer"
          label="Importer (Applicant)"
          name={
            isDiscount
              ? "discountingInfo.behalfOf"
              : "confirmationInfo.behalfOf"
          }
          value="Importer"
          register={register}
          checked={behalfOf === "Importer"}
        />
      </div>

      <div className="border border-borderCol py-3 px-2 rounded-md mt-5 bg-[#F5F7F9]">
        <p className="font-semibold ml-3 mb-2 text-sm">
          {title == "Confirmation Charges"
            ? "Expected pricing"
            : "Expected charges"}
        </p>
        {isDiscount && (
          <div className="mb-3 bg-white">
            <label
              id="selectBaseRate"
              className="border border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
            >
              <p className="w-full text-sm text-lightGray">Select base rate</p>
              <Input
                id="selectBaseRate"
                inputMode="numeric"
                type="number"
                name="selectBaseRate"
                register={register}
                className="block bg-none text-sm border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]"
                placeholder="Select Value"
              />
            </label>
          </div>
        )}
        <label
          id="expected-pricing"
          className="border bg-white border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
        >
          <p className="text-lightGray text-sm">Pricing Per Annum</p>
          <div className="flex items-center gap-x-2 relative">
            <Button
              type="button"
              variant="ghost"
              className="bg-none border-none text-lg"
              onClick={handleDecrement}
            >
              -
            </Button>
            <input
              placeholder="Value (%)"
              type="text"
              inputMode="numeric"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-none outline-none focus-visible:ring-0 max-w-[100px] focus-visible:ring-offset-0 "
              )}
              max={100}
              {...register(
                isDiscount
                  ? "discountingInfo.pricePerAnnum"
                  : "confirmationInfo.pricePerAnnum"
              )}
              onChange={(event) => {
                const newValue = event.target.value.replace(/[^0-9.]/g, "");
                event.target.value = newValue;
              }}
              onBlur={(event) => {
                if (
                  event.target.value.includes("%") ||
                  event.target.value.length === 0
                )
                  return;
                event.target.value += "%";
              }}
              onKeyUp={(event: any) => {
                if (Number(event.target.value.replace("%", "")) > 100) {
                  event.target.value = "100.0%";
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              className="bg-none border-none text-lg"
              onClick={handleIncrement}
            >
              +
            </Button>
          </div>
        </label>
      </div>
    </div>
  );
};
