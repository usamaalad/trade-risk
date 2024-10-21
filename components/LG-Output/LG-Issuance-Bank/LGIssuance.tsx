import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import { ApplicantQuery } from "./ApplicantQuery";
import { BankSelection } from "./BankSelection";
import { LgTypeSelection } from "./LgTypeSelection";
import { PricingInput } from "./PricingInput";
import { BidPreview } from "./BidPreview";
import {
  convertDateAndTimeToStringGMTNoTsx,
  convertDateToCommaString,
  formatAmount,
} from "@/utils";
import { submitLgBid } from "@/services/apis/lg.apis";
import { useAuth } from "@/context/AuthProvider";
import {
  getLgBondTotal,
  sortBanksAlphabetically,
  formatFirstLetterOfWord,
  LcLgInfo,
} from "../helper";
import { convertDateAndTimeToStringGMT } from "@/utils/helper/dateAndTimeGMT";

const groupBidsByBank = (
  bids: any[],
  issuingBanks: any[],
  bondTypes: any[]
) => {
  return bids.reduce((acc: any, bid: any) => {
    const bankData = issuingBanks.find((bank: any) => bank.bank === bid.bank);
    const bondData = bondTypes.find((bond: any) => bond.type === bid.bidType);

    if (!acc[bid.bank]) {
      acc[bid.bank] = {
        name: bid.bank,
        country: bankData?.country || "Unknown",
        lgTypes: [],
      };
    }

    const existingLgType = acc[bid.bank].lgTypes.find(
      (lgType: any) => lgType.type === bid.bidType
    );

    if (existingLgType) {
      existingLgType.price = bid.confirmationPrice;
      existingLgType.currency =
        bondData?.value?.currencyType || existingLgType.currency;
      existingLgType.amount =
        bondData?.value?.cashMargin || existingLgType.amount;
    } else {
      acc[bid.bank].lgTypes.push({
        type: bid.bidType,
        currencyType: bondData?.value?.currencyType || "-",
        amount: bondData?.value?.cashMargin || "-",
        price: bid.price,
        status: bid.status || "Pending",
      });
    }

    return acc;
  }, {});
};

const LGIssuanceDialog = ({ data }: { data: any }) => {
  const { user } = useAuth();
  const [selectedLgType, setSelectedLgType] = useState<string>("Bid Bond");
  const [selectedBank, setSelectedBank] = useState<string | undefined>();
  const [groupedBids, setGroupedBids] = useState<any>({});
  const [lastBankAndBondReached, setLastBankAndBondReached] = useState(false);
  const [userBidStatus, setUserBidStatus] = useState<any>({});
  const [userBid, setUserBid] = useState();
  const [pricingValue, setPricingValue] = useState<string>("");
  const [bondPrices, setBondPrices] = useState<{
    [bank: string]: { [bondType: string]: string | null };
  }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [sortedIssuingBanks, setSortedIssuingBanks] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newData: any) => submitLgBid(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bid-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-lcs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["single-lc"],
      });
      setShowPreview(true);
    },
  });

  const bondTypes = [
    { type: "Bid Bond", value: data.bidBond },
    { type: "Advance Payment Bond", value: data.advancePaymentBond },
    { type: "Performance Bond", value: data.performanceBond },
    { type: "Retention Money Bond", value: data.retentionMoneyBond },
    { type: "Other Bond", value: data.otherBond },
  ];

  const availableBondTypes = bondTypes.filter((bond) => bond.value?.Contract);

  const isBondExpired = (expiryDate: string | undefined) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    return expiry < now;
  };

  // Step 1: Automatically select the first valid (non-expired) bond
  useEffect(() => {
    const sorted = sortBanksAlphabetically(data.issuingBanks);
    setSortedIssuingBanks(sorted);

    // Automatically select the first valid bank and bond (non-expired)
    const firstValidBond = availableBondTypes.find(
      (bond) => !isBondExpired(bond.value?.lgExpiryDate)
    );
    setSelectedBank(sorted[0]?.bank);
    if (firstValidBond) {
      setSelectedLgType(firstValidBond.type);
    }
  }, [data.issuingBanks]);

  useEffect(() => {
    setPricingValue(bondPrices[selectedBank]?.[selectedLgType] || "");
  }, [selectedLgType, selectedBank, bondPrices]);

  useEffect(() => {
    const userBids = data.bids
      .filter((bid: any) => bid.createdBy === user?._id)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const mostRecentBid = userBids[0];
    setUserBid(mostRecentBid);

    if (mostRecentBid) {
      const groupedBidsWithBankData = groupBidsByBank(
        mostRecentBid.bids,
        sortedIssuingBanks,
        bondTypes
      );
      setGroupedBids(Object.values(groupedBidsWithBankData));
      setShowPreview(true);
    }

    const anotherBankBidAccepted = data.bids.some(
      (bid: any) => bid.status === "Accepted" && bid.createdBy !== user?._id
    );

    if (mostRecentBid && anotherBankBidAccepted) {
      setUserBidStatus({
        label: "Another Bank Bid Accepted",
        status: "Not Accepted",
      });
      setShowPreview(true);
    } else if (!mostRecentBid && anotherBankBidAccepted) {
      setUserBidStatus({
        label: "Bid Not Applicable",
        status: "Not Applicable",
      });
    } else if (mostRecentBid) {
      if (mostRecentBid.status === "Pending") {
        setUserBidStatus({
          label: `Bid Submitted on ${convertDateAndTimeToStringGMTNoTsx(
            mostRecentBid.createdAt
          )}`,
          status: "Pending",
        });
      } else if (mostRecentBid.status === "Accepted") {
        setUserBidStatus({
          label:
            "The Above rates against each guarantee and bank have been accepted and a swift message has been generated and sent to your bank.",
          status: "Accepted",
        });
      } else if (mostRecentBid.status === "Rejected") {
        setUserBidStatus({
          label: "Bid Rejected",
          status: "Rejected",
        });
      } else if (new Date(mostRecentBid.bidValidity) < new Date()) {
        setUserBidStatus({
          label: "Bid Expired",
          status: "Expired",
        });
      }
    }
  }, [data.bids, sortedIssuingBanks, user?._id]);

  const selectedBond = availableBondTypes.find(
    (bond) => bond.type === selectedLgType
  )?.value;

  const isLastBank = (bank: string) => {
    if (sortedIssuingBanks.length === 0) return false;
    return bank === sortedIssuingBanks[sortedIssuingBanks.length - 1].bank;
  };

  const isLastBond = (bondType: string) => {
    const nonExpiredBonds = availableBondTypes.filter(
      (bond) => !isBondExpired(bond.value?.lgExpiryDate)
    );
    return nonExpiredBonds[nonExpiredBonds.length - 1]?.type === bondType;
  };

  const anyPricingFilled = () => {
    return Object.values(bondPrices).some((bank) =>
      Object.values(bank).some(
        (price) => price !== null && price !== "" && price !== "0%"
      )
    );
  };

  const updateBondPrices = (newValue: string) => {
    setLastBankAndBondReached(false);
    setBondPrices((prev) => ({
      ...prev,
      [selectedBank!]: {
        ...prev[selectedBank!],
        [selectedLgType]: newValue || null,
      },
    }));
  };

  const handleSubmitOrNext = async (bidValidity: string) => {
    if (!selectedLgType || !selectedBank) return;

    const lastBank = isLastBank(selectedBank!);
    const lastBond = isLastBond(selectedLgType);

    // If the last bank and last bond are reached, and the last bond is expired, do not proceed further
    if (lastBank && lastBond && !lastBankAndBondReached) {
      if (
        isBondExpired(
          availableBondTypes.find((bond) => bond.type === selectedLgType)?.value
            ?.lgExpiryDate
        )
      ) {
        const { nextBankIndex, nextBondIndex } = findNextValidBond(0, 0); // Start from the beginning again
        setSelectedBank(sortedIssuingBanks[nextBankIndex].bank);
        setSelectedLgType(availableBondTypes[nextBondIndex].type);
        return;
      }

      setLastBankAndBondReached(true);
      return;
    }

    if (
      isLastBank(selectedBank!) &&
      isLastBond(selectedLgType) &&
      anyPricingFilled()
    ) {
      const newBids = Object.entries(bondPrices).flatMap(([bank, bonds]) =>
        Object.entries(bonds)
          .filter(([bondType, price]) => {
            if (!price || typeof price !== "string") return false;
            const parsedPrice = parseFloat(price.replace("%", ""));
            return !isNaN(parsedPrice) && parsedPrice > 0;
          })
          .map(([bondType, price]) => ({
            bank,
            bidType: bondType,
            price: parseFloat(price.replace("%", "")),
            perAnnum: true,
          }))
      );

      if (newBids.length > 0) {
        const groupedBidsWithBankData = await groupBidsByBank(
          newBids,
          sortedIssuingBanks,
          bondTypes
        );
        setGroupedBids(Object.values(groupedBidsWithBankData));

        const requestData = {
          bidType: "LG Re-issuance in another country",
          bidValidity: bidValidity,
          lc: data._id,
          bids: newBids,
        };
        if (!showPreview) {
          setShowPreview(true);
          return;
        }
        mutation.mutate(requestData);
        setShowPreview(true);
        return;
      }
    }

    // Find the next valid bond and bank
    const { nextBankIndex, nextBondIndex } = findNextValidBond(
      sortedIssuingBanks.findIndex((bank) => bank.bank === selectedBank),
      availableBondTypes.findIndex((bond) => bond.type === selectedLgType)
    );

    // Update the selected bond and bank
    setSelectedBank(sortedIssuingBanks[nextBankIndex].bank);
    setSelectedLgType(availableBondTypes[nextBondIndex].type);
    setPricingValue("");
  };

  // Helper function to find the next valid bond that is not expired
  const findNextValidBond = (bankIndex: number, bondIndex: number) => {
    let nextBankIndex = bankIndex;
    let nextBondIndex = bondIndex;
    let validBondFound = false;

    while (!validBondFound) {
      // Move to the next bond within the current bank
      nextBondIndex = (nextBondIndex + 1) % availableBondTypes.length;

      // If all bonds in the current bank are expired, move to the next bank
      if (nextBondIndex === 0) {
        nextBankIndex = (nextBankIndex + 1) % sortedIssuingBanks.length;
      }

      // Check if the current bond is expired, and stop the loop if a valid (non-expired) bond is found
      if (
        !isBondExpired(availableBondTypes[nextBondIndex]?.value?.lgExpiryDate)
      ) {
        validBondFound = true;
      }
      if (nextBankIndex === bankIndex && nextBondIndex === bondIndex) {
        break;
      }
    }

    return { nextBankIndex, nextBondIndex };
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  const beneficiaryDetails = [
    { label: "Beneficiary Name", value: data?.beneficiaryDetails?.name },
    { label: "Beneficiary Address", value: data?.beneficiaryDetails?.address },
    { label: "Beneficiary Country", value: data?.beneficiaryDetails?.country },
    {
      label: "Beneficiary Phone",
      value: data?.beneficiaryDetails?.phoneNumber,
    },
    { label: "Beneficiary City", value: data?.beneficiaryDetails?.city },
  ].filter((detail) => detail.value);

  const handleNewBid = () => {
    setShowPreview(false);
    setUserBidStatus({});
    setUserBid(null);
    setGroupedBids({});
    setPricingValue("");
    setBondPrices({});
    setSelectedBank(
      sortedIssuingBanks.length > 0 ? sortedIssuingBanks[0].bank : undefined
    );
    const firstValidBond = availableBondTypes.find(
      (bond) => !isBondExpired(bond.value?.lgExpiryDate)
    );
    if (firstValidBond) {
      setSelectedLgType(firstValidBond.type);
    }
  };

  return (
    <div className="mt-0 flex w-full h-full items-start justify-between overflow-y-scroll">
      <div className="flex-1 border-r-2 border-[#F5F7F9]">
        <div className="border-r-2 border-b-2  bg-[#F5F7F9] p-4 flex flex-col gap-3 border-[#F5F7F9]">
          <h5 className="text-[12px] text-[#696974]">
            Created at,{" "}
            {data.createdAt &&
              convertDateAndTimeToStringGMT({ date: data.createdAt })}
            , by{" "}
            <span className="text-blue-500">
              {formatFirstLetterOfWord(data?.applicantDetails?.company)}
            </span>
          </h5>
          <h3 className="text-[#92929D] text-base font-light">
            Total LG Amount Requested{" "}
            <span className="text-[20px] text-[#1A1A26] font-semibold">
              {data?.totalContractCurrency || "USD"}{" "}
              {formatAmount(getLgBondTotal(data))}
            </span>
          </h3>
        </div>
        <div className="ml-7 mr-1 mt-2">
          <LcLgInfo
            label="Applicant Name"
            value={data?.applicantDetails?.company}
          />
          {data.totalContractCurrency && data.totalContractValue && (
            <LcLgInfo
              label="Total Contract Value"
              value={
                `${data.totalContractCurrency} ${formatAmount(
                  data.totalContractValue
                )}` || null
              }
            />
          )}
          <LcLgInfo
            label="Last Date for Receiving Bids"
            value={
              convertDateToCommaString(data.lastDateOfReceivingBids) || null
            }
          />
          {data.purpose && (
            <LcLgInfo label="Purpose of LG" value={data.purpose || null} />
          )}

          <h2 className="my-2 text-xl font-semibold text-[#1A1A26]">
            Beneficiary Details
          </h2>

          {beneficiaryDetails.map((detail, index) => (
            <LcLgInfo
              key={index}
              label={detail.label}
              value={detail.value || "-"}
            />
          ))}

          <ApplicantQuery />
        </div>
      </div>

      {!showPreview ? (
        <div className="flex-1 p-3 pb-6 pr-4">
          {userBidStatus.status === "Not Applicable" ? (
            <div className="text-center text-lg font-semibold mt-[30%] text-[#696974]">
              {userBidStatus.label}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h5 className="font-semibold mt-3 text-xl">Submit your bid</h5>
              </div>
              <div className="mt-2 rounded-md border border-[#E2E2EA] p-2">
                <BankSelection
                  bankData={sortedIssuingBanks}
                  selectedBank={selectedBank}
                  setSelectedBank={setSelectedBank}
                />

                <div className="mt-2 rounded-md border border-[#E2E2EA] px-2 py-1">
                  {!data.otherBond?.Contract && (
                    <h3 className="mb-1 font-semibold">Select LG Type</h3>
                  )}

                  <LgTypeSelection
                    selectedLgType={selectedLgType}
                    setSelectedLgType={setSelectedLgType}
                    data={data}
                    bondPrices={bondPrices}
                    selectedBank={selectedBank}
                  />

                  {selectedBond && (
                    <>
                      <h3 className="mb-1 font-semibold mt-4">LG Details</h3>
                      {data.otherBond?.Contract && (
                        <LcLgInfo
                          label="LG Type"
                          value={data.otherBond.name || "-"}
                        />
                      )}
                      <LcLgInfo
                        label="Amount"
                        value={
                          `${selectedBond?.currencyType} ${formatAmount(
                            selectedBond?.cashMargin
                          )}` || null
                        }
                      />
                      <LcLgInfo
                        label="Expected Date of Issuance"
                        value={
                          selectedBond.expectedDate
                            ? convertDateToCommaString(
                                selectedBond.expectedDate
                              )
                            : null
                        }
                      />
                      <LcLgInfo
                        label="Expiry Date"
                        value={
                          selectedBond.lgExpiryDate
                            ? convertDateToCommaString(
                                selectedBond.lgExpiryDate
                              )
                            : null
                        }
                      />
                      {/* {selectedBond.expectedPricing && (
                        <LcLgInfo
                          label="Expected Price"
                          value={
                            selectedBond.expectedPricing
                              ? `${selectedBond.expectedPricing}%`
                              : null
                          }
                        />
                      )} */}
                      <LcLgInfo
                        label="LG Tenor"
                        value={
                          selectedBond?.lgTenor
                            ? `${selectedBond?.lgTenor?.lgTenorValue} ${
                                selectedBond?.lgTenor?.lgTenorValue === 1
                                  ? selectedBond?.lgTenor?.lgTenorType.substring(
                                      0,
                                      selectedBond?.lgTenor?.lgTenorType
                                        .length - 1
                                    )
                                  : selectedBond?.lgTenor?.lgTenorType
                              }`
                            : null
                        }
                      />
                      {selectedBond.attachments?.length > 0 && (
                        <LcLgInfo
                          label="LG Text Draft"
                          value={
                            selectedBond.attachments[0].userFileName.length > 20
                              ? `${selectedBond?.attachments[0].userFileName.slice(
                                  0,
                                  10
                                )}...${selectedBond.attachments[0].userFileName.slice(
                                  -7
                                )}`
                              : selectedBond.attachments[0].userFileName
                          }
                          link={selectedBond.attachments[0].url}
                        />
                      )}
                    </>
                  )}

                  <PricingInput
                    selectedBondPrice={selectedBond?.expectedPricing}
                    pricingValue={pricingValue}
                    setPricingValue={setPricingValue}
                    updateBondPrices={updateBondPrices} // Pass the update function
                    selectedBank={selectedBank}
                    bankData={data.expectedPrice}
                  />
                </div>

                <Button
                  onClick={() =>
                    handleSubmitOrNext(data.lastDateOfReceivingBids)
                  }
                  type="submit"
                  className={`mt-4 h-12 w-full ${
                    pricingValue && parseFloat(pricingValue) > 0
                      ? "bg-[#44C894] text-white hover:bg-[#44C894]"
                      : "bg-[#F1F1F5] text-black hover:bg-[#F1F1F5]"
                  } ${
                    lastBankAndBondReached &&
                    anyPricingFilled() &&
                    "bg-[#44C894] text-white hover:bg-[#44C894]"
                  }`}
                >
                  {lastBankAndBondReached && anyPricingFilled()
                    ? "Preview Bid"
                    : pricingValue && parseFloat(pricingValue) > 0
                    ? "Next"
                    : "Skip"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <BidPreview
          onBack={handleBack}
          handleSubmit={handleSubmitOrNext}
          bids={groupedBids}
          userBidStatus={userBidStatus}
          lastDateOfReceivingBids={data.lastDateOfReceivingBids}
          bidValidityDate={
            userBid ? convertDateToCommaString(userBid.bidValidity) : undefined
          }
          bidNumber={userBid ? userBid.bidNumber : undefined}
          handleNewBid={handleNewBid}
          allBondsFilled={Object.values(bondPrices).some((bank) =>
            Object.values(bank).every((price) => price !== null && price !== "")
          )}
          otherBond={data.otherBond}
        />
      )}
    </div>
  );
};

export default LGIssuanceDialog;
