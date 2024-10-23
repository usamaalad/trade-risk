import React, { useEffect } from "react";
import { BgRadioInput } from "../LCSteps/helpers";
import { LgStepsProps10 } from "@/types/lg";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { DatePicker } from "../helpers";
import { LG } from "@/utils";

const LgStep12: React.FC<LgStepsProps10> = ({
  register,
  watch,
  setValue,
  step,
  setStepCompleted,
}) => {
  const lgIssuance = watch("lgIssuance") || LG.reIssuanceInAnotherCountry;
  const lastDateOfReceivingBids = watch("lastDateOfReceivingBids");
  const lcEndDate = watch("period.endDate");
  const lcStartDate = watch("period.startDate");
  const riskStartDate = watch("lcPeriod.date");
  // Watch for the lgExpiryDate values of each bond
  const bidBondExpiryDate = watch("bidBond.lgExpiryDate");
  const performanceBondExpiryDate = watch("performanceBond.lgExpiryDate");
  const retentionMoneyBondExpiryDate = watch("retentionMoneyBond.lgExpiryDate");
  const advancePaymentBondExpiryDate = watch("advancePaymentBond.lgExpiryDate");
  const bidBondExpectedDate = watch("bidBond.expectedDate");
  const performanceBondExpectedDate = watch("performanceBond.expectedDate");
  const retentionMoneyBondExpectedDate = watch(
    "retentionMoneyBond.expectedDate"
  );
  const advancePaymentBondExpectedDate = watch(
    "advancePaymentBond.expectedDate"
  );
  const lgCashMarginExpectedDate = watch("lgDetails.expectedDateToIssueLg");
  const lgCashMarginExpiryDate = watch("lgDetails.lgExpiryDate");
  const riskExpiry = watch("lcPeriod.lcExpiry");

  // Utility to find the latest (maximum) date
  const findMaxDate = (...dates: (string | Date | undefined)[]) => {
    const validDates = dates
      .map((date) => (date ? new Date(date) : null))
      .filter((date) => date && !isNaN(date.getTime())); // Filter out invalid dates
    return validDates.length > 0
      ? new Date(Math.max(...validDates.map((d) => d!.getTime())))
      : null;
  };

  // Utility to find the earliest (minimum) date
  const findMinDate = (...dates: (string | Date | undefined)[]) => {
    const validDates = dates
      .map((date) => (date ? new Date(date) : null))
      .filter((date) => date && !isNaN(date.getTime())); // Filter out invalid dates
    return validDates.length > 0
      ? new Date(Math.min(...validDates.map((d) => d!.getTime())))
      : null;
  };

  const maxLgExpiryDate = findMaxDate(
    bidBondExpiryDate,
    performanceBondExpiryDate,
    retentionMoneyBondExpiryDate,
    advancePaymentBondExpiryDate,
    lgCashMarginExpiryDate,
    lcEndDate,
    riskExpiry
  );
  const minLgExpectedDate = findMinDate(
    bidBondExpectedDate,
    performanceBondExpectedDate,
    retentionMoneyBondExpectedDate,
    advancePaymentBondExpectedDate,
    lgCashMarginExpectedDate,
    lcStartDate,
    riskStartDate
  );
  return (
    <div
      id={`lastStep`}
      className="py-3 px-2 border border-borderCol rounded-lg w-full scroll-target"
    >
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="text-sm size-6 rounded-full bg-primaryCol center text-white font-semibold">
          {step || 10}
        </p>
        <p className="font-semibold text-[16px] text-lightGray">
          {lgIssuance === LG.cashMargin
            ? "Last date to receive bids from Bank"
            : "Last date for receiving bids"}
        </p>
      </div>

      <div className="flex items-center gap-3 border border-[#E2E2EA] bg-[#F5F7F9] pt-2 px-2 rounded-lg pb-2 p-4">
        <label
          id="expectedDate"
          className="border p-1 px-2 rounded-md w-[100%] flex items-center justify-between bg-white"
        >
          <DatePicker
            setValue={setValue}
            extraClassName="border-0"
            value={new Date(lastDateOfReceivingBids)}
            name={`lastDateOfReceivingBids`}
            // Pass the maximum lgExpiryDate to disable dates after it
            disabled={{
              before: minLgExpectedDate && minLgExpectedDate,
              after: maxLgExpiryDate && maxLgExpiryDate,
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default LgStep12;
