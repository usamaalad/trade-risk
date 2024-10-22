import { getBidsCount, getTotalRequests } from "@/services/apis/bids.api";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../helpers";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatFirstLetterOfWord } from "../LG-Output/helper";

const Chart = ({
  value,
  bg,
  color,
  title,
  maxValue,
  isBank,
}: {
  value: number;
  color: string;
  bg: string;
  title: string;
  maxValue: number;
  isBank?: boolean;
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((value / maxValue) * 100);
  }, [value, maxValue]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;

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
    queryParams.set("filter", filter.toString());
    queryParams.set("page", "1");

    const queryString = queryParams.toString();
    router.push(`${isBank ? "my-bids" : "corporate-bids"}?${queryString}`, {
      scroll: false,
    });
  };

  return (
    <div
      className="hover:shadow-xl hover:bg-white rounded-xl pb-2 cursor-pointer xl:w-[6.75vw] transition-all duration-100"
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
                circumference - (progress / 100) * circumference || ""
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
      <p className="text-sm font-light	 text-[#1A1A26] text-center">
        {formatFirstLetterOfWord(title)}
      </p>
    </div>
  );
};

interface Count {
  _id?: string;
  count: number;
  status?: string;
}

export const ProgressCharts = ({
  title,
  isBank,
}: {
  title: string;
  isBank?: boolean;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["fetch-bids-count"],
    queryFn: () => (isBank ? getBidsCount() : getTotalRequests()),
  });

  const [accepted, setAccepted] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [expired, setExpired] = useState(0);
  const [pending, setPending] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    console.log("USEEFFECT DATA", data);

    if (data && data.length > 0) {
      const statusCounts = {
        Accepted: 0,
        Rejected: 0,
        Expired: 0,
        Pending: 0,
      };

      if (data && Array.isArray(data))
        data?.forEach((item: Count) => {
          // @ts-ignore
          if (isBank) statusCounts[item.status] = item.count;
          // @ts-ignore
          else statusCounts[item.status] = item.count;
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

  console.log("Accepted", accepted);
  console.log("Rejected", rejected);
  console.log("Expired", expired);
  console.log("Pending", pending);

  return (
    <div
      className={`bg-[white] ${
        isBank ? "w-full" : "w-[95%]"
      } xl:w-[29vw] rounded-lg border border-borderCol py-4 px-3`}
    >
      <div className="flex items-center gap-x-2 justify-between mb-3 w-full">
        <div className="flex items-center gap-x-2">
          <h4 className="text-lg font-semibold">{title}</h4>
          <div className="size-4 rounded-full bg-[#B5B5BE] text-white text-[10px] center">
            i
          </div>
          {/* <Image src="/images/info.png" alt="info" width={20} height={20} /> */}
        </div>
        <p className="w-10 h-8 center bg-[#eeecec] rounded-md px-4 text-lg font-semibold mr-1">
          {maxValue}
        </p>
      </div>
      {/* Charts */}
      <div className="flex items-center">
        {isLoading ? (
          <div className="w-full h-full center">
            <Loader />
          </div>
        ) : (
          <div className="bg-[#F5F7F9] flex rounded-[6px]">
            <Chart
              value={accepted}
              bg="#E0F2EF"
              color={accepted === 0 ? "#e3f5f2" : "#49E2B4"}
              title="accepted"
              maxValue={maxValue}
              isBank={isBank}
            />
            <Chart
              value={rejected}
              bg="#FFE6E6"
              color={rejected === 0 ? "#FFE5E5" : "#FF0000"}
              title="rejected"
              maxValue={maxValue}
              isBank={isBank}
            />
            <Chart
              value={expired}
              bg="#F6EBE7"
              color={expired === 0 ? "#F6EAE6" : "#FF7939"}
              title="expired"
              maxValue={maxValue}
              isBank={isBank}
            />
            <Chart
              value={pending}
              bg="#DDE9FA"
              color={pending === 0 ? "#DBE8FB" : "#0062FF"}
              title="pending"
              maxValue={maxValue}
              isBank={isBank}
            />
          </div>
        )}
      </div>
    </div>
  );
};
