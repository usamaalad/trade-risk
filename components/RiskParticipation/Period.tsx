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
}: {
  watch: any;
  setValue: any;
}) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);

  const lcPeriodType = watch("period.expectedDate");
  const lcStartDate = watch("period.startDate");

  useEffect(() => {
    if (lcStartDate) {
      setStartDate(new Date(lcStartDate));
    }
  }, [lcStartDate]);

  const handleRadioChange = (e: any) => {
    setValue("period.expectedDate", e.target.value);
  };

  const updateValue = (name: string, value: any) => {
    setValue(name, value);
    setValue("lastDateOfReceivingBids", undefined);
  };

  return (
    <div className="flex gap-y-4 items-center justify-between border border-borderCol rounded-md py-2 px-3 mb-3 bg-white">
      <div className="flex items-center gap-x-4">
        <div className="w-full rounded-md flex items-center gap-x-2">
          <input
            type="radio"
            id="date-lc-issued"
            className="accent-primaryCol size-4"
            name="period.expectedDate"
            value="yes"
            checked={lcPeriodType === "yes" || lcPeriodType === true}
            onChange={handleRadioChange}
          />
          <label
            htmlFor="date-lc-issued"
            className="text-sm text-lightGray font-normal"
          >
            Date LC Issued
          </label>
        </div>
        <div className="w-full rounded-md flex items-center gap-x-2">
          <input
            type="radio"
            id="expected-date"
            className="accent-primaryCol !bg-white size-4"
            name="period.expectedDate"
            value="no"
            checked={lcPeriodType === "no" || lcPeriodType === false}
            onChange={handleRadioChange}
          />
          <label
            htmlFor="expected-date"
            className="text-sm text-lightGray font-normal"
          >
            Expected date of LC issuance
          </label>
        </div>
      </div>
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={`w-fit justify-start text-left font-normal border-none ${
              lcStartDate ? "text-black" : "text-[#B5B5BE] "
            }`}
            id="period-lc-date"
            disabled={!lcPeriodType}
          >
            {lcStartDate ? (
              format(new Date(lcStartDate), "PPP")
            ) : (
              <span>DD/MM/YYYY</span>
            )}
            <CalendarIcon className="ml-2 mr-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          {lcPeriodType === "yes" ? (
            <ValidatingCalendar
              initialDate={startDate}
              onChange={(date) => {
                updateValue("period.startDate", date);
                setStartDate(date);
              }}
              onClose={() => setDatePopoverOpen(false)}
              isPast
            />
          ) : (
            <ValidatingCalendar
              initialDate={lcStartDate}
              onChange={(date) => {
                updateValue("period.startDate", date);
                setStartDate(date);
              }}
              onClose={() => setDatePopoverOpen(false)}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
