"use client";
import React, { useEffect, useState } from "react";
import { BankRadioInput } from "./RiskHelpers";
import { useQuery } from "@tanstack/react-query";
import { getCurrency } from "@/services/apis/helpers.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { CheckBoxInput } from "@/app/register/bank/page";
import { formatAmount } from "@/utils";

interface Props {
  register: any;
  watch: any;
  setValue: any;
}

export const RiskStep2 = ({ register, watch, setValue }: Props) => {
  const { data: currency } = useQuery({
    queryKey: ["currency"],
    queryFn: () => getCurrency(),
  });

  const [currencyValue, setCurrencyValue] = useState<string | number>("");
  const [rawValue, setRawValue] = useState("");
  const [percentageValue, setPercentageValue] = useState<string | number>("");

  const riskParticipation = watch("riskParticipation");
  const amount = watch("riskParticipationTransaction.amount");
  const transactionType = watch("transactionType");
  const isParticipationOffered = watch(
    "riskParticipationTransaction.isParticipationOffered",
    false
  );
  const pricingOffered = watch("riskParticipationTransaction.pricing");

  const handleChange = (e: any) => {
    const { value } = e.target;
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly) {
      const formattedValue = parseInt(digitsOnly).toLocaleString();
      setCurrencyValue(formattedValue);
      setRawValue(digitsOnly);
      setValue("riskParticipationTransaction.amount", digitsOnly);
    } else {
      setCurrencyValue("");
      setRawValue("");
      setValue("riskParticipationTransaction.amount", "");
    }
  };

  useEffect(() => {
    if (amount) {
      const digitsOnly = amount?.toString().replace(/\D/g, "");
      if (digitsOnly) {
        const formattedValue = parseInt(digitsOnly).toLocaleString();
        setCurrencyValue(formattedValue);
        setValue("riskParticipationTransaction.amount", digitsOnly);
      }
    }
  }, [amount]);

  const handleBlur = () => {
    if (rawValue) {
      const formattedValueWithCents = `${parseInt(
        rawValue
      ).toLocaleString()}.00`;
      setCurrencyValue(formattedValueWithCents);
    }
  };

  // Percentage handling
  const handleIncrement = () => {
    const currentValue = pricingOffered || "0";
    const newValue = (parseFloat(currentValue) + 0.5).toFixed(1);
    if (Number(newValue) > 100) {
      return;
    }
    setValue("riskParticipationTransaction.pricingOffered", newValue);
  };

  const handleDecrement = () => {
    let newValue = parseFloat(pricingOffered) - 0.5;
    if (newValue < 0) newValue = 0;
    newValue = newValue.toFixed(1);
    setValue("riskParticipationTransaction.pricingOffered", newValue);
  };

  useEffect(() => {
    if (rawValue && percentageValue) {
      const calculatedValue =
        (parseFloat(rawValue) * parseFloat(percentageValue)) / 100;
      setValue(
        "riskParticipationTransaction.participationValue",
        calculatedValue
      );
    }
  }, [rawValue, percentageValue]);

  const handlePercentageFocus = () => {
    if (percentageValue.endsWith("%")) {
      setPercentageValue(percentageValue.slice(0, -1));
    }
  };

  const handlePercentageBlur = () => {
    if (percentageValue && !percentageValue.endsWith("%")) {
      setPercentageValue(`${percentageValue}%`);
    }
  };

  const handlePercentageChange = (e: any) => {
    let value = e.target.value;
    if (isParticipationOffered && parseFloat(value) > 90) {
      value = "90";
    } else if (parseFloat(value) > 100) {
      value = "100";
    }
    setPercentageValue(value);
    setValue("riskParticipationTransaction.percentage", value);
  };

  return (
    <div className="py-4 pt-6 px-4 border border-borderCol rounded-lg w-full bg-white">
      <div className="flex items-center gap-x-2 ml-2 mb-5">
        <p className="size-6 text-sm rounded-full bg-[#255EF2] center text-white font-semibold">
          2
        </p>
        <p className="font-semibold text-[16px] text-lightGray">
          Risk Participation is offered under
        </p>
      </div>
      <div className="flex items-center justify-between gap-x-2 w-full">
        <BankRadioInput
          id="non-funded"
          label="Non-Funded"
          name="riskParticipation"
          value="Non-Funded"
          checked={riskParticipation === "Non-Funded"}
          register={register}
        />
        <BankRadioInput
          id="funded"
          label="Funded"
          name="riskParticipation"
          value="Funded"
          disabled={true}
          checked={riskParticipation === "Funded"}
          register={register}
        />
      </div>

      {watch("riskParticipation") && (
        <>
          <div className="mt-3 pt-4 px-2 border border-borderCol rounded-lg w-full bg-[#F5F7F9]">
            <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
              Transaction offered under Risk Participation
            </p>

            <div className="flex items-center justify-between gap-x-2 w-full">
              <BankRadioInput
                id="transaction-confirmation"
                label="LC Confirmation"
                className="h-14"
                name="transactionType"
                value="LC Confirmation"
                checked={transactionType === "LC Confirmation"}
                register={register}
              />
              <BankRadioInput
                id="LG (letter Of Guarantee)"
                label="LG (letter Of Guarantee)"
                className="h-14"
                name="transactionType"
                value="LG (letter Of Guarantee)"
                disabled={true}
                checked={transactionType === "LG (letter Of Guarantee)"}
                register={register}
              />
              <BankRadioInput
                id="SBLC"
                label="SBLC"
                className="h-14"
                name="transactionType"
                value="SBLC"
                disabled={true}
                checked={transactionType === "SBLC"}
                register={register}
              />
              <BankRadioInput
                id="transaction-avalization"
                label="Avalization"
                className="h-14"
                name="transactionType"
                value="Avalization"
                disabled={true}
                checked={transactionType === "Avalization"}
                register={register}
              />
              <BankRadioInput
                id="transaction-supply"
                className="h-14"
                label="Supply Chain Finance (payable finance)"
                name="transactionType"
                value="Supply Chain Finance"
                disabled={true}
                checked={transactionType === "Supply Chain Finance"}
                register={register}
              />
            </div>

            {/* Transaction Amount and Currency */}
            <div className={`flex gap-2 gap-y-3 my-2`}>
              <div className="w-[44%]">
                <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
                  LC Amount Confirmed
                </p>

                <div className="flex items-center gap-x-2">
                  <Select
                    onValueChange={(value) => {
                      setValue("riskParticipationTransaction.currency", value);
                    }}
                  >
                    <SelectTrigger className="w-[80px] py-[26px] bg-borderCol/80 focus:ring-0 focus:ring-offset-0 text-sm">
                      <SelectValue placeholder="USD" className="text-sm" />
                    </SelectTrigger>
                    <SelectContent>
                      {currency &&
                        currency.response.length > 0 &&
                        currency.response.map((curr: string, idx: number) => (
                          <SelectItem key={`${curr}-${idx + 1}`} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="amount"
                    value={currencyValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="py-[26px] border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0 flex h-10 w-full rounded-md bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="w-1/4 items-center justify-center">
                <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
                  % participation offered
                </p>
                <CheckBoxInput
                  checked={isParticipationOffered}
                  label="Maximum 90% can be offered as per MRPA"
                  register={register}
                  id="isParticipationOffered"
                  onChange={() => {
                    setValue(
                      "riskParticipationTransaction.isParticipationOffered",
                      !isParticipationOffered
                    );
                  }}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={percentageValue}
                  onChange={handlePercentageChange}
                  onFocus={handlePercentageFocus}
                  onBlur={handlePercentageBlur}
                  className="py-[26px] mt-7 border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0 h-10 w-full rounded-md bg-background px-3 text-sm"
                />
              </div>
              <div className="w-1/3">
                <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
                  Participation Value
                </p>

                <div className="flex items-center gap-x-2 w-full">
                  {/* Left Input (Currency) */}
                  <input
                    type="text"
                    readOnly
                    value={
                      watch("riskParticipationTransaction.currency") || "USD"
                    }
                    className="py-[26px] border border-borderCol flex h-10 w-[25%] rounded-md bg-background px-3 text-sm bg-[#E9E9F0]"
                  />
                  <input
                    type="text"
                    readOnly
                    value={formatAmount(
                      watch("riskParticipationTransaction.participationValue")
                    )}
                    className="py-[26px] border border-borderCol flex h-10 w-full rounded-md bg-background px-3 text-sm bg-[#E9E9F0]"
                  />
                </div>
              </div>
            </div>

            <label
              id="expected-pricing"
              className="border bg-white border-borderCol py-2.5 mb-3 px-3 rounded-md w-full flex items-center justify-between"
            >
              <p className="text-lightGray text-sm">
                Pricing offered on participation
              </p>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="bg-none border-none text-lg text-lightGray"
                  onClick={handleDecrement}
                >
                  -
                </Button>
                <input
                  placeholder="Value"
                  type="text"
                  inputMode="numeric"
                  required
                  max={100}
                  {...register("riskParticipationTransaction.pricingOffered")}
                  className="w-fit items-center justify-center border-none bg-transparent text-sm text-lightGray flex self-center text-center w-14"
                  onKeyUp={(event: any) => {
                    if (event.target?.value > 100) {
                      event.target.value = "100.0";
                    }
                  }}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="bg-none border-none text-lg text-lightGray"
                  onClick={handleIncrement}
                >
                  +
                </Button>
                <div className="text-[14px] text-[#44444F]">Per Annum</div>
              </div>
            </label>
          </div>
        </>
      )}
    </div>
  );
};
