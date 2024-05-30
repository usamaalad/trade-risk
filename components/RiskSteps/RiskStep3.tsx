"use client";
import React, { useEffect, useState } from "react";
import { BankRadioInput, DateInput, DiscountBanks } from "./RiskHelpers";
import { DDInput } from "../LCSteps/helpers";
import { getAllPortData } from "@/services/apis/helpers.api";
import { useQuery } from "@tanstack/react-query";

interface Props {
  countries: string[];
  flags: string[];
  register: any;
  watch: any;
  setValue: any;
}

export const RiskStep3 = ({
  countries,
  flags,
  register,
  watch,
  setValue,
}: Props) => {
  const [portCountries, setPortCountries] = useState<string[]>([]);
  const [ports, setPorts] = useState<string[]>([]);
  const {shipmentPort}  = watch();
  console.log(shipmentPort,"port")

  const { data: portsData } = useQuery({
    queryKey: ["port-countries"],
    queryFn: () => getAllPortData(),
  });

  useEffect(() => {
    if (
      portsData &&
      portsData.success &&
      portsData.response &&
      portsData.response.length > 0
    ) {
      const allPortCountries = portsData.response.map((port: any) => {
        return port.country;
      });
      setPortCountries(allPortCountries);
    }
  }, [portsData]);

  const [days, setDays] = useState<number | string>();

  return (
    <div className="py-4 pt-6 px-4 border border-borderCol rounded-lg w-full bg-white">
      <div className="flex items-center gap-x-2 ml-2 mb-4">
        <p className="size-6 text-sm rounded-full bg-[#255EF2] center text-white font-semibold">
          3
        </p>
        <p className="font-semibold text-[16px] text-lightGray">
          Details of Transaction being offered for Risk Participation
        </p>
      </div>
      <DiscountBanks
        countries={countries}
        flags={flags}
        setValue={setValue}
        watch={watch}
      />

      <div className="relative flex items-center justify-between gap-x-3 w-full my-4">
        <div className="border border-borderCol py-3 px-2 rounded-md w-full bg-[#F5F7F9] h-[274px]">
          <p className="text-sm font-semibold mb-2 ml-2">
            Is the LC Discounted?
          </p>
          <BankRadioInput
            id="discounted-yes"
            label="Yes"
            name="isLcDiscounting"
            value="yes"
            checked={watch("isLcDiscounting") === "yes"}
            register={register}
          />
          <BankRadioInput
            id="discounted-no"
            label="No"
            name="isLcDiscounting"
            value="no"
            checked={watch("isLcDiscounting") === "no"}
            register={register}
          />
        </div>

        <div className="border border-borderCol py-3 px-2 rounded-md w-full bg-[#F5F7F9]">
          <p className="text-sm font-semibold mb-2 ml-2">
            Is it expected to be discounted?
          </p>
          <BankRadioInput
            id="expected-yes"
            label="Yes"
            name="expectedDiscounting"
            value="yes"
            checked={watch("expectedDiscounting") === "yes"}
            register={register}
          />
          <BankRadioInput
            id="expected-no"
            label="No"
            name="expectedDiscounting"
            value="no"
            checked={watch("expectedDiscounting") === "no"}
            register={register}
          />

          <DateInput title="Expected Date of Discounting" noBorder />
        </div>
      </div>

      <div className="flex items-center justify-between gap-x-3 w-full my-4">
        <DateInput title="Date LC Issued / Expected Date of LC Issuance" />
        <DateInput title="LC Expiry Date" />
      </div>

      <div className="flex items-center justify-between gap-x-3 w-full my-4">
        <div className="border border-borderCol pt-3 pb-1 px-2 rounded-md w-full bg-[#F5F7F9]">
          <p className="text-sm font-semibold mb-2 ml-2">Payment Terms</p>
          <div className="flex items-center gap-x-3 w-full justify-between">
            <BankRadioInput
              id="payment-sight"
              label="Sight LC"
              name="paymentTerms"
              value="sight"
              checked={watch("paymentTerms") === "sight"}
              register={register}
            />
            <BankRadioInput
              id="payment-usance"
              label="Usance LC"
              name="paymentTerms"
              value="usance"
              checked={watch("paymentTerms") === "usance"}
              register={register}
            />
            <div className="w-full">
              <label
                htmlFor="payment-tenor"
                className={`px-3 py-2.5 w-full transition-colors duration-100 ${
                  watch("paymentTerms") === "tenor"
                    ? "bg-[#DCE5FD]"
                    : "border border-borderCol bg-white"
                } rounded-md flex items-center justify-between gap-x-3 mb-2 text-lightGray text-sm`}
              >
                <div className="flex gap-x-2 items-center">
                  <input
                    type="radio"
                    id="payment-tenor"
                    value="tenor"
                    {...register("paymentTerms")}
                    checked={watch("paymentTerms") === "tenor"}
                    className="accent-[#255EF2] size-4"
                  />
                  Tenor LC
                </div>
                <div className="border-b border-black flex items-center">
                  <input
                    placeholder="enter days"
                    inputMode="numeric"
                    name="days"
                    type="number"
                    value={days}
                    className="text-sm text-lightGray border-none max-w-[150px] bg-transparent outline-none"
                    onChange={(e: any) => setDays(e.target.value)}
                  />
                  <div className="flex items-center gap-x-1">
                    <button
                      type="button"
                      className="rounded-sm border border-para size-6 center mb-2"
                      onClick={() => {
                        setDays((prev: any) => Number(prev) + 1);
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="rounded-sm border border-para size-6 center mb-2"
                      onClick={() => {
                        setDays((prev: any) =>
                          Number(prev) > 1 ? Number(prev) - 1 : 1
                        );
                      }}
                    >
                      -
                    </button>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* Transhipment */}
      <div className="flex items-center justify-between gap-x-3 w-full">
        <div className="border border-borderCol py-3 px-2 rounded-md w-full min-h-40 h-44 bg-[#F5F7F9]">
          <p className="font-semibold ml-3 text-sm">Port of Shipment</p>
          <div className="flex flex-col gap-y-2 mt-2">
            <DDInput
              id="shipmentPort.country"
              label="Country"
              //   value={shipmentCountry}
              placeholder="Select a country"
              setValue={setValue}
              data={portCountries}
              disabled={portCountries.length <= 0}
              flags={flags}
            />
            <DDInput
              id="shipmentPort.port"
              label="Port"
              //   value={shipmentPort}
              placeholder="Select port"
              setValue={setValue}
                disabled={!ports || ports.length === 0}
                data={ports}
            />
          </div>
        </div>
        <div className="border border-borderCol py-3 px-2 rounded-md w-full bg-[#F5F7F9] h-44">
          <p className="text-sm font-semibold mb-2 ml-3">
            Transhipment Allowed
          </p>
          <BankRadioInput
            id="shipment-yes"
            label="Yes"
            name="transhipment"
            value="yes"
            checked={watch("transhipment") == "yes"}
            register={register}
          />
          <BankRadioInput
            id="shipment-no"
            label="No"
            name="transhipment"
            value="no"
            checked={watch("transhipment") == "no"}
            register={register}
          />
        </div>
      </div>

      {/* Expected Date */}
      <div className="flex items-center justify-between gap-x-3 w-full mt-4">
        <DateInput title="Expected date to add confirmation" />
        {/* Product Description */}
        <div className="border border-borderCol pt-3 pb-2 px-2 rounded-md w-full bg-[#F5F7F9]">
          <p className="text-sm font-semibold mb-2 ml-3">Product Description</p>
          <textarea
            name="description"
            rows={1}
            {...register("description")}
            placeholder="Enter the description of the product being imported (under this LC)"
            className="bg-white text-sm border border-borderCol resize-none w-full py-1 px-3 rounded-lg outline-none"
          ></textarea>
        </div>
      </div>
    </div>
  );
};
