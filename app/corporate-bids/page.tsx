"use client";
import { useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BgRadioInput } from "@/components/LCSteps/helpers";
import { BankTable } from "@/components/shared/BankTable";
import { Sidebar } from "@/components/shared/Sidebar";
import { useAuth } from "@/context/AuthProvider";
import { fetchCorporateBids } from "@/services/apis/bids.api";
import { ApiResponse, IMyBids } from "@/types/type";
import { useQuery } from "@tanstack/react-query";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useForm } from "react-hook-form";

interface SearchParams {
  searchParams: {
    page: number;
    limit: number;
    filter: string;
    search: string;
  };
}

const CorporateBidsPage = ({ searchParams }: SearchParams) => {
  const { page, limit, filter, search } = searchParams;
  const mainOptions = [
    { id: "lg", label: "Letter of Guarantee" },
    { id: "lc", label: "Letter of Confirmation" },
  ];

  const subOptions = {
    lg: [
      { id: "LG 100% Cash Margin", label: "LG 100% Cash Margin" },
      {
        id: "LG Issuance within the country",
        label: "LG Issuance within the country",
      },
      {
        id: "LG Reissuance in another country",
        label: "LG Reissuance in another country",
      },
    ],
    lc: [
      { id: "LC Confirmation", label: "LC Confirmation" },
      { id: "LC Discounting", label: "LC Discounting" },
      {
        id: "LC Confirmation & Discounting",
        label: "LC Confirmation & Discounting",
      },
    ],
  };

  const { register, watch, setValue } = useForm({
    defaultValues: {
      mainSelection: "lg", // Default to "Letter of Guarantee"
      subSelection: subOptions.lg[0].id, // Default to the first sub-option of "Letter of Guarantee"
    },
  });

  const mainSelection = watch("mainSelection");
  const subSelection = watch("subSelection");
  const pathname = usePathname();
  const { user } = useAuth();

  const {
    isLoading,
    data,
  }: {
    data: ApiResponse<IMyBids> | undefined;
    isLoading: boolean;
  } = useQuery({
    queryKey: ["fetch-my-bids", page, limit, filter, search],
    queryFn: () =>
      fetchCorporateBids({
        page,
        limit,
        filter,
        search,
      }),
  });

  if (user && user.type !== "corporate") {
    redirect("/dashboard");
  }

  const params = useSearchParams();
  const router = useRouter();

  const handleFilter = (lcType: string) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set("filter", lcType.toString());
    queryParams.set("page", "1");

    const queryString = queryParams.toString();
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  useEffect(() => {
    handleFilter(subSelection);
  }, [subSelection]);

  // Effect to update the sub-selection when mainSelection changes
  useEffect(() => {
    if (mainSelection) {
      setValue("subSelection", subOptions[mainSelection][0].id); // Set the first sub-option dynamically
    }
  }, [mainSelection, setValue]);

  return (
    <DashboardLayout>
      <div className="flex w-full 2xl:px-10 px-2">
        <div className="w-4/5 p-4">
          <h2 className="text-4xl font-semibold mb-5">My Bids</h2>

          {/* Data Table */}
          <div className="bg-white rounded-md border border-borderCol px-4 py-4">
            {/* Main Selection Tabs */}
            <div className="flex items-center gap-x-5 mb-2">
              {mainOptions.map((option) => (
                <BgRadioInput
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  name="mainSelection"
                  value={option.id}
                  register={register}
                  checked={mainSelection === option.id}
                />
              ))}
            </div>
            <div className="flex items-center gap-x-5 mb-2">
              {mainSelection &&
                subOptions[mainSelection].map((option) => (
                  <BgRadioInput
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    name="subSelection"
                    value={option.id}
                    register={register}
                    checked={subSelection === option.id}
                  />
                ))}
            </div>
            <BankTable
              data={data}
              isLoading={isLoading}
              isCorporate={true}
              isRisk={false}
            />
          </div>
        </div>
        <div className="w-[20vw] max-w-[300px] sticky top-10 h-[80vh]">
          <Sidebar isBank={false} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CorporateBidsPage;
