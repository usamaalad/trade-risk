"use client";
import { useEffect, useState } from "react";
import { AddBanksDialog } from "../helpers/AddBanksDialog";

export const RiskBanks = ({
  setValue,
  watch,
  countries,
  flags,
  register,
}: {
  setValue: any;
  watch: any;
  countries: any[];
  flags: any;
  register: any;
}) => {
  const [banksData, setBanksData] = useState<string[]>([]);
  const { banks } = watch();

  useEffect(() => {
    if (banks?.length > 0 && banksData?.length === 0) {
      setBanksData(banks);
    }
  }, [banks]);

  return (
    <div className="bg-white rounded-lg border border-borderCol py-4 px-4 flex items-center justify-between">
      <p className="text-lightGray font-semibold">
        Select banks you want to send your risk participation request
      </p>
      <AddBanksDialog
        countries={countries}
        flags={flags}
        setBanksData={setBanksData}
      />
    </div>
  );
};
