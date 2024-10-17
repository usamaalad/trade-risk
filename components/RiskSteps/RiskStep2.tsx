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
  const [currencyValue, setCurrencyValue] = useState<string | number>();
  const [rawValue, setRawValue] = useState("");
  const amount = watch("riskParticipationTransaction.amount");
  const baseRate = watch("riskParticipationTransaction.baseRate");
  //

  useEffect(() => {
    if (baseRate)
      setValue("riskParticipationTransaction.participationRate", baseRate);
  }, [baseRate]);

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

  const [pricePerAnnum, setPricePerAnnum] = useState("0");

  const handleIncrement = () => {
    const currentValue = watch("riskParticipationTransaction.perAnnum") || "0";
    const newValue = (parseFloat(currentValue) + 0.5).toFixed(1);
    if (Number(newValue) > 100) {
      return;
    }
    setValue("riskParticipationTransaction.perAnnum", `${newValue}%`);
  };
  console.log(watch("riskParticipationTransaction.perAnnum"));

  const handleDecrement = () => {
    console.log("newValue");
    const currentValue = watch("riskParticipationTransaction.perAnnum") || "0";
    let newValue = parseFloat(currentValue) - 0.5;

    if (newValue < 0) newValue = 0;
    // @ts-ignore
    newValue = newValue.toFixed(1);
    setValue("riskParticipationTransaction.perAnnum", `${newValue}%`);
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
          checked={watch("riskParticipation") === "Non-Funded"}
          register={register}
        />
        <BankRadioInput
          id="funded"
          label="Funded"
          name="riskParticipation"
          value="Funded"
          disabled={true}
          checked={watch("riskParticipation") === "Funded"}
          register={register}
        />
      </div>
      {/* Transaction Fields */}
      {watch("riskParticipation") && (
        <>
          <div className="mt-3 pt-4 px-2 border border-borderCol rounded-lg w-full bg-[#F5F7F9]">
            <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
              Transaction offered under Risk Participation
            </p>

            <div className="flex items-center  justify-between gap-x-2 w-full">
              {watch("riskParticipation") === "Non-Funded" ? (
                <>
                  <BankRadioInput
                    id="transaction-confirmation"
                    label="LC Confirmation"
                    name="riskParticipationTransaction.type"
                    value="LC Confirmation"
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "LC Confirmation"
                    }
                    register={register}
                  />
                  <BankRadioInput
                    id="LG (letter Of Guarantee)"
                    label="LG (letter Of Guarantee)"
                    name="riskParticipationTransaction.type"
                    value="LG (letter Of Guarantee)"
                    disabled={true}
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "LG (letter Of Guarantee)"
                    }
                    register={register}
                  />
                  <BankRadioInput
                    id="SBLC"
                    label="SBLC"
                    name="riskParticipationTransaction.type"
                    value="SBLC"
                    disabled={true}
                    checked={
                      watch("riskParticipationTransaction.type") === "SBLC"
                    }
                    register={register}
                  />
                  <BankRadioInput
                    id="transaction-avalization"
                    label="Avalization"
                    name="riskParticipationTransaction.type"
                    value="Avalization"
                    disabled={true}
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "Avalization"
                    }
                    register={register}
                  />

                  <BankRadioInput
                    id="transaction-supply"
                    label="Supply Chain Finance"
                    name="riskParticipationTransaction.type"
                    value="Supply Chain Finance"
                    disabled={true}
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "Supply Chain Finance"
                    }
                    register={register}
                  />
                </>
              ) : (
                <>
                  <BankRadioInput
                    id="transaction-discounting"
                    label="LC Discounting"
                    name="riskParticipationTransaction.type"
                    value="LC Discounting"
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "LC Discounting"
                    }
                    register={register}
                  />

                  <BankRadioInput
                    id="transaction-trade"
                    label="Trade Load"
                    name="riskParticipationTransaction.type"
                    value="Trade Loan"
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "Trade Loan"
                    }
                    register={register}
                  />

                  <BankRadioInput
                    id="transaction-supply"
                    label="Supply Chain Finance"
                    name="riskParticipationTransaction.type"
                    value="Supply Chain Finance"
                    checked={
                      watch("riskParticipationTransaction.type") ===
                      "Supply Chain Finance"
                    }
                    register={register}
                  />
                </>
              )}
            </div>
            <div className={`flex gap-2 gap-y-3 my-2`}>
              <div className="w-2/3">
                <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
                  LC Amount Confirmed
                </p>

                <div className="flex items-center gap-x-2">
                  <Select>
                    <SelectTrigger className="w-[80px] py-[26px] bg-borderCol/80 focus:ring-0 focus:ring-offset-0 text-sm">
                      <SelectValue placeholder="USD" className="text-sm" />
                    </SelectTrigger>
                    <SelectContent>
                      {currency &&
                        currency.response.length > 0 &&
                        currency.response.map((curr: string, idx: number) => (
                          <SelectItem
                            defaultValue="USD"
                            key={`${curr}-${idx + 1}`}
                            value={curr}
                          >
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
                    className="py-[26px] border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0  flex h-10 w-full rounded-md  bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="w-full">
                <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
                  % participation offered
                </p>
                <div className="flex items-start justify-between w-full">
                  <CheckBoxInput
                    checked={true}
                    label="Maximum 90% can be offered as per MRPA"
                    register={register}
                    id="isSameAsIssuance" // ID for the checkbox
                    onChange={() => console.log("something")} // Call the handler
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="amount"
                    value={currencyValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="py-[26px] border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0  flex h-10 w-full rounded-md  bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="amount"
                    value={currencyValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="py-[26px] border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0  flex h-10 w-full rounded-md  bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="amount"
                    value={currencyValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="py-[26px] border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0  flex h-10 w-full rounded-md  bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  {watch("riskParticipation") === "Funded" && (
                    <>
                      <label
                        id="select-base-rate"
                        className="bg-white border border-borderCol py-[14px] px-3 rounded-md w-full flex items-center justify-between"
                      >
                        <p className="w-full text-sm text-lightGray">
                          Select base rate
                        </p>
                        <input
                          id="select-base-rate"
                          type="text"
                          name="select-base-rate"
                          {...register("riskParticipationTransaction.baseRate")}
                          className="block bg-none text-sm border-none outline-none w-[100px]"
                          placeholder="Select Value"
                          onKeyUp={(event: any) => {
                            if (event.target?.value > 100) {
                              event.target.value = "100.0";
                            }
                          }}
                        />
                      </label>

                      <label
                        id="expected-pricing"
                        className="border bg-white border-borderCol py-[5px] px-3 rounded-md w-full flex items-center justify-between"
                      >
                        <p className="text-lightGray text-sm">Per Annum (%)</p>
                        <div className="flex items-center gap-x-2">
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
                            {...register("")}
                            required
                            max={100}
                            {...register(
                              "riskParticipationTransaction.perAnnum"
                            )}
                            className="border-none outline-none text-sm max-w-[70px] w-fit"
                            // onChange={(e) => setPricePerAnnum(e.target.value)}
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
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
