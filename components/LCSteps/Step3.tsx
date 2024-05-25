"use client";
import { DDInput } from "./helpers";
import { Plus, X } from "lucide-react";
import { Period, Transhipment } from "./Step3Helpers";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "@/services/apis/helpers.api";
import { useEffect, useState } from "react";

export const Step3 = ({
  register,
  setValue,
  getValues,
  countries,
  flags,
  valueChanged,
  setValueChanged,
  setStepCompleted,
}: {
  register: any;
  setValue: any;
  getValues: any;
  countries: string[];
  flags: string[];
  valueChanged?: boolean;
  setValueChanged?: any;
  setStepCompleted?: any;
}) => {
  const [showAdvisingBank, setShowAdvisingBank] = useState(false);
  const [showConfirmingBank, setShowConfirmingBank] = useState(false);

  let issuingCountry = getValues("issuingBank.country");
  let issuingBank = getValues("issuingBank.bank");
  let advisingCountry = getValues("advisingBank.country");
  let advisingBank = getValues("advisingBank.bank");
  let confirmingCountry = getValues("confirmingBank.country");
  let confirmingBank = getValues("confirmingBank.bank");
  let confirming2Country = getValues("confirmingBank2.country");
  let confirming2Bank = getValues("confirmingBank2.bank");
  let expectedDate = getValues("lcPeriod.expectedDate");
  let startDate = getValues("lcPeriod.startDate");
  let endDate = getValues("lcPeriod.endDate");
  let productDescription = getValues("productDescription");

  useEffect(() => {
    issuingCountry = getValues("issuingBank.country");
    confirmingCountry = getValues("confirmingBank.country");
    advisingCountry = getValues("advisingBank.country");
    confirming2Country = getValues("confirmingBank2.country");
    expectedDate = getValues("lcPeriod.expectedDate");
  }, [valueChanged]);

  useEffect(() => {
    if (
      issuingCountry &&
      issuingBank &&
      confirmingBank &&
      confirmingCountry &&
      startDate &&
      endDate &&
      expectedDate &&
      productDescription
    ) {
      setStepCompleted(2, true);
    }
  }, [valueChanged]);

  const { data: issuingBanks } = useQuery({
    queryKey: ["issuing-banks", issuingCountry],
    queryFn: () => getBanks(issuingCountry),
    enabled: !!issuingCountry,
  });

  const { data: confirmingBanks } = useQuery({
    queryKey: ["confirming-banks", confirmingCountry],
    queryFn: () => getBanks(confirmingCountry),
    enabled: !!confirmingCountry,
  });

  const { data: advisingBanks } = useQuery({
    queryKey: ["advising-banks", advisingCountry],
    queryFn: () => getBanks(advisingCountry),
    enabled: !!advisingCountry,
  });

  return (
    <div
      id="step3"
      className="py-3 px-2 border border-borderCol rounded-lg w-full"
    >
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="text-sm size-6 rounded-full bg-primaryCol center text-white font-semibold">
          3
        </p>
        <p className="font-semibold text-[16px] text-lightGray">LC Details</p>
      </div>
      {/* Issuing Bank */}
      <div className="flex items-center justify-between w-full mb-3 gap-x-4">
        <div className="border border-borderCol rounded-md py-3 px-2 w-full bg-[#F5F7F9]">
          <p className="font-semibold mb-2 ml-3">Issuing Bank</p>
          <div className="flex flex-col gap-y-2">
            <DDInput
              placeholder="Select a country"
              label="Country"
              value={issuingCountry}
              id="issuingBank.country"
              data={countries}
              setValue={setValue}
              setValueChanged={setValueChanged}
              flags={flags}
            />
            <DDInput
              placeholder="Select bank"
              label="Bank"
              value={issuingBank}
              id="issuingBank.bank"
              setValue={setValue}
              setValueChanged={setValueChanged}
              disabled={
                !issuingBanks ||
                !issuingBanks?.success ||
                !issuingBanks?.response ||
                !issuingBanks.success
              }
              data={
                issuingBanks && issuingBanks.success && issuingBanks.response
              }
            />
          </div>
        </div>
        {showAdvisingBank ? (
          <div className="border border-borderCol rounded-md py-3 px-2 w-full bg-[#F5F7F9]">
            <div className="flex items-start justify-between">
              <p className="font-semibold mb-2 ml-3">Advising Bank</p>
              <p
                className="bg-red-500 center text-white rounded-full size-6 shadow-md z-10 cursor-pointer mb-1"
                onClick={() => setShowAdvisingBank(false)}
              >
                <X className="size-5 text-white" />
              </p>
            </div>
            <div className="flex flex-col gap-y-2">
              <DDInput
                placeholder="Select a country"
                label="Country"
                value={advisingCountry}
                id="advisingBank.country"
                data={countries}
                setValue={setValue}
                setValueChanged={setValueChanged}
                flags={flags}
              />
              <DDInput
                placeholder="Select bank"
                label="Bank"
                value={advisingBank}
                id="advisingBank.bank"
                setValue={setValue}
                setValueChanged={setValueChanged}
                disabled={
                  !advisingBanks ||
                  !advisingBanks?.success ||
                  !advisingBanks?.response ||
                  !advisingBanks.success
                }
                data={
                  advisingBanks &&
                  advisingBanks.success &&
                  advisingBanks.response
                }
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowAdvisingBank((prev: boolean) => !prev)}
            className="cursor-pointer center flex-col gap-y-2 border-4 border-borderCol border-dotted rounded-md w-full h-full min-h-40"
          >
            <div className="center border-2 border-black rounded-full">
              <Plus />
            </div>
            <p className="font-semibold">Add an Advising Bank</p>
          </div>
        )}
      </div>
      {/* Confirming Bank */}
      <div className="py-3 px-2 rounded-md border border-borderCol bg-[#F5F7F9]">
        <p className="font-semibold">Confirming Bank</p>
        <div className="flex items-center gap-x-3 w-full">
          <div className="flex items-center gap-x-2 w-full">
            <p className="font-semibold">1.</p>
            <DDInput
              label="Country"
              id="confirmingBank.country"
              placeholder="Select a Country"
              value={confirmingCountry}
              data={countries}
              setValue={setValue}
              setValueChanged={setValueChanged}
              flags={flags}
            />
          </div>
          <DDInput
            label="Bank"
            id="confirmingBank.bank"
            placeholder="Select bank"
            value={confirmingBank}
            setValue={setValue}
            setValueChanged={setValueChanged}
            disabled={
              !confirmingBanks ||
              !confirmingBanks?.response ||
              !confirmingBanks.success
            }
            data={
              confirmingBanks &&
              confirmingBanks.success &&
              confirmingBanks.response
            }
          />
        </div>

        {showConfirmingBank ? (
          <div className="relative flex items-center gap-x-3 w-full mt-3">
            <div className="flex items-center gap-x-2 w-full">
              <p className="font-semibold">2.</p>
              <DDInput
                label="Country"
                id="confirmingBank2.country"
                placeholder="Select a Country"
                value={confirming2Bank}
                data={countries}
                setValue={setValue}
                setValueChanged={setValueChanged}
                flags={flags}
              />
            </div>
            <DDInput
              label="Bank"
              id="confirmingBank2.bank"
              placeholder="Select bank"
              value={confirming2Bank}
              setValue={setValue}
              setValueChanged={setValueChanged}
              disabled={
                !confirmingBanks ||
                !confirmingBanks.success ||
                !confirmingBanks?.response ||
                !confirmingBanks.success
              }
              data={
                confirmingBanks &&
                confirmingBanks.success &&
                confirmingBanks.response
              }
            />
            <div
              className="absolute top-3 -right-2 bg-red-500 center text-white rounded-full size-6 shadow-md z-10 cursor-pointer"
              onClick={() => setShowConfirmingBank(false)}
            >
              <X className="size-5 text-white" />
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowConfirmingBank((prev: boolean) => !prev)}
            className="cursor-pointer bg-white ml-4 center gap-x-3 border-2 border-dotted border-borderCol py-3 rounded-md mt-2"
          >
            <div className=" center p-1 border border-black rounded-full">
              <Plus className="size-4" />
            </div>
            <p className="text-sm text-lightGray">Add Confirming Bank</p>
          </div>
        )}
      </div>
      <Period
        setValue={setValue}
        getValues={getValues}
        countries={countries}
        flags={flags}
        valueChanged={valueChanged}
        setValueChanged={setValueChanged}
      />
      <Transhipment
        getValues={getValues}
        register={register}
        setValue={setValue}
        valueChanged={valueChanged}
      />
    </div>
  );
};
