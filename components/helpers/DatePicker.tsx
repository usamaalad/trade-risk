"use client";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  register: UseFormRegister<T>;
}

export const DatePicker = <T extends FieldValues>({ register }: Props<T>) => {
  const [date, setDate] = useState<Date>();

  const handleDate = (e) => {
    console.log(e);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date &&
              "text-muted-foreground flex items-center justify-between w-full"
          )}
          // id="validity"
        >
          {date ? format(date, "PPP") : <span>DD/MM/YYYY</span>}
          <CalendarIcon className="mr-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(e) => handleDate(e)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
