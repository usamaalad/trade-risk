import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { Check, ChevronDown } from "lucide-react";
import { Bank, Country } from "@/types/type";
import { bankCountries } from "@/utils/data";
import { getBanks, getCities } from "@/services/apis/helpers.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addRemoveBank } from "@/services/apis/user.api";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AddBank() {
  const { user } = useCurrentUser();
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryVal, setCountryVal] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [cityVal, setCityVal] = useState("");
  const queryClient = useQueryClient();

  const [bankOpen, setBankOpen] = useState(false);
  const [bankVal, setBankVal] = useState("");

  const [allCountries, setAllCountries] = useState<Country[]>(bankCountries);
  const [countries, setCountries] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [isoCode, setIsoCode] = useState("");
  const [cities, setCities] = useState([]);
  // State to store the currentBanks locally
  const [currentBanks, setCurrentBanks] = useState(
    user?.business?.currentBanks
  );

  useEffect(() => {
    setCurrentBanks(user?.business?.currentBanks);
  }, [user]);

  const { data: banks, isLoading: banksLoading } = useQuery({
    queryKey: ["banks", countryVal],
    queryFn: () => getBanks(countryVal),
    enabled: !!countryVal,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities", isoCode],
    queryFn: () => getCities(isoCode),
    enabled: !!isoCode,
  });

  useEffect(() => {
    // Set countries and flags from bankCountries
    const countryNames = bankCountries.map((country) => country.name);
    const countryFlags = bankCountries.map((country) => country.flag);
    setCountries(countryNames);
    setFlags(countryFlags);
  }, []);

  const setCountryCode = (selectedCountry: string) => {
    const country = allCountries.filter(
      (country: any) =>
        country.name.toLowerCase() == selectedCountry.toLowerCase()
    );
    setIsoCode(country[0].isoCode);
  };

  useEffect(() => {
    if (citiesData && citiesData.response && citiesData.response.length > 0) {
      const fetchedCitites = citiesData?.response?.map((city: any) => {
        return city.name;
      });
      setCities(fetchedCitites);
    }
  }, [citiesData, isoCode]);

  const handleBank = async () => {
    if (!countryVal || !bankVal || !cityVal)
      return toast.error("Please fill all fields");
    const newBank = {
      name: bankVal,
      country: countryVal,
      city: cityVal,
    };
    const updatedBanks = [...currentBanks, newBank];
    setCurrentBanks(updatedBanks);
    const { success } = await addRemoveBank(updatedBanks);

    if (!success) return toast.error("Failed to add bank");
    toast.success("Bank added successfully");
    setCountryVal("");
    setBankVal("");
    setCityVal("");
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
  };

  return (
    <div className="flex gap-3 border-[#E2E2EA] border rounded-lg p-2 mt-1 flex-col w-full">
      <h1 className="text-md font-bold text-[#44444f]">Add Bank</h1>
      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={countryOpen}
            className="font-roboto capitalize w-full justify-between font-normal py-3"
          >
            {countryVal
              ? countries?.find(
                  (country: string) =>
                    country.toLowerCase() === countryVal.toLowerCase()
                )
              : "Country"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className="font-roboto">
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="w-[600px]">
              {countries &&
                countries.length > 0 &&
                countries.map((country: string, idx: number) => (
                  <CommandItem
                    key={country}
                    value={country}
                    onSelect={(currentValue) => {
                      setCountryVal(
                        currentValue.toLowerCase() === countryVal.toLowerCase()
                          ? ""
                          : currentValue
                      );
                      setCountryCode(currentValue);
                      setBankVal("");
                      setCityVal("");
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
                    <span className="mr-2">{flags[idx]}</span>
                    {country}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {/* bank */}
      <Popover open={cityOpen} onOpenChange={setCityOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={cityOpen}
            className="capitalize font-roboto w-full justify-between font-normal py-3"
            disabled={countryVal === ""}
          >
            {cityVal ? cityVal : countryVal ? "city" : "city"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0">
          <Command className="font-roboto">
            <CommandInput placeholder="Search city..." />
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {cities &&
                cities.length > 0 &&
                cities.map((city: string) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={(currentValue) => {
                      setCityVal(
                        currentValue.toLowerCase() === cityVal.toLowerCase()
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
      <Popover open={bankOpen} onOpenChange={setBankOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={bankOpen}
            className="capitalize font-roboto w-full justify-between truncate font-normal py-3"
            disabled={countryVal === ""}
          >
            {bankVal
              ? banks?.response.find(
                  (bank: string) => bank.toLowerCase() === bankVal.toLowerCase()
                )
              : "bank"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0">
          <Command className="font-roboto">
            <CommandInput placeholder="Search bank..." />
            <CommandEmpty>No bank found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {!banksLoading &&
                banks &&
                banks.success &&
                banks?.response.map((bank: string) => (
                  <CommandItem
                    key={bank}
                    value={bank}
                    onSelect={(currentValue) => {
                      setBankVal(
                        currentValue.toLowerCase() === bankVal.toLowerCase()
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
      <Button
        className="bg-[#F5F7F9] text-[#92929D] hover:bg-[#d9dcdf] disabled:bg-[#d9dcdf23]"
        onClick={handleBank}
        disabled={!countryVal || !bankVal || !cityVal}
      >
        Add Bank
      </Button>
    </div>
  );
}
