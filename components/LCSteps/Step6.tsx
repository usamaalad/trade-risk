import React from "react";
import { BgRadioInput, DDInput } from "./helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Step6 = ({
  title,
  isDiscount,
  isConfirmation,
  step,
  register,
}: {
  title: string;
  isDiscount?: boolean;
  isConfirmation?: boolean;
  step: number;
  register: any;
}) => {
  return (
    <div className="py-3 px-2 border border-borderCol rounded-lg w-full h-full">
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="size-6 rounded-full bg-primaryCol center text-white font-semibold">
          {step}
        </p>
        <p className="font-semibold text-lg text-lightGray">{title}</p>
      </div>
      {isDiscount && (
        <div className="border border-borderCol py-3 px-2 rounded-md mb-4">
          <p className="font-semibold ml-3 mb-2">Discount at sight</p>
          <BgRadioInput
            id="discount-yes"
            label="Yes"
            name="chargesAccount"
            value="beneficiary"
            register={register}
          />
          <BgRadioInput
            id="discount-no"
            label="No"
            name="chargesAccount"
            value="applicant"
            register={register}
            bg
          />
        </div>
      )}
      <div className="border border-borderCol py-3 px-2 rounded-md">
        <p className="font-semibold ml-3 mb-2">Charges on account of</p>
        <BgRadioInput
          id="account-beneficiary"
          label="Exporter/Supplier (Beneficiary)"
          name="confirmationCharges.behalfOf"
          value="Exporter"
          register={register}
          bg
        />
        <BgRadioInput
          id="account-importer"
          label="Importer (Applicant)"
          name="confirmationCharges.behalfOf"
          value="Importer"
          register={register}
        />
      </div>

      <div className="border border-borderCol py-3 px-2 rounded-md mt-5">
        <p className="font-semibold ml-3 mb-2">
          {isConfirmation ? "Expected charges" : "Expected pricing"}
        </p>
        {isDiscount && !isConfirmation && (
          <div className="mb-3">
            <DDInput
              id="select-base-rate"
              label="Select base rate"
              placeholder="Select Value"
              register={register}
            />
          </div>
        )}
        <label
          id="expected-pricing"
          className="border border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
        >
          <p className="text-lightGray">
            {isConfirmation ? "Per Annum(%)" : "Pricing Per Annum"}
          </p>
          <div className="flex items-center gap-x-2">
            <Button variant="ghost" className="bg-none border-none text-lg">
              -
            </Button>
            <Input
              // placeholder="Value (%)"
              type="number"
              name="pricePerAnnum"
              register={register}
              className="border-none outline-none focus-visible:ring-0 max-w-[100px] focus-visible:ring-offset-0"
            />
            <Button variant="ghost" className="bg-none border-none text-lg">
              +
            </Button>
          </div>
        </label>
      </div>
    </div>
  );
};
