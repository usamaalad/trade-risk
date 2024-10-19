import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ValidatingCalendar } from "../LCSteps/Step3Helpers";

export default function Period({
  watch,
  setValue,
  isRisk = false,
  isConfirming = false,
}: {
  watch: any;
  setValue: any;
  isRisk?: boolean;
  isConfirming?: boolean;
}) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Determine field names based on props
  const dateTypeFieldName = isRisk
    ? "lcPeriod.dateType"
    : isConfirming
    ? "confirmingBank.dateType"
    : "period.expectedDate";
  const dateFieldName = isRisk
    ? "lcPeriod.date"
    : isConfirming
    ? "confirmingBank.date"
    : "period.startDate";

  const dateType = watch(dateTypeFieldName);
  const dateValue = watch(dateFieldName);

  useEffect(() => {
    if (dateValue) {
      setStartDate(new Date(dateValue));
    }
  }, [dateValue]);

  const handleRadioChange = (e: any) => {
    setValue(dateTypeFieldName, e.target.value);
  };

  const updateValue = (name: string, value: any) => {
    setValue(name, value);
    setValue("lastDateOfReceivingBids", undefined);
  };

  // Define radio options based on props
  const options = isRisk
    ? [
        {
          id: "date-lc-issued",
          value: "Date LC issued",
          label: "Date LC Issued",
        },
        {
          id: "expected-date-issue",
          value: "Expected date of LC issuance",
          label: "Expected date of LC issuance",
        },
      ]
    : isConfirming
    ? [
        {
          id: "date-lc-confirmed",
          value: "Date LC confirmed",
          label: "Date LC confirmed",
        },
        {
          id: "expected-date-confirm",
          value: "Expected date to confirm",
          label: "Expected date to confirm",
        },
      ]
    : [
        { id: "date-lc-issued", value: "yes", label: "Date LC Issued" },
        {
          id: "expected-date",
          value: "no",
          label: "Expected date of LC issuance",
        },
      ];

  // Normalize dateType for comparison
  const dateTypeNormalized = (() => {
    if (isRisk || isConfirming) return dateType;
    if (dateType === true) return "yes";
    if (dateType === false) return "no";
    return dateType;
  })();

  return (
    <div className="flex gap-y-4 items-center justify-between border border-borderCol rounded-md py-2 px-3 mb-3 bg-white">
      <div className="flex items-center gap-x-4">
        {options.map((option) => (
          <div
            key={option.id}
            className="w-full rounded-md flex items-center gap-x-2"
          >
            <input
              type="radio"
              id={option.id}
              className="accent-primaryCol size-4"
              name={dateTypeFieldName}
              value={option.value}
              checked={dateTypeNormalized === option.value}
              onChange={handleRadioChange}
            />
            <label
              htmlFor={option.id}
              className="text-sm text-lightGray font-normal"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={`w-fit justify-start text-left font-normal border-none ${
              dateValue ? "text-black" : "text-[#B5B5BE]"
            }`}
            id="period-lc-date"
            disabled={!dateType}
          >
            {dateValue ? (
              format(new Date(dateValue), "PPP")
            ) : (
              <span>DD/MM/YYYY</span>
            )}
            <CalendarIcon className="ml-2 mr-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <ValidatingCalendar
            initialDate={startDate}
            onChange={(date) => {
              updateValue(dateFieldName, date);
              setStartDate(date);
            }}
            onClose={() => setDatePopoverOpen(false)}
            isPast={
              dateTypeNormalized === "yes" ||
              dateTypeNormalized === "Date LC issued"
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
