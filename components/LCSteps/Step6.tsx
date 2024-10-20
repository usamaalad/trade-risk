import { useEffect, useState } from "react";
import { BgRadioInput, DDInput } from "./helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseRatesByCountry, cn, eurozoneCountries } from "@/utils";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import useStepStore from "@/store/lcsteps.store";
import { CONFIRMATION_CHARGES } from "@/utils/constant/lg";
import { formatFirstLetterOfWord } from "../LG-Output/helper";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/context/AuthProvider";

export const Step6 = ({
  title,
  isDiscount,
  register,
  setValue,
  watch,
  setStepCompleted,
}: {
  title: string;
  isDiscount?: boolean;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  setStepCompleted?: any;
}) => {
  const { addStep, removeStep } = useStepStore();
  const { user } = useAuth();
  const [baseRateOptions, setBaseRateOptions] = useState<string[]>([]);
  const behalfOf = watch(
    isDiscount ? "discountingInfo.behalfOf" : "confirmationInfo.behalfOf"
  );
  const discountAtSight = watch(
    isDiscount ? "discountingInfo.discountAtSight" : "discountAtSight"
  );
  const { baseRate } = watch();

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

  useEffect(() => {
    if (behalfOf && pricePerAnnum) {
      addStep(CONFIRMATION_CHARGES);
    } else removeStep(CONFIRMATION_CHARGES);
  }, [behalfOf, pricePerAnnum, baseRate]);

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

  return (
    <div
      id="step6"
      className="py-3 px-2 border border-borderCol rounded-lg w-full h-full scroll-target"
    >
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="text-sm size-6 rounded-full bg-primaryCol center text-white font-semibold">
          6
        </p>
        <p className="font-semibold text-[16px] text-lightGray">{title}</p>
      </div>
      {isDiscount && (
        <div className="border border-borderCol py-3 px-2 rounded-md mb-4 bg-[#F5F7F9]">
          <p className="font-semibold ml-3 mb-2">Discounted At</p>
          <BgRadioInput
            id="discount-yes"
            label="Sight"
            name={
              isDiscount ? "discountingInfo.discountAtSight" : "discountAtSight"
            }
            value="Sight"
            register={register}
            checked={discountAtSight === "Sight"}
          />
          <BgRadioInput
            id="discount-no"
            label="Acceptance Date"
            name={
              isDiscount ? "discountingInfo.discountAtSight" : "discountAtSight"
            }
            value="Acceptance Date"
            register={register}
            checked={discountAtSight === "Acceptance Date"}
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
              {/* <Input
                id="selectBaseRate"
                inputMode="numeric"
                type="number"
                name="selectBaseRate"
                register={register}
                className="block bg-none text-sm border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]"
                placeholder="Select Value"
              /> */}
              <div className="text-end">
                <DDInput
                  id="baseRate"
                  label="Base Rate"
                  type="baseRate"
                  value={baseRate}
                  placeholder="Select Value"
                  setValue={setValue}
                  data={baseRateOptions}
                />
              </div>
            </label>
          </div>
        )}
        <label
          id="expected-pricing"
          className="border bg-white border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
        >
          <p className="text-lightGray text-sm">Pricing Per Annum</p>
          <div className="flex items-center gap- x-2 relative">
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
                "flex h-10 !w-[70px] text-center rounded-md border border-input bg-background p x-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-none outline-none focus-visible:ring-0 max-w-[100px] focus-visible:ring-offset-0 "
              )}
              max={100}
              {...register(
                isDiscount
                  ? "discountingInfo.pricePerAnnum"
                  : "confirmationInfo.pricePerAnnum"
              )}
              onChange={(event) => {
                let newValue = event.target.value.replace(/[^0-9.]/g, "");

                // Allow only 4 digits after the decimal point
                if (newValue.includes(".")) {
                  const parts = newValue.split(".");
                  parts[1] = parts[1].slice(0, 4);
                  newValue = parts.join(".");
                }

                event.target.value = newValue;
              }}
              onBlur={(event) => {
                if (
                  event.target.value.includes("%") ||
                  event.target.value.length === 0
                )
                  return;

                // Ensure the value has at most 4 decimal places
                // let value = parseFloat(event.target.value).toFixed(4);
                event.target.value = `${event.target.value}%`;
              }}
              onKeyUp={(event) => {
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
