import React from "react";
import { Input } from "../ui/input";
import { DDInput } from "../LCSteps/helpers";

interface Props {
  register: any;
  countries: string[];
  flags: string[];
  setValue: any;
  watch: any;
}

export const RiskStep5 = ({
  register,
  countries,
  flags,
  setValue,
  watch,
}: Props) => {
  const { exporterInfo } = watch();
  return (
    <div className="py-4 pt-6 px-4 border border-borderCol rounded-lg w-full bg-white">
      <div className="flex items-center gap-x-2 ml-2 mb-3">
        <p className="size-6 rounded-full bg-[#255EF2] center text-white font-semibold text-sm">
          5
        </p>
        <p className="font-semibold text-[16px] text-lightGray">
          Exporter Info
        </p>
      </div>
      <div className="flex items-center justify-between gap-x-2 flex-wrap xl:flex-nowrap w-full">
        <label
          id="name"
          className="border border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
        >
          <p className="w-full text-lightGray text-sm">Name of Beneficiary</p>
          <Input
            type="text"
            inputMode="text"
            name="exporterInfo.name"
            register={register}
            value={exporterInfo?.beneficiaryName}
            className="text-sm block bg-none text-end border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]"
            placeholder="Enter name"
          />
        </label>
        <DDInput
          placeholder="Select a country"
          label="Country of Export"
          id="exporterInfo.countryOfExport"
          value={exporterInfo?.countryOfExport}
          data={countries}
          setValue={setValue}
          flags={flags}
        />
        <DDInput
          placeholder="Select a country"
          label="Beneficiary Country"
          id="exporterInfo.beneficiaryCountry"
          value={exporterInfo?.beneficiaryCountry}
          data={countries}
          setValue={setValue}
          flags={flags}
        />
      </div>
    </div>
  );
};
