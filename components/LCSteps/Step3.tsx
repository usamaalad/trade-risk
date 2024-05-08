"use client";
import { DDInput } from "./helpers";
import { Plus } from "lucide-react";
import { Period, Transhipment } from "./Step3Helpers";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "@/services/apis/helpers.api";

export const Step3 = ({ register, setValue, getValues, countries }: any) => {
  const issuingCountry = getValues("issuingBank.country");
  // console.log(issuingCountry);

  // const { data: banks, isLoading: banksLoading } = useQuery({
  //   queryKey: ["banks", issuingCountry],
  //   queryFn: () => getBanks(issuingCountry),
  //   enabled: !!issuingCountry,
  // });
  // console.log(banks);

  return (
    <div className="py-3 px-2 border border-borderCol rounded-lg w-full">
      <div className="flex items-center gap-x-2 ml-3 mb-3">
        <p className="size-6 rounded-full bg-primaryCol center text-white font-semibold">
          3
        </p>
        <p className="font-semibold text-lg text-lightGray">LC Details</p>
      </div>
      {/* Issuing Bank */}
      <div className="flex items-center justify-between w-full mb-3 gap-x-4">
        <div className="border border-borderCol rounded-md py-3 px-2 w-full bg-[#F5F7F9]">
          <p className="font-semibold mb-2 ml-3">Issuing Bank</p>
          <div className="flex flex-col gap-y-2">
            <DDInput
              placeholder="Select a country"
              label="Country"
              id="issuingBank.country"
              register={register}
              data={countries}
            />
            <DDInput
              placeholder="Select bank"
              label="Bank"
              id="issuingBank.bank"
              register={register}
              // disabled={!banks || !banks?.response || !banks.success}
              // data={banks?.response}
            />
          </div>
        </div>
        <div className="center flex-col gap-y-2 border-4 border-borderCol border-dotted rounded-md w-full h-full min-h-40">
          <div className="center border-2 border-black rounded-full">
            <Plus />
          </div>
          <p className="font-semibold">Add an Advising Bank</p>
        </div>
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
              register={register}
              data={countries}
            />
          </div>
          <DDInput
            label="Bank"
            id="confirmingBank.bank"
            placeholder="Select bank"
            register={register}
          />
        </div>

        <div className="center gap-x-3 border-2 border-dotted border-borderCol py-2 rounded-md mt-2">
          <div className="center p-1 border border-black rounded-full">
            <Plus className="size-4" />
          </div>
          <p className="text-sm text-lightGray">Add Confirming Bank</p>
        </div>
      </div>
      <Period register={register} setValue={setValue} />
      <Transhipment register={register} setValue={setValue} />
    </div>
  );
};
