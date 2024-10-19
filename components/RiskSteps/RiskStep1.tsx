"use client";
import { useEffect, useState } from "react";
import { BankRadioInput } from "./RiskHelpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ValidatingCalendar } from "../LCSteps/Step3Helpers";
import { format } from "date-fns";

interface Props {
  register: any;
  watch: any;
  setValue: any;
}

export const RiskStep1 = ({ register, watch, setValue }: Props) => {
  const [date, setDate] = useState<Date>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const transactionType = watch("transaction");

  return (
    <div className="py-4 pt-6 px-4 border border-borderCol rounded-lg w-full bg-white">
      <div className="flex items-center gap-x-2 ml-2 mb-3">
        <p className="size-6 text-sm rounded-full bg-[#255EF2] center text-white font-semibold">
          1
        </p>
        <p className="font-semibold text-[16px] text-lightGray">
          Please choose one of the following that describes this transaction
        </p>
      </div>
      <div className="flex items-center justify-between gap-x-2 w-full">
        <BankRadioInput
          id="risk-participation"
          label="Risk participation"
          name="transaction"
          value="Risk Participation"
          checked={transactionType === "Risk Participation"}
          register={register}
        />

        <label
          htmlFor="outright-sales"
          className={`pl-3 w-full transition-colors duration-100 ${
            watch("transaction") === "Outright Sales"
              ? "bg-[#DCE5FD]"
              : "border border-borderCol bg-white"
          } rounded-md flex items-center justify-between gap-x-3 mb-2 text-lightGray text-sm w-full`}
        >
          <div className="flex items-center gap-x-3 w-full">
            <input
              type="radio"
              id="outright-sales"
              name="transaction"
              value="Outright Sales"
              {...register("transaction")}
              disabled={true}
              checked={watch("transaction") === "Outright Sales"}
              className="accent-[#255EF2] size-4"
            />
            Outright sales
          </div>
          <div className="bg-[#F2F2F2] py-1.5 w-fit h-full">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  disabled
                  variant={"outline"}
                  className="w-fit justify-start text-left font-normal border-none text-[#B5B5BE] hover:bg-transparent text-sm bg-transparent"
                  id="period-expiry-date"
                >
                  {date ? format(date, "PPP") : <span>DD/MM/YYYY</span>}
                  <CalendarIcon className="ml-2 mr-2 size-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <ValidatingCalendar
                  initialDate={date}
                  onChange={(date) => {
                    setDate(date);
                    // setValue("lcPeriod.endDate", date);
                  }}
                  onClose={() => setIsPopoverOpen(false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </label>
      </div>
      {watch("transaction") === "Outright Sales" && (
        <div className="px-2 pt-2 border border-borderCol rounded-lg w-full bg-[#F5F7F9]">
          <p className="font-semibold text-sm text-lightGray mb-2 ml-2">
            Outright Sales
          </p>

          <div className="flex items-center justify-between gap-x-2 w-full">
            <BankRadioInput
              id="pre-sales"
              label="Pre sales"
              name="outrightSales"
              value="Pre Sales"
              checked={watch("outrightSales") === "Pre Sales"}
              register={register}
            />
            <BankRadioInput
              id="asset-on-books"
              label="Asset on books"
              name="outrightSales"
              value="Assets On Books"
              checked={watch("outrightSales") === "Assets On Books"}
              register={register}
            />
          </div>
        </div>
      )}
    </div>
  );
};
