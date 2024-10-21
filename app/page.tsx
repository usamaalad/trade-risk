"use client";
import { LineCharts, ProgressCharts } from "@/components/charts";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { RequestTable } from "@/components/shared/RequestTable";
import { Sidebar } from "@/components/shared/Sidebar";
import { useAuth } from "@/context/AuthProvider";
import { fetchAllLcs, fetchLcs } from "@/services/apis/lcs.api";
import { ApiResponse, ILcs } from "@/types/type";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

interface SearchParams {
  searchParams: {
    page: number;
    limit: number;
    search: string;
    filter: string;
  };
}

const HomePage = ({ searchParams }: SearchParams) => {
  const { page, limit, search, filter } = searchParams;
  const { user } = useAuth();
  const {
    isLoading,
    data,
  }: { data: ApiResponse<ILcs> | undefined; error: any; isLoading: boolean } =
    useQuery({
      queryKey: ["bid-status", page, limit, search, filter],
      queryFn: () =>
        fetchLcs({
          page,
          limit,
          search,
          filter,
          userId: user?.business?._id,
          draft: false,
        }),
      enabled: !!user?.business?._id,
      staleTime: 5 * 60 * 1000,
    });
  // console.log("fetching LCSSS", data);
  if (user && user.type !== "corporate") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout>
      <div className="flex w-full px-2 2xl:px-10">
        <div className="w-4/5 p-2 xl:p-4">
          <h2 className="mb-5 text-4xl font-semibold capitalize">Welcome</h2>
          {/* Charts */}
          <div className="mb-4 flex h-fit w-[80vw] flex-col gap-x-3 gap-y-4 xl:flex-row 2xl:w-full">
            <ProgressCharts title="Transactions Overview" />
            <LineCharts />
          </div>
          <RequestTable data={data} key={"Corporate"} isLoading={isLoading} />
        </div>
        <div className="w-[20vw]  /5 w-[1 00%] mb-5  sticky top-10 h-[88vh]">
          <Sidebar isBank={false} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
