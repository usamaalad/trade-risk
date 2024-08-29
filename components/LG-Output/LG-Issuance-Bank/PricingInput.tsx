import React from "react";
import { BankData } from "../../../types/LGBankTypes";

interface PricingInputProps {
  pricingValue: string;
  setPricingValue: (value: string) => void;
  selectedBank?: string | undefined;
  bankData?: BankData;
  clientExpectedPrice?: string;
}

export const PricingInput: React.FC<PricingInputProps> = ({
  pricingValue,
  setPricingValue,
  selectedBank,
  bankData,
  clientExpectedPrice,
}) => {
  const getClientExpectedPrice = () => {
    if (bankData?.expectedPrice) {
      return (
        "Client's Expected Price: " + bankData.pricePerAnnum + "% Per Annum"
      );
    } else {
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^\d.]/g, "");
    if (newValue !== "" && !isNaN(parseFloat(newValue))) {
      newValue = Math.min(parseFloat(newValue), 100).toString();
    }
    setPricingValue(newValue);
  };

  const handleBlur = () => {
    if (pricingValue !== "" && !isNaN(parseFloat(pricingValue))) {
      setPricingValue(`${pricingValue}%`);
    }
  };

  return (
    <div className="mt-2 flex flex-col">
      <div className="flex justify-between">
        <h6 className="mb-1 text-sm font-bold">Enter your Pricing Below</h6>
        <h6 className="text-xs text-[#29C084]">{getClientExpectedPrice()}</h6>
      </div>
      <div className="mt-2 flex items-center rounded-md border border-[#E2E2EA] p-2">
        <input
          type="text"
          className="w-full p-1 pr-2 outline-none"
          placeholder="Enter your pricing (%)"
          value={pricingValue}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <h6 className="w-4/12 text-end text-sm text-gray-600">Per Annum</h6>
      </div>
    </div>
  );
};
