import { useState, useEffect } from "react";
import { Button } from "../ui/button"; // Your button component
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../ui/command";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getBanks, getCities } from "@/services/apis/helpers.api";
import { toast } from "sonner";
import { Country } from "@/types/type";
import { bankCountries } from "@/utils/data";

interface Bank {
  country: string;
  name: string;
  city: string;
  swiftCode: string;
}

export const AddBanksDialog = ({ setValue, watch }) => {
  const [countryVal, setCountryVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [bankVal, setBankVal] = useState("");
  const [swiftCodeVal, setSwiftCodeVal] = useState("");

  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const [isoCode, setIsoCode] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>(bankCountries);
  const [countries, setCountries] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);

  const banksData = watch("banks", []);

  // Fetch countries and flags
  useEffect(() => {
    const fetchedCountries = allCountries.map(
      (country: Country) => country.name
    );
    const fetchedFlags = allCountries.map((country: Country) => country.flag);
    setCountries(fetchedCountries);
    setFlags(fetchedFlags);
  }, []);

  // Group banks by country for display purposes
  const groupedBanks = banksData.reduce((acc: any, bank: Bank) => {
    if (!acc[bank.country]) {
      acc[bank.country] = [];
    }
    acc[bank.country].push(bank);
    return acc;
  }, {});

  // Set ISO code based on selected country
  const setCountryCode = (selectedCountry: string) => {
    const country = allCountries.find(
      (country: Country) =>
        country.name.toLowerCase() === selectedCountry.toLowerCase()
    );
    if (country) setIsoCode(country.isoCode);
  };

  // Handle country select
  const handleCountrySelect = (currentValue: string) => {
    setBankVal("");
    setCityVal("");
    setCountryVal(
      currentValue.toLowerCase() === countryVal.toLowerCase()
        ? ""
        : currentValue
    );
    setCountryCode(currentValue);
    setCountryOpen(false);
  };

  // Fetch banks based on selected country
  const { data: banks, isLoading: banksLoading } = useQuery({
    queryKey: ["banks", countryVal],
    queryFn: () => getBanks(countryVal),
    enabled: !!countryVal,
  });

  // Fetch cities based on ISO code
  const { data: citiesData } = useQuery({
    queryKey: ["cities", isoCode],
    queryFn: () => getCities(isoCode),
    enabled: !!isoCode,
  });

  // Set cities based on fetched data
  useEffect(() => {
    if (citiesData && citiesData.response) {
      const fetchedCities = citiesData.response.map((city: any) => city.name);
      setCities(fetchedCities);
    }
  }, [citiesData]);

  // Handle adding bank and use setValue from react-hook-form
  const handleBankAdd = () => {
    if (!countryVal) return toast.error("Please select a country");
    if (!bankVal) return toast.error("Please select a bank");
    if (!cityVal) return toast.error("Please select a city");
    if (!swiftCodeVal) return toast.error("Please enter a swift code");

    const newBank: Bank = {
      country: countryVal,
      name: bankVal,
      city: cityVal,
      swiftCode: swiftCodeVal,
    };

    // Use setValue to update the form's banks field
    setValue("banks", [...banksData, newBank]);
    setBankVal("");
    setSwiftCodeVal("");
    setCityVal("");
  };

  // Handle deleting a bank from the list
  const handleBankDelete = (index: number) => {
    const updatedBanksData = banksData.filter(
      (_: any, i: number) => i !== index
    );
    setValue("banks", updatedBanksData);
  };

  return (
    <Dialog>
      <DialogTrigger className="bg-[#F1F1F5] text-[#44444F] text-base px-3 h-12 rounded-md">
        Add Bank(s)
      </DialogTrigger>

      <DialogContent className="max-w-[800px] rounded-xl p-8 mt-5 flex flex-col gap-y-5">
        <DialogTitle>Add banks</DialogTitle>

        <div className="grid grid-cols-3 gap-x-3">
          <div className="col-span-1 w-full flex flex-col gap-y-4">
            {/* Country Field */}
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="font-roboto capitalize w-[230px] justify-between font-normal py-6"
                >
                  <span className="truncate w-full text-left">
                    {countryVal || "Select country*"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[230px] p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {countries.map((country: string, idx: number) => (
                      <CommandItem
                        key={country}
                        value={country}
                        onSelect={() => handleCountrySelect(country)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            country.toLowerCase() === countryVal.toLowerCase()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="mr-2">{flags[idx]}</span>
                        {country}
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
                  className="capitalize font-roboto w-[230px] justify-between font-normal py-6"
                  disabled={!countryVal}
                >
                  <span className="truncate w-full text-left">
                    {cityVal || "Select city*"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[230px] p-0">
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {cities.map((city: string) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => {
                          setCityVal(city);
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

            {/* Bank Field */}
            <Popover open={bankOpen} onOpenChange={setBankOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={bankOpen}
                  className="capitalize font-roboto w-[230px] justify-between truncate font-normal py-6"
                  disabled={!countryVal}
                >
                  <span className="truncate w-full text-left">
                    {bankVal || "Select bank*"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[230px] p-0">
                <Command>
                  <CommandInput placeholder="Search bank..." />
                  <CommandEmpty>No bank found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {!banksLoading &&
                      banks?.response.map((bank: string) => (
                        <CommandItem
                          key={bank}
                          value={bank}
                          onSelect={() => {
                            setBankVal(bank);
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

            {/* Swift Code Field */}
            <input
              value={swiftCodeVal}
              onChange={(e) => setSwiftCodeVal(e.target.value.toUpperCase())}
              placeholder="Add Swift Code"
              className="border p-2 w-[230px] rounded-md placeholder:text-sm py-3 text-sm px-3"
            />

            <Button
              variant="ghost"
              type="button"
              onClick={handleBankAdd}
              className="bg-[#F5F7F9] text-center font-semibold text-[16px] mt-2 py-6 w-[230px]"
            >
              Add Bank
            </Button>
          </div>
          {/* Selected Details */}
          <div className="font-roboto col-span-2 border border-borderCol rounded-md h-80 overflow-y-auto w-full grid grid-cols-2 gap-x-4 gap-y-3 px-3 py-3">
            {Object.keys(groupedBanks).map((country) => (
              <div key={country}>
                <h3 className="font-normal text-[#44444F] w-full border-b border-b-neutral-400 mb-1 capitalize">
                  {country}
                </h3>
                <div className="flex flex-col gap-y-2">
                  {groupedBanks[country].map((bank: Bank, idx: number) => (
                    <div
                      key={`${bank.name}-${idx}`}
                      className="flex items-start gap-x-2"
                    >
                      <X
                        onClick={() => handleBankDelete(idx)}
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
        <div className="flex items-center justify-around gap-5">
          <DialogClose asChild>
            <Button className="bg-[#29C084] w-1/2 h-12 text-white rounded-xl hover:bg-[#29C084]">
              Done
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="bg-[#F7F7F9] w-1/2 h-12 rounded-xl text-black hover:bg-[#F7F7F9]">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
