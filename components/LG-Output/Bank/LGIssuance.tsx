import React from "react";
import { Button } from "../../ui/button";

import { ApplicantQuery } from "./ApplicantQuery";
import { BankSelection } from "./BankSelection";
import { LgTypeSelection } from "./LgTypeSelection";
import { PricingInput } from "./PricingInput";
import { BidPreview } from "./BidPreview";
import { useBidStore } from "../../../store/LGBankBidStore";

const LGInfo = ({
  label,
  value,
  noBorder,
}: {
  label: string;
  value: string;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={`flex items-start justify-between py-2 ${
        !noBorder && "border-b border-b-borderCol"
      }`}
    >
      <p className="font-roboto text-sm font-normal text-para">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-semibold capitalize">
        {value}
      </p>
    </div>
  );
};

export const LGIssuanceDialog = (
  {
    // lcId,
  }: {
    // lcId: string;
  },
) => {
  const {
    selectedBank,
    selectedLgType,
    pricingValue,
    assignedValues,
    showPreview,
    allAssigned,
    bankData,
    setSelectedBank,
    setSelectedLgType,
    setPricingValue,
    setShowPreview,
    handleNext,
    handleSkip,
  } = useBidStore();

  const details = [
    { label: "Request Expiry Date:", value: "10 Oct,2024" },
    { label: "Purpose of LG:", value: "Best Electronics in Pakistan" },
    { label: "Beneficiary Name", value: "Nishat Group" },
    { label: "Beneficiary Country", value: "Pakistan" },
    { label: "Beneficiary Address", value: "7- Main Gulberg, Lahore, Punjab" },
    { label: "Beneficiary Phone", value: "+92 21 8726368" },
  ];

  const lgDetails = [
    { label: "Amount", value: "USD 20,000" },
    { label: "Expected Date of issuance", value: "October 11, 2024" },
    { label: "Expiry Date", value: "November 20, 2024" },
    { label: "LG Tenor", value: "12 Months" },
    { label: "LG Text Draft", value: "Draft.png" },
  ];

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  return (
    <>
      {/* Left Section */}
      <div className="border-r-2 border-[#F5F7F9]">
        {/* <div className="px-4 py-3 bg-[#F5F7F9]">
            <h2 className="text-2xl font-semibold mb-1">
              <span className="text-para font-normal">LC Amount:</span> USD{" "}
              {lcData && lcData.amount ? lcData.amount.price : "N/A"}
            </h2>
            <p className="font-roboto text-sm text-para">
              Created at,{" "}
              {lcData && convertDateAndTimeToString(lcData.createdAt)}, by{" "}
              <span className="text-text capitalize">
                {(lcData && lcData.exporterInfo?.beneficiaryName) ||
                  lcData?.createdBy?.name}
              </span>
            </p>
          </div> */}

        <div className="ml-7 mr-1 mt-2">
          {details.slice(0, 2).map((detail, index) => (
            <LGInfo key={index} label={detail.label} value={detail.value} />
          ))}

          <h2 className="my-2 text-2xl font-semibold text-[#1A1A26]">
            Beneficiary Details
          </h2>

          {details.slice(2).map((detail, index) => (
            <LGInfo key={index} label={detail.label} value={detail.value} />
          ))}

          <ApplicantQuery />
        </div>
      </div>

      {/* Right Section */}
      {!showPreview ? (
        <div className="overflow-y-auto pb-6 pr-4">
          {/* checking state if the state is being changed or not */}
          {/* <pre>{selectedBank}</pre>
            <pre>{JSON.stringify(bankData, null, 2)}</pre> */}

          <div className="flex items-center justify-between">
            <h5 className="font-bold">Submit your bid</h5>
            <div className="flex flex-col rounded-sm border border-[#E2E2EA] bg-[#F5F7F9] px-2 py-1">
              <h6 className="text-[0.85rem] text-[#ADADAD]">Created by:</h6>
              <h5 className="text-[0.95rem] font-semibold">James Hunt</h5>
            </div>
          </div>
          <div className="mt-2 rounded-md border border-[#E2E2EA] p-2">
            <BankSelection
              bankData={bankData}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
            />

            <div className="mt-2 rounded-md border border-[#E2E2EA] px-2 py-1">
              <h3 className="mb-1 font-bold">Select LG Type</h3>

              <LgTypeSelection
                selectedBank={selectedBank}
                bankData={bankData}
                selectedLgType={selectedLgType}
                setSelectedLgType={setSelectedLgType}
                assignedValues={assignedValues}
              />

              <h3 className="mb-1 font-bold">LG Details</h3>
              {lgDetails.map((detail, index) => (
                <LGInfo key={index} label={detail.label} value={detail.value} />
              ))}

              <PricingInput
                pricingValue={pricingValue}
                setPricingValue={setPricingValue}
                selectedBank={selectedBank}
                bankData={bankData}
              />
            </div>

            <Button
              onClick={
                pricingValue
                  ? handleNext
                  : allAssigned
                    ? handlePreview
                    : handleSkip
              }
              type="submit"
              className={`mt-4 h-12 w-full ${
                pricingValue
                  ? "bg-[#44C894] text-white hover:bg-[#44C894]"
                  : allAssigned
                    ? "bg-[#44C894] text-white hover:bg-[#44C894]"
                    : "bg-[#F1F1F5] text-black hover:bg-[#F1F1F5]"
              }`}
            >
              {pricingValue ? "Next" : allAssigned ? "Preview Bid" : "Skip"}
            </Button>
          </div>
        </div>
      ) : (
        <BidPreview
          assignedValues={assignedValues}
          bankData={bankData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default LGIssuanceDialog;
