"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountries } from "@/services/apis/helpers.api";
import { useQuery } from "@tanstack/react-query";

export const CountrySelect = ({
  setValue,
  name,
}: {
  setValue: any;
  name: string;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
  });

  return (
    <Select
      onValueChange={(value) => setValue(name, value, { shouldValidate: true })}
    >
      <SelectTrigger className="w-full py-5 px-4 text-gray-500">
        <SelectValue placeholder="Select Countries" />
      </SelectTrigger>
      <SelectContent>
        {!isLoading &&
          data &&
          data.response.length > 0 &&
          data?.response.map((country: string, idx: number) => (
            <SelectItem value={country} key={`${country}-${idx}`}>
              {country}
            </SelectItem>
          ))}
        <SelectItem value="India">India</SelectItem>
        <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
      </SelectContent>
    </Select>
  );
};
