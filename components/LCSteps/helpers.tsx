"use client";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { UseFormSetValue } from "react-hook-form";

export const DDInput = ({
  id,
  label,
  placeholder,
  data,
  value,
  disabled,
  setValue,
  flags,
}: {
  id: string;
  label: string;
  placeholder: string;
  value?: string;
  data?: string[];
  flags?: string[];
  disabled?: boolean;
  setValue: UseFormSetValue<any>;
}) => {
  const [ddOpen, setDdOpen] = useState(false);
  const [ddVal, setDdVal] = useState("");

  return (
    <label
      id={id}
      className="border text-sm border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between bg-white"
    >
      <p className="text-lightGray">{label}</p>
      <Popover open={ddOpen} onOpenChange={setDdOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={ddOpen}
            className={`capitalize w-fit border-none justify-between font-normal text-sm ${
              value ? "text-black" : "text-gray-500"
            }`}
            disabled={disabled}
          >
            {ddVal
              ? data?.find(
                  (country: string) =>
                    country.toLowerCase() === ddVal.toLowerCase()
                )
              : value
              ? value
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {data &&
                data.length > 0 &&
                data?.map((country: string, idx: number) => (
                  <CommandItem
                    key={`${country}-${idx}`}
                    value={country}
                    onSelect={(currentValue) => {
                      setDdVal(
                        currentValue.toLowerCase() === ddVal.toLowerCase()
                          ? ""
                          : currentValue
                      );
                      setDdOpen(false);
                      setValue(id, currentValue, { shouldValidate: true });
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        country.toLowerCase() === ddVal.toLowerCase()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {flags && (
                      <span className="mr-2 emoji-font">{flags[idx]}</span>
                    )}
                    {country}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </label>
  );
};

export const BgRadioInput = ({
  id,
  label,
  checked,
  name,
  value,
  register,
}: {
  id: string;
  label: string;
  name: string;
  value: string | boolean;
  checked: boolean;
  register?: any;
}) => {
  return (
    <label
      htmlFor={id}
      className={`px-3 py-4 w-full transition-colors duration-100 ${
        checked ? "bg-[#EEE9FE]" : "border border-borderCol bg-white"
      } rounded-md flex items-center gap-x-3 mb-2 text-lightGray text-sm `}
    >
      <input
        type="radio"
        id={id}
        value={value}
        {...register(name)}
        className="accent-primaryCol size-4"
      />
      {label}
    </label>
  );
};
