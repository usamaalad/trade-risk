import React, { useEffect, useState } from "react";
import { BgRadioInput, DDInput } from "./helpers";
import { Button } from "@/components/ui/button";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import { useAuth } from "@/context/AuthProvider";
import { baseRatesByCountry, eurozoneCountries } from "@/utils";
import { formatFirstLetterOfWord } from "../LG-Output/helper";

export const Step7Disounting = ({
  register,
  setValue,
  getValues,
  watch,
}: {
  getValues: UseFormGetValues<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}) => {
  const discountAtSight = watch("discountingInfo.discountAtSight");
  const behalfOf = watch("discountingInfo.behalfOf");
  const baseRate = watch("discountingInfo.basePerRate");
  const { user } = useAuth();
  const [baseRateOptions, setBaseRateOptions] = useState<string[]>([]);

  let pricePerAnnum = getValues("discountingInfo.pricePerAnnum");
  useEffect(() => {
    if (pricePerAnnum) {
      setValue("discountingInfo.pricePerAnnum", pricePerAnnum.toString());
    }
  }, [pricePerAnnum]);

  const handleIncrement = () => {
    const currentValue = getValues("discountingInfo.pricePerAnnum") || "0";
    const newValue = (parseFloat(currentValue) + 0.5).toFixed(1);
    if (Number(newValue) > 100) {
      return;
    }
    setValue("discountingInfo.pricePerAnnum", `${newValue}%`);
  };

  const handleDecrement = () => {
    const currentValue = getValues("discountingInfo.pricePerAnnum") || "0";
    let newValue = parseFloat(currentValue) - 0.5;

    if (newValue < 0) newValue = 0;
    // @ts-ignore
    newValue = newValue.toFixed(1);
    setValue("discountingInfo.pricePerAnnum", `${newValue}%`);
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
    <div className="py-3 px-2 border border-borderCol rounded-lg w-full h-full">
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="size-6 rounded-full bg-primaryCol center text-white font-semibold">
          7
        </p>
        <p className="font-semibold text-lg text-lightGray">Discounting Info</p>
      </div>

      <div className="border border-borderCol py-3 px-2 rounded-md mb-4 bg-[#F5F7F9]">
        <p className="font-semibold ml-3 mb-2">Discounted at </p>
        <BgRadioInput
          id="discount-yes"
          label="Sight"
          name="discountingInfo.discountAtSight"
          value="Sight"
          register={register}
          checked={discountAtSight === "Sight"}
        />
        <BgRadioInput
          id="discount-no"
          label="Acceptance Date"
          name="discountingInfo.discountAtSight"
          value="Acceptance Date"
          register={register}
          checked={discountAtSight === "Acceptance Date"}
        />
      </div>

      <div className="border border-borderCol py-3 px-2 rounded-md bg-[#F5F7F9]">
        <p className="font-semibold ml-3 mb-2">Charges on account of</p>
        <BgRadioInput
          id="disc-account-beneficiary"
          label="Exporter/Supplier (Beneficiary)"
          name="discountingInfo.behalfOf"
          value="Exporter"
          register={register}
          checked={behalfOf === "Exporter"}
        />
        <BgRadioInput
          id="disc-account-importer"
          label="Importer (Applicant)"
          name="discountingInfo.behalfOf"
          value="Importer"
          register={register}
          checked={behalfOf === "Importer"}
        />
      </div>

      <div className="border border-borderCol py-3 px-2 rounded-md mt-5 bg-[#F5F7F9]">
        <p className="font-semibold ml-3 mb-2">Expected charges</p>
        <div className="text-end mb-3">
          <DDInput
            id="discountingInfo.basePerRate"
            label="Select Base Rate"
            type="styles"
            value={baseRate}
            placeholder="Select Value"
            setValue={setValue}
            data={baseRateOptions}
          />
        </div>

        <label
          id="expected-pricing"
          className="border bg-white border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
        >
          <p className="text-lightGray text-sm">Per Annum(%)</p>
          <div className="flex items-center gap- x-2">
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
              className="border-none !w-[70px] text-center text-[13px] outline-none focus-visible:ring-0 max-w-[100px] focus-visible:ring-offset-0"
              max={100}
              {...register("discountingInfo.pricePerAnnum")}
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
                console.log(event.target.value.length);
                if (
                  event.target.value.includes("%") ||
                  event.target.value.length === 0
                ) {
                  return;
                }
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
