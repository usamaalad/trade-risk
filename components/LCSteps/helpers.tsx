"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormRegister } from "react-hook-form";

export const RadioInput = ({
  id,
  label,
  name,
  value,
  register,
}: {
  id: string;
  label: string;
  name: string;
  value:string
  register: UseFormRegister<any>;
}) => {
  return (
    <label
      htmlFor={id}
      className="px-3 py-4 w-full rounded-md flex items-center gap-x-2 mb-2 border border-borderCol text-lightGray"
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

export const DDInput = ({
  id,
  label,
  placeholder,
  register,
}: {
  id: string;
  label: string;
  placeholder: string;
  register: UseFormRegister<any>;
}) => {
  const handleSelectChange = (value: string) => {
    console.log(value); // Log the selected value to the console
    register(id, { value: value }); // Register the selected value using react-hook-form
  };

  return (
    <label
      id={id}
      className="border border-borderCol p-1 px-3 rounded-md w-full flex items-center justify-between"
    >
      <p className="text-lightGray">{label}</p>
      <Select onValueChange={handleSelectChange}>
        <SelectTrigger
          id={id}
          className="w-fit border-none bg-transparent"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
          <SelectItem value="Pakistan">Pakistan</SelectItem>
        </SelectContent>
      </Select>
    </label>
  );
};

export const BgRadioInput = ({
  id,
  label,
  bg,
  name,
  value,
  register,
}: {
  id: string;
  label: string;
  name: string;
  value: string | boolean;
  bg?: boolean;
  register?: any;
}) => {
  console.log(name, "name");
  return (
    <label
      htmlFor={id}
      className={`px-3 py-4 w-full ${
        bg ? "bg-[#EEE9FE]" : "border border-borderCol"
      }  rounded-md flex items-center gap-x-2 mb-2 text-lightGray`}
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
