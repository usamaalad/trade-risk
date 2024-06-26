"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { fetchNotifications } from "@/services/apis/notifications.api";
import { ApiResponse, INotifications } from "@/types/type";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

interface Props {
  searchParams: {
    page: number;
    limit: number;
  };
}

const NotificationsPage = ({ searchParams }: Props) => {
  const { page = 1, limit } = searchParams;

  const {
    isLoading,
    data,
  }: {
    data: ApiResponse<INotifications> | undefined;
    error: any;
    isLoading: boolean;
  } = useQuery({
    queryKey: ["fetch-notifications", page, limit],
    queryFn: () =>
      fetchNotifications({
        page: page,
        limit: 7,
      }),
  });

  console.log(data?.data, "NOTIFICATIONS");

  return (
    <DashboardLayout>
      <div className="w-full min-h-[70vh] px-16">
        {data?.data && data?.data?.length > 0 ? (
          <div className="flex justify-between w-full">
            <div className="flex gap-3 items-center">
              <h1 className="text-[28px] font-poppins font-medium">
                Notifications
              </h1>
              <span className="font-regular text-[#5625F2]">3 New</span>
            </div>
            <span className="font-medium font-[20px] text-[#5625F2]">
              Mark all as read
            </span>
          </div>
        ) : (
          <span className="font-roboto font-medium text-[20px]">
            No notifications yet!
          </span>
        )}
        <div className="mt-5 flex flex-col gap-3">
          {data?.data?.map((notification: INotifications) => {
            return (
              <div className="flex justify-between items-center w-full bg-[#EFEFF0] py-5 p-3 rounded-[8px]">
                <div className="flex gap-3 flex-col items-start">
                  <h1 className="text-[18px] font-poppins font-medium">
                    New LC Confirmation Request
                  </h1>
                  <p className="text-[14px] font-regular">
                    <span className="font-medium underline">Ref no 100930</span>{" "}
                    from National Bank of Egypt by{" "}
                    <span className="font-medium">
                      {" "}
                      Rional Massi Corporation{" "}
                    </span>
                  </p>{" "}
                </div>
                <Button>Add Bid</Button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
