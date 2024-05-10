"use client";
import CorporateStepLayout from "@/components/layouts/CorporateStepLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useRegisterStore, { getStateValues } from "@/store/register.store";
import { onRegister } from "@/services/apis";
import { toast } from "sonner";
import { getBanks, getCities, getCountries } from "@/services/apis/helpers.api";
import { useQuery } from "@tanstack/react-query";
import useLoading from "@/hooks/useLoading";

interface Bank {
  country: string;
  name: string;
  city: string;
}

const CurrentBankingPage = () => {
  const router = useRouter();
  const setValues = useRegisterStore((state) => state.setValues);

  const corporateData =
    typeof window !== "undefined"
      ? localStorage.getItem("corporateData")
      : null;
  const productData =
    typeof window !== "undefined" ? localStorage.getItem("productData") : null;
  const contactData =
    typeof window !== "undefined" ? localStorage.getItem("contactData") : null;

  useEffect(() => {
    if (corporateData && productData && contactData) {
      const corporate = JSON.parse(corporateData);
      const product = JSON.parse(productData);
      const contact = JSON.parse(contactData);
      corporate && setValues(corporate);
      corporate && setValues({ productInfo: product });
      contact && setValues(contact);
    }
  }, [corporateData, productData, contactData]);

  const { startLoading, stopLoading, isLoading } = useLoading();
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryVal, setCountryVal] = useState("");

  const [cityOpen, setCityOpen] = useState(false);
  const [cityVal, setCityVal] = useState("");

  const [bankOpen, setBankOpen] = useState(false);
  const [bankVal, setBankVal] = useState("");

  const { data: countries, isLoading: countriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
  });

  const { data: banks, isLoading: banksLoading } = useQuery({
    queryKey: ["banks", countryVal],
    queryFn: () => getBanks(countryVal),
    enabled: !!countryVal,
  });

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", countryVal],
    queryFn: () => getCities(countryVal),
    enabled: !!countryVal,
  });

  const [allBanks, setAllBanks] = useState<{ [country: string]: Bank[] }>({});

  const handleBankAdd = () => {
    if (!countryVal) return toast.error("Please select a country");
    if (!bankVal) return toast.error("Please select a bank");
    if (!cityVal) return toast.error("Please select a city");

    const newBank: Bank = {
      country: countryVal,
      name: bankVal,
      city: cityVal,
    };
    setAllBanks((prevBanks) => ({
      ...prevBanks,
      [countryVal]: [...(prevBanks[countryVal] || []), newBank],
    }));

    setCountryVal("");
    setBankVal("");
    setCityVal("");
  };

  const handleBankDelete = (country: string, index: number) => {
    setAllBanks((prevBanks) => ({
      ...prevBanks,
      [country]: prevBanks[country].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(allBanks).length === 0) {
      return toast.error("Please add at least one bank");
    }
    startLoading();
    const formattedBanks = Object.entries(allBanks).flatMap(
      ([country, banks]) =>
        banks.map((bank) => ({
          country,
          name: bank.name,
          city: bank.city,
        }))
    );
    // Submit the form
    const allData = getStateValues(useRegisterStore.getState());
    // Exclude unnecessary data
    const {
      confirmationLcs,
      discountingLcs,
      guaranteesCounterGuarantees,
      discountingAvalizedBills,
      avalizationExportBills,
      riskParticipation,
      ...data
    } = allData;

    const reqData = {
      ...data,
      role: "corporate",
      currentBanks: formattedBanks,
    };
    const { response, success } = await onRegister(reqData);
    console.log(response);
    stopLoading();
    if (!success) return toast.error(response);
    else {
      toast.success("Account Register successfully");
      router.push("/register/complete");
      localStorage.removeItem("corporateData");
      localStorage.removeItem("productData");
      localStorage.removeItem("contactData");
    }
  };

  return (
    <CorporateStepLayout
      step={3}
      title="Current Banking"
      text="Add the banks you currently use so that they can be notified of any requests you add. This list can also be edited later."
    >
      <div className="max-w-[800px] w-full shadow-md bg-white rounded-xl p-8 z-10 mt-5 flex flex-col gap-y-5">
        <h2 className="text-lg font-semibold">Add your current banks</h2>

        <div className="grid grid-cols-3 gap-x-3">
          {/* Inputs */}
          <div className="col-span-1 w-full flex flex-col gap-y-4">
            {/* Country Field */}
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-[230px] justify-between"
                >
                  {countryVal
                    ? countries?.response.find(
                        (country: string) =>
                          country.toLowerCase() === countryVal.toLowerCase()
                      )
                    : "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {!countriesLoading &&
                      countries &&
                      countries.success &&
                      countries?.response.map((country: string) => (
                        <CommandItem
                          key={country}
                          value={country}
                          onSelect={(currentValue) => {
                            setCountryVal(
                              currentValue.toLowerCase() ===
                                countryVal.toLowerCase()
                                ? ""
                                : currentValue
                            );
                            setCountryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              country.toLowerCase() === countryVal.toLowerCase()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Bank Field */}
            <Popover open={bankOpen} onOpenChange={setBankOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={bankOpen}
                  className="w-[230px] justify-between truncate"
                  disabled={countryVal === ""}
                >
                  {bankVal
                    ? banks?.response.find(
                        (bank: string) =>
                          bank.toLowerCase() === bankVal.toLowerCase()
                      )
                    : "Select bank..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search bank..." />
                  <CommandEmpty>No bank found.</CommandEmpty>
                  <CommandGroup>
                    {!banksLoading &&
                      banks &&
                      banks.success &&
                      banks?.response.map((bank: string) => (
                        <CommandItem
                          key={bank}
                          value={bank}
                          onSelect={(currentValue) => {
                            setBankVal(
                              currentValue.toLowerCase() ===
                                bankVal.toLowerCase()
                                ? ""
                                : currentValue
                            );
                            setBankOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              bank.toLowerCase() === bankVal.toLowerCase()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {bank}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* City Field */}
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="w-[230px] justify-between"
                  disabled={countryVal === ""}
                >
                  {countryVal
                    ? cities?.response.find(
                        (city: string) =>
                          city.toLowerCase() === cityVal.toLowerCase()
                      )
                    : "Select city..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {!citiesLoading &&
                      cities &&
                      cities.success &&
                      cities?.response.map((city: string) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            setCityVal(
                              currentValue.toLowerCase() ===
                                cityVal.toLowerCase()
                                ? ""
                                : currentValue
                            );
                            setCityOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              city.toLowerCase() === cityVal.toLowerCase()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {city}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              type="button"
              onClick={handleBankAdd}
              className="text-center font-semibold text-[16px] mt-4"
            >
              Add Bank
            </Button>
          </div>

          {/* Selected Details */}
          <div className="col-span-2 border border-borderCol rounded-md h-60 overflow-y-auto w-full grid grid-cols-2 gap-x-4 gap-y-3 px-3 py-3">
            {Object.keys(allBanks)
              .filter((country) => country !== "Pakistan")
              .map((country) => (
                <div key={country}>
                  <h3 className="font-normal text-[#44444F] w-full border-b border-b-neutral-400 mb-1 capitalize">
                    {country}
                  </h3>
                  <div className="flex flex-col gap-y-2">
                    {allBanks[country].map((bank, idx) => (
                      <div
                        key={`${bank}-${idx}`}
                        className="flex items-start gap-x-2"
                      >
                        <X
                          onClick={() => handleBankDelete(country, idx)}
                          className="size-4 text-red-500 cursor-pointer"
                        />
                        <p className="text-[#44444F] text-sm capitalize">
                          {bank.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <Button
            type="button"
            className="disabled:bg-borderCol disabled:text-[#B5B5BE] bg-primaryCol hover:bg-primaryCol/90 text-[16px] rounded-lg"
            size="lg"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            Submit
          </Button>

          <Link
            href="/register/corporate/point-contact"
            className="text-center"
          >
            <Button
              type="button"
              variant="ghost"
              className="text-para text-[16px] w-full"
            >
              Previous
            </Button>
          </Link>
        </div>
      </div>
    </CorporateStepLayout>
  );
};

export default CurrentBankingPage;
