import { getBidsCount } from "@/services/apis/bids.api";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../helpers";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Chart = ({
  value,
  bg,
  color,
  title,
  maxValue,
}: {
  value: number;
  color: string;
  bg: string;
  title: string;
  maxValue: number;
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((value / maxValue) * 100);
  }, [value, maxValue]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilter = () => {
    const filter =
      title === "accepted"
        ? "Accepted"
        : title === "rejected"
        ? "Rejected"
        : title === "expired" || title === "bids"
        ? "Expired"
        : title === "pending"
        ? "Pending"
        : "";
    const queryParams = new URLSearchParams(searchParams);
    queryParams.set("search", filter.toString());
    queryParams.set("page", "1");

    const queryString = queryParams.toString();
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  return (
    <div
      className="hover:shadow-xl rounded-lg pb-2 cursor-pointer"
      onClick={handleFilter}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <svg className="progress-ring" width="120" height="120">
            {/* Outer radius */}
            <circle
              className="progress-ring__circle"
              stroke={bg}
              strokeWidth="12"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            {/* Inner circle */}
            <circle
              className="progress-ring__circle progress-ring__circle--animated"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={
                circumference - (progress / 100) * circumference
              }
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
          </svg>
          <div className="progress-value text-4xl font-semibold">{value}</div>
        </div>
      </div>
      <p className="text-sm text-[#1A1A26] text-center">{title}</p>
    </div>
  );
};

interface Count {
  _id: string;
  count: number;
}

interface Count {
  _id: string;
  count: number;
}

export const ProgressCharts = ({
  title,
  isBank,
}: {
  title: string;
  isBank?: boolean;
}) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["fetch-bids-count"],
    queryFn: () => getBidsCount(),
  });
  // console.log(data);
  const [accepted, setAccepted] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [expired, setExpired] = useState(0);
  const [pending, setPending] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      const statusCounts = {
        Accepted: 0,
        Rejected: 0,
        Expired: 0,
        Pending: 0,
      };

      data.forEach((item: Count) => {
        // @ts-ignore
        statusCounts[item._id] = item.count;
      });

      setAccepted(statusCounts.Accepted);
      setRejected(statusCounts.Rejected);
      setExpired(statusCounts.Expired);
      setPending(statusCounts.Pending);

      // Calculate the maximum value
      const totalCount =
        statusCounts.Accepted +
        statusCounts.Rejected +
        statusCounts.Expired +
        statusCounts.Pending;
      setMaxValue(totalCount);
    }
  }, [data]);

  return (
    <div
      className="bg-white rounded-lg border border-borderCol py-4 px-5 
    xl:max-w-[525px] w-full max-h-[550px]"
    >
      <div className="flex items-center gap-x-2 justify-between mb-3 w-full">
        <div className="flex items-center gap-x-2">
          <h4 className="text-lg font-semibold">{title}</h4>
          <div className="size-4 rounded-full bg-[#B5B5BE] text-white text-[10px] center">
            i
          </div>
          {/* <Image src="/images/info.png" alt="info" width={20} height={20} /> */}
        </div>
        {!isBank && (
          <p className="w-10 h-8 center bg-[#eeecec] rounded-md px-4 text-lg font-semibold">
            {maxValue}
          </p>
        )}
      </div>
      {/* Charts */}
      <div className="flex items-center overflow-x-auto">
        {isLoading ? (
          <div className="w-full h-full center">
            <Loader />
          </div>
        ) : (
          <>
            <Chart
              value={accepted}
              bg="#E0F2EF"
              color="#49E2B4"
              title="accepted"
              maxValue={maxValue}
            />
            <Chart
              value={rejected}
              bg="#FFE6E6"
              color="#FF0000"
              title="rejected"
              maxValue={maxValue}
            />
            <Chart
              value={expired}
              bg="#F6EBE7"
              color="#FF7939"
              title={isBank ? "bids" : "expired"}
              maxValue={maxValue}
            />
            <Chart
              value={pending}
              bg="#DDE9FA"
              color="#0062FF"
              title="pending"
              maxValue={maxValue}
            />
          </>
        )}
      </div>
    </div>
  );
};
