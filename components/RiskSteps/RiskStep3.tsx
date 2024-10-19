"use client";
import React, { useEffect, useState } from "react";
import { BankRadioInput, DateInput, DiscountBanks } from "./RiskHelpers";
import { BgRadioInput, DDInput } from "../LCSteps/helpers";
import { getAllPortData, getPorts } from "@/services/apis/helpers.api";
import { useQuery } from "@tanstack/react-query";
import Period from "../RiskParticipation/Period";
import useLcIssuance from "@/store/issueance.store";
import { DatePicker } from "../helpers";

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
  let paymentTerms = watch("paymentTerms");
  let extraInfo = watch("extraInfo") || { days: 0, other: "" };
  const [isOthersSelected, setIsOthersSelected] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const lcExpiryDate = watch("lcPeriod.lcExpiry");
  const issuanceDate = watch("lcPeriod.date");
  const {
    shipmentPort,
    expectedDateDiscounting,
    startDate,
    expiryDate,
    expectedDateConfirmation,
    days,
  } = watch();

  const { data } = useLcIssuance();
  const initialExpectedDate: string =
    data["expectedDateConfirmation" as keyof typeof data];

  useEffect(() => {
    if (initialExpectedDate && !expectedDateConfirmation) {
      setValue("expectedDateConfirmation", new Date(initialExpectedDate));
    }
  }, [data, initialExpectedDate]);

  const { data: portsData } = useQuery({
    queryKey: ["port-countries"],
    queryFn: () => getAllPortData(),
  });
  useEffect(() => {
    const fetchPorts = async () => {
      const { success, response } = await getPorts(shipmentPort?.country);
      if (success) setPorts(response[0]?.ports);
      else setPorts([]);
    };

    shipmentPort?.country && fetchPorts();
  }, [shipmentPort?.country]);

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
  const [dayss, setDays] = useState<number | string>();

  useEffect(() => {
    if (watch("paymentTerms") !== "Tenor LC") {
      setValue("days", undefined);
    } else {
      setValue("days", dayss);
    }
  }, [watch("paymentTerms")]);

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
      <div className="flex items-center justify-between gap-x-3 w-full">
        <div className="border border-borderCol py-3 px-2 rounded-md w-full min-h-40 h-44 bg-[#F5F7F9]">
          <p className="font-semibold ml-3 text-sm mb-2">LC Expiry Date</p>
          <Period setValue={setValue} watch={watch} isRisk={true} />
          <DatePicker
            value={lcExpiryDate}
            placeholder="LC Expiry Date"
            disabled={{ before: new Date() }}
            extraClassName="h-14 bg-white opacity-1"
            leftText={false}
            name={`lcPeriod.lcExpiry`}
            setValue={setValue}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-x-3 w-full my-4">
        <div className="rounded-md border border-borderCol bg-[#F5F7F9] px-2 py-3 w-full">
          <h5 className="ml-3 text-sm font-semibold">Payment Terms</h5>
          <div className="mt-2 flex w-full flex-wrap items-center gap-x-3 xl:flex-nowrap">
            <BgRadioInput
              id="payment-sight"
              label="Sight LC"
              name="paymentTerms"
              value="Sight LC"
              register={register}
              checked={paymentTerms === "Sight LC"}
            />
            <BgRadioInput
              id="payment-usance"
              label="Usance LC"
              name="paymentTerms"
              value="Usance LC"
              register={register}
              checked={paymentTerms === "Usance LC"}
            />
            <BgRadioInput
              id="payment-deferred"
              label="Deferred LC"
              name="paymentTerms"
              value="Deferred LC"
              register={register}
              checked={paymentTerms === "Deferred LC"}
            />
            <BgRadioInput
              id="payment-upas"
              label="UPAS LC (Usance payment at sight)"
              name="paymentTerms"
              extraClassName="h-14"
              value="UPAS LC"
              register={register}
              checked={paymentTerms === "UPAS LC"}
            />
          </div>
          {/* Days input */}
          {paymentTerms && paymentTerms !== "Sight LC" && (
            <>
              <div className="my-3 ml-2 flex items-center gap-x-2">
                <div className="flex items-center border-b-2 border-black">
                  <input
                    placeholder="enter days"
                    inputMode="numeric"
                    name="days"
                    type="number"
                    value={days === 0 ? "" : days} // Conditional rendering to display empty input when days is 0
                    className="max-w-[150px] border-none bg-[#F5F7F9] text-sm text-lightGray outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    onChange={(e: any) => {
                      const value = e.target.value;
                      if (value === "" || Number(value) <= 999) {
                        setDays(value === "" ? 0 : Number(value));
                        setValue(
                          "extraInfo.days",
                          value === "" ? 0 : Number(value)
                        );
                      }
                    }}
                  />
                  <div className="flex items-center gap-x-1">
                    <button
                      type="button"
                      className="center mb-2 size-6 rounded-sm border border-para"
                      onClick={() => {
                        if (days >= 999) return;
                        else {
                          const newDays = Number(days) + 1;
                          setDays(newDays);
                          setValue("extraInfo.days", newDays);
                        }
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="center mb-2 size-6 rounded-sm border border-para"
                      onClick={() => {
                        if (days > 1) {
                          const newDays = Number(days) - 1;
                          setDays(newDays);
                          setValue("extraInfo.days", newDays);
                        } else {
                          setDays(0); // Reset to 0 if it's below 1
                          setValue("extraInfo.days", 0);
                        }
                      }}
                    >
                      -
                    </button>
                  </div>
                </div>
                <p className="font-semibold">days from</p>
              </div>
              <div className="flex items-center justify-between gap-x-3">
                <BgRadioInput
                  id="payment-shipment"
                  label="BL Date/Shipment Date"
                  name="extraInfo.other"
                  value="shipment date"
                  register={register}
                  checked={extraInfo.other === "shipment date"}
                />
                <BgRadioInput
                  id="payment-acceptance"
                  label="Acceptance Date"
                  name="extraInfo.other"
                  value="acceptance date"
                  register={register}
                  checked={extraInfo.other === "acceptance date"}
                />
              </div>
              <div className="flex items-center justify-between gap-x-3">
                <BgRadioInput
                  id="payment-negotiation"
                  label="Negotiation Date"
                  name="extraInfo.other"
                  value="negotiation date"
                  register={register}
                  checked={extraInfo.other === "negotiation date"}
                />
                <BgRadioInput
                  id="payment-invoice"
                  label="Invoice Date"
                  name="extraInfo.other"
                  value="invoice date"
                  register={register}
                  checked={extraInfo.other === "invoice date"}
                />
                <BgRadioInput
                  id="payment-extra-sight"
                  label="Sight"
                  name="extraInfo.other"
                  value="sight"
                  register={register}
                  checked={extraInfo.other === "sight"}
                />
              </div>
              <div
                className={`mb-2 flex w-full items-end gap-x-5 rounded-md border border-borderCol bg-white px-3 py-4 ${
                  isOthersSelected && "!bg-[#EEE9FE]"
                }`}
              >
                <label
                  htmlFor="payment-others"
                  className="flex items-center gap-x-2 text-sm text-lightGray"
                >
                  <input
                    type="radio"
                    value="others"
                    id="payment-others"
                    checked={isOthersSelected} // Control radio button with the new state
                    onChange={() => {
                      setIsOthersSelected(true); // Set "Others" as selected
                      setValue("extraInfo.other", ""); // Clear the previous value in form state
                      setOtherValue(""); // Clear the local otherValue input
                    }}
                    className="size-4 accent-primaryCol"
                  />
                  Others
                </label>
                <input
                  type="text"
                  name="othersTextInput"
                  value={otherValue}
                  disabled={!isOthersSelected} // Enable only when "Others" is selected
                  onChange={(e: any) => {
                    setOtherValue(e.target.value); // Update the local state
                    setValue("extraInfo.other", e.target.value); // Set the typed value in form state
                  }}
                  className="w-[80%] rounded-none !border-b-2 border-transparent !border-b-neutral-300 bg-transparent text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </>
          )}
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
              value={shipmentPort?.country}
              placeholder="Select a country"
              setValue={setValue}
              data={portCountries}
              disabled={portCountries.length <= 0}
              flags={flags}
            />
            <DDInput
              id="shipmentPort.port"
              label="Port"
              value={shipmentPort?.port}
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
            checked={watch("transhipment") === "yes"}
            register={register}
          />
          <BankRadioInput
            id="shipment-no"
            label="No"
            name="transhipment"
            value="no"
            checked={watch("transhipment") === "no"}
            register={register}
          />
        </div>
      </div>
      <div className="border border-borderCol pt-3 px-2 rounded-md w-full bg-[#F5F7F9] mt-3.5">
        <p className="text-sm font-semibold mb-2 ml-3">Product Description</p>
        <textarea
          name="productDescription"
          rows={2}
          {...register("productDescription")}
          placeholder="Enter the description of the product"
          className="bg-white text-sm border h-20 border-borderCol resize-none w-full py-1 px-3 rounded-lg outline-none"
        ></textarea>
      </div>
    </div>
  );
};
