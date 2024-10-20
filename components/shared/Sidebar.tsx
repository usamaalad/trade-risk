"use client";
import { Button } from "@/components/ui/button";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { ArrowLeft, ArrowRight, Check, Dot, Triangle, X } from "lucide-react";
import Link from "next/link";
import "swiper/css";
import { AddBid } from "./AddBid";
import {
  fetchAllLcs,
  fetchLcs,
  fetchPendingBids,
  getBankLcStatus,
} from "@/services/apis/lcs.api";
import { ApiResponse, IBids, ILcs, IRisk } from "@/types/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatLeftDate, formatLeftDays } from "@/utils";
import useLoading from "@/hooks/useLoading";
import { acceptOrRejectBid } from "@/services/apis/bids.api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableDialog } from "./TableDialog";
import { usePathname } from "next/navigation";
import { formatFirstLetterOfWord, getLgBondTotal } from "../LG-Output/helper";
import {
  formatAmount,
  formatNumberByAddingDigitsToStart,
} from "../../utils/helper/helper";
import { LGCashMarginCorporate } from "../LG-Output/LG-Issuance-Corporate/LgCashMarginCorporate";
import { LGTableBidStatus } from "../LG-Output/LG-Issuance-Corporate/LgTableBidStatus";
import { LGIssuanceWithinCountryCorporate } from "../LG-Output/LG-Issuance-Corporate/LgIssuanceWithinCountryCorporate";
import { ConfirmationModal } from "../LG-Output/ConfirmationModal";

const SliderCard = ({
  info,
  isRisk = false,
  lcData,
}: {
  info: IBids;
  isRisk?: boolean;
  lcData: ILcs;
}) => {
  const [currentBondIndex, setCurrentBondIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState<string>("");
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: acceptOrRejectBid,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bid-status-change"],
      });
    },
  });

  const handleSubmit = async () => {
    const { success, response } = await mutateAsync({
      status: actionStatus,
      id: info._id,
      key: isRisk ? "risk" : "lc",
    });
    queryClient.invalidateQueries(["bid-status", "fetch-lcs", "fetch-risks"]);
    if (!success) return toast.error(response as string);
    else return toast.success(`Bid ${actionStatus}`);
  };

  const handleActionStatus = (actionStatus: string) => {
    setActionStatus(actionStatus);
    setIsModalOpen(true);
  };

  const handleUp = () => {
    setCurrentBondIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleDown = () => {
    setCurrentBondIndex((prevIndex) =>
      prevIndex < info.bids.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  return (
    <div className="border border-borderCol py-3 px-2 rounded-lg max-w-full">
      <p>
        {lcData.lgIssuance === "LG 100% Cash Margin" ? (
          <>{info?.confirmationPrice?.toFixed(2)}% Per Annum</>
        ) : lcData?.type === "LG Issuance" ? (
          <div className="flex items-center justify-between">
            <div className="text-black text-lg">
              <div className="flex items-center space-x-1">
                <span className="text-[14px]">
                  {info.bids[currentBondIndex]?.price?.toFixed(2)}% P.A
                </span>
              </div>
              <div className="text-[#5625F2] text-[12px]">Pricing</div>
            </div>
            <div className="text-black text-lg">
              <div className="flex">
                <span className="text-[14px]">
                  {info.bids[currentBondIndex]?.bidType}
                </span>
                <div className="items-center">
                  <span className="transform cursor-pointer" onClick={handleUp}>
                    <Triangle fill="black" size={14} stroke="black" />
                  </span>
                  <span
                    className="transform cursor-pointer"
                    onClick={handleDown}
                  >
                    <Triangle
                      fill="black"
                      size={14}
                      stroke="black"
                      style={{
                        transform: "rotate(180deg)",
                      }}
                    />
                  </span>
                </div>
              </div>
              <div className="text-[#5625F2] text-[12px]">LG Type</div>
            </div>
          </div>
        ) : lcData?.type === "LC Confirmation" ? (
          <div>
            <div>
              <p className="text-[16px]">
                {info?.confirmationPrice?.toFixed(2)}% Per Annum
              </p>
              <p className="text-[#5625F2] text-[12px]">Confirmation Rate</p>
            </div>
          </div>
        ) : lcData?.type === "LC Confirmation & Discounting" ? (
          <div className="space-y-1">
            <div>
              <p className="text-[16px]">
                {formatFirstLetterOfWord(info.discountBaseRate)} +{" "}
                {info?.discountMargin?.toFixed(2)}%
              </p>
              <p className="text-[#5625F2] text-[12px]">Discount pricing</p>
            </div>
            <div>
              <p className="text-[16px]">
                {info?.confirmationPrice?.toFixed(2)}% Per Annum
              </p>
              <p className="text-[#5625F2] text-[12px]">Confirmation Rate</p>
            </div>
          </div>
        ) : lcData?.type === "LC Discounting" ? (
          <div className="flex items-center">
            <div>
              <p className="text-[16px]">
                {formatFirstLetterOfWord(info.discountBaseRate)} +{" "}
                {info?.discountMargin?.toFixed(2)}%
              </p>
              <p className="text-[#5625F2] text-[12px]">Discount pricing</p>
            </div>
          </div>
        ) : null}
      </p>
      <p className="font-roboto text-para font-medium mt-1">
        {formatFirstLetterOfWord(info.bidBy?.name) || ""}
      </p>
      <p className="font-roboto text-para text-sm font-medium truncate capitalize">
        {info.bidBy?.country || "Pakistan"}
      </p>
      <div className="flex items-center gap-x-2 mt-2">
        <Button
          onClick={() => handleActionStatus("Accepted")}
          className="border-2 border-[#90ee8f] bg-transparent hover:bg-transparent p-1 size-7 rounded-lg"
          disabled={isPending}
        >
          <Check className="size-5 text-para" color="lightGreen" />
        </Button>
        <Button
          onClick={() => handleActionStatus("Rejected")}
          className="border-2 border-[#ff0000] bg-transparent hover:bg-transparent p-1 size-7 rounded-lg"
          disabled={isPending}
        >
          <X className="size-5 text-para" color="red" />
        </Button>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

const RequestCard = ({
  isBank,
  isRisk,
  data,
}: {
  isBank: boolean;
  isRisk?: boolean;
  riskType?: string;
  data: ILcs | IRisk;
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Check if the last date of receiving bids has passed for banks
  const isBidsExpiredForBank =
    isBank && data.lastDateOfReceivingBids
      ? new Date(data.lastDateOfReceivingBids) < new Date()
      : false;

  const showData = !data.bids.some((bid) => bid.bidBy === user?._id) || true;

  const ButtonGroup = ({ next, previous, goToSlide }) => {
    const totalItems = data.bids.length;
    const slidesToShow = responsive.desktop.items;

    useEffect(() => {
      if (currentIndex >= totalItems) {
        setCurrentIndex(currentIndex % totalItems);
      }
    }, [currentIndex, totalItems]);

    return (
      <div className="flex justify-center items-center">
        <button onClick={previous} className="carousel-arrow mx-2">
          <ArrowLeft color="black" size={16} />
        </button>
        <div className="flex items-center mx-4">
          {Array.from({ length: totalItems }).map((_, index) => {
            return (
              <button
                key={index}
                onClick={() => goToSlide(index * slidesToShow)}
                className={`mx-1 w-2 h-2 rounded-full ${
                  currentIndex === index ? "bg-black" : "bg-gray-400"
                }`}
              />
            );
          })}
        </div>
        <button onClick={next} className="carousel-arrow mx-2">
          <ArrowRight color="black" size={16} />
        </button>
      </div>
    );
  };

  const handleAfterChange = (previousSlide, { currentSlide }) => {
    setCurrentIndex(currentSlide);
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
    },
  };

  return (
    <>
      {isBank && !isBidsExpiredForBank ? (
        showData &&
        data.status !== "Expired" &&
        data.status !== "Accepted" &&
        (data.status === "Add Bid" || data.status !== "Pending") && (
          <>
            <div className="px-3 py-2 flex flex-col gap-y-1 bg-[#F5F7F9] rounded-md">
              {/* Data */}
              <div className="font-roboto">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[#1A1A26] text-[15px] flex-grow text-center">
                    Request #{formatNumberByAddingDigitsToStart(data.refId)}
                  </p>
                  <div className="w-8 text-right">
                    <AddBid lcData={data} isEyeIcon={true} />
                  </div>
                </div>
                <p className="capitalize text-lg font-semibold my-1">
                  {(data as ILcs).createdBy?.[0]?.name || ""}
                </p>

                <p className="text-sm flex items-center flex-wrap">
                  <span className="text-text">
                    {(data as ILcs)?.type ||
                      (data as IRisk)?.riskParticipationTransaction?.type}
                  </span>
                </p>

                <div className="flex items-center">
                  <p className="text-para text-sm">Request Expiry</p>
                  <Dot style={{ margin: 0, padding: 0 }} color="gray" />
                  {(data as ILcs)?.type === "LG Issuance" ? (
                    <p className="text-red-500 font-medium text-[12px]">
                      {(data as ILcs)?.lastDateOfReceivingBids
                        ? formatLeftDays(
                            (data as ILcs)?.lastDateOfReceivingBids
                          )
                        : null}
                    </p>
                  ) : (
                    <p className="text-red-500 font-medium text-[12px]">
                      {(data as ILcs)?.period?.endDate
                        ? formatLeftDays((data as ILcs)?.period?.endDate)
                        : data?.expiryDate
                        ? formatLeftDays((data as IRisk)?.expiryDate)
                        : data?.otherBond?.lgExpiryDate
                        ? formatLeftDays(
                            new Date(data?.otherBond?.lgExpiryDate)
                          )
                        : null}
                    </p>
                  )}
                </div>
                <h3 className="font-poppins text-xl font-semibold uppercase">
                  {data?.totalContractCurrency ||
                    data.currency ||
                    data?.lgDetails?.currency ||
                    "USD"}{" "}
                  {(data as ILcs)?.type === "LG Issuance" &&
                  data.lgIssuance === "LG 100% Cash Margin"
                    ? formatAmount(data.lgDetails.amount)
                    : (data as ILcs)?.type === "LG Issuance" &&
                      data.lgIssuance !== "LG 100% Cash Margin"
                    ? formatAmount(getLgBondTotal(data))
                    : (data as ILcs)?.amount
                    ? formatAmount((data as ILcs).amount?.price)
                    : formatAmount(data?.amount)}
                </h3>
              </div>
              <AddBid lcData={data} id={data._id} />
            </div>
          </>
        )
      ) : !isBank ? (
        <div className="gap-y-1 bg-[#F5F7F9] rounded-md">
          {/* Data */}
          <div className="px-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="ml-[15%] font-medium text-[#1A1A26] text-[15px]">
                Request #{formatNumberByAddingDigitsToStart(data.refId)}
              </p>
              <div className="w-8">
                {data.type == "LG Issuance" &&
                data.lgIssuance === "LG Re-issuance in another country" ? (
                  <LGTableBidStatus data={data} />
                ) : data.type == "LG Issuance" &&
                  data.lgIssuance === "LG issuance within the country" ? (
                  <LGIssuanceWithinCountryCorporate data={data} />
                ) : data.type == "LG Issuance" &&
                  data.lgIssuance === "LG 100% Cash Margin" ? (
                  <LGCashMarginCorporate data={data} />
                ) : (
                  <TableDialog lcData={data} id={data._id} />
                )}
              </div>
            </div>

            <p className="font-roboto text-sm flex items-center flex-wrap">
              <span className="text-text">
                {(data as ILcs)?.type ||
                  (data as IRisk)?.riskParticipationTransaction?.type}
              </span>
              <span className="text-para text-[10px] flex items-center">
                <Dot />
                {(data as ILcs)?.type === "LG Issuance" ? (
                  <span className="text-[12px] text-[#ff0000] font-medium">
                    {(data as ILcs)?.lastDateOfReceivingBids
                      ? formatLeftDays((data as ILcs)?.lastDateOfReceivingBids)
                      : null}
                  </span>
                ) : (
                  <span className="text-[12px] text-[#ff0000] font-medium">
                    {(data as ILcs)?.period?.endDate
                      ? formatLeftDays((data as ILcs)?.period?.endDate)
                      : data?.expiryDate
                      ? formatLeftDays((data as IRisk)?.expiryDate)
                      : data?.otherBond?.lgExpiryDate
                      ? formatLeftDays(new Date(data?.otherBond?.lgExpiryDate))
                      : null}
                  </span>
                )}
              </span>
            </p>
            <h3 className="text-xl font-semibold uppercase">
              {data?.totalContractCurrency ||
                data.currency ||
                data?.lgDetails?.currency ||
                "USD"}{" "}
              {(data as ILcs)?.type === "LG Issuance" &&
              data.lgIssuance === "LG 100% Cash Margin"
                ? formatAmount(data.lgDetails.amount)
                : (data as ILcs)?.type === "LG Issuance" &&
                  data.lgIssuance !== "LG 100% Cash Margin"
                ? formatAmount(getLgBondTotal(data))
                : (data as ILcs)?.amount
                ? formatAmount((data as ILcs).amount?.price)
                : formatAmount(data?.amount)}
            </h3>
            <div className="flex items-center justify-between gap-x-2">
              <p className="font-roboto text-gray-500 text-sm font-semibold">
                {currentIndex + 1 + "/" + data.bids.length} bid
                {data.bids.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="w-full max-w-[250px] overflow-hidden">
            <Carousel
              responsive={responsive}
              autoPlay={false}
              arrows={false}
              renderButtonGroupOutside={true}
              customButtonGroup={<ButtonGroup />}
              showDots={false}
              afterChange={handleAfterChange}
              itemClass="px-2.5"
              containerClass="w-full overflow-hidden" // Make sure the carousel container respects the width
            >
              {data.bids.map((info: IBids) => (
                <SliderCard
                  isRisk={isRisk}
                  info={info}
                  lcData={data}
                  key={info._id}
                />
              ))}
            </Carousel>
          </div>
        </div>
      ) : null}
    </>
  );
};

export const Sidebar = ({
  isBank,
  createMode,
}: {
  isBank: boolean;
  createMode?: boolean;
  isRisk?: boolean;
  riskType?: string;
}) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const {
    data,
  }: { data: ApiResponse<ILcs> | undefined; error: any; isLoading: boolean } =
    useQuery({
      queryKey: ["bid-status", "fetch-lcs", "fetch-risks"],
      queryFn: () => fetchPendingBids(),
      enabled: !!user?._id,
    });

  const {
    data: allLcs,
  }: { data: ApiResponse<ILcs> | undefined; error: any; isLoading: boolean } =
    useQuery({
      queryKey: ["fetch-all-lcs"],
      queryFn: () => fetchAllLcs({ limit: 20 }),
      enabled: !!user?._id,
    });

  const getHeaders = (data: any) => {
    const headers = new Set();
    const extractHeaders = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const headerKey = `${prefix}${key}`.replace(/\./g, " ");
        if (value && typeof value === "object") {
          extractHeaders(value, `${prefix}${key}.`);
        } else {
          headers.add(headerKey);
        }
      });
    };

    data?.forEach((item: any) => extractHeaders(item));
    return Array.from(headers);
  };
  console.log(allLcs, "allLcs");
  const formatValue = (header: any, obj: any) => {
    const keys = header.split(".");
    let value = obj;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    return value === undefined ? "" : JSON.stringify(value);
  };

  const generateCSV = (data: any) => {
    const headers = getHeaders(data);
    const csvRows = [];

    csvRows.push(headers.join(","));
    data?.forEach((item: any) => {
      const values = headers.map((header) => formatValue(header, item));
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (data: any) => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape
    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);
    const title = "Trade Risk";

    // Flatten the data structure
    const flattenedData = data.map((obj: any) => {
      const flattenedObj: any = {};

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null) {
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            flattenedObj[`${key}.${nestedKey}`] = nestedValue;
          }
        } else {
          flattenedObj[key] = value;
        }
      }

      return flattenedObj;
    });

    const headers = Object.keys(flattenedData[0]);
    let startY = 50;

    const chunkSize = 4; // Number of columns per chunk
    const numChunks = Math.ceil(headers.length / chunkSize);

    for (let i = 0; i < numChunks; i++) {
      const startIdx = i * chunkSize;
      const endIdx = Math.min(startIdx + chunkSize, headers.length);

      const chunkHeaders = headers.slice(startIdx, endIdx);
      const chunkData = flattenedData.map((obj: any) =>
        chunkHeaders.map((header) => obj[header])
      );

      const content = {
        startY,
        head: [chunkHeaders],
        body: chunkData,
        pageBreak: "auto",
      };

      if (i === 0) {
        doc.text(title, marginLeft, 40);
      }

      // @ts-ignore
      doc.autoTable(content);

      if (i !== numChunks - 1) {
        doc.addPage();
        startY = 50; // Reset startY for the next table
      }
    }

    doc.save("report.pdf");
  };

  const generateReport = async (type: string) => {
    if (!user) return;
    const isCSV = type === "csv";
    const isPDF = type === "pdf";
    const isExcel = type === "excel";

    if (isBank) {
      startLoading();
      const { data } = await fetchAllLcs({ limit: 10000 });
      if (data.length > 0) {
        isCSV && generateCSV(data);
        isPDF && generatePDF(data);
        isExcel && generateCSV(data);
      } else {
        toast.error("Not enough data to export");
      }
      stopLoading();
    } else {
      startLoading();
      const { data } = await fetchLcs({
        userId: user?.business?._id,
        limit: 1000,
        draft: false,
      });
      if (data.length > 0) {
        isCSV && generateCSV(data);
        isPDF && generatePDF(data);
        isExcel && generateCSV(data);
      } else {
        toast.error("Not enough data to export");
      }
      stopLoading();
    }
  };

  const [generateType, setGenerateType] = useState("csv");

  return (
    <>
      {/* Action Box */}
      {createMode ? (
        <div className="bg-[#255EF2] rounded-lg py-4 px-4 flex flex-col gap-y-4 items-center justify-center">
          <p className="text-white text-sm font-normal">
            Risk Participation Request
          </p>
          <p className="text-white text-center font-semibold">
            Send a risk participation request to other banks
          </p>
          <Link href="/risk-participation/create" className="w-full">
            <Button
              className="w-full text-[#255EF2] bg-white hover:bg-white/90 rounded-lg text-[16px]"
              size="lg"
            >
              Create Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-primaryCol rounded-lg pb-3 px-4 flex flex-col gap-y-2 items-center justify-center">
          <Select onValueChange={(val: string) => setGenerateType(val)}>
            <SelectTrigger className="font-roboto max-w-36 w-full mx-auto text-center bg-transparent border-none text-white text-sm ring-0 flex items-center justify-between">
              <p className="text-sm">Export</p>
              <SelectValue placeholder="CSV" className="text-sm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-white text-center font-semibold">
            Generate a quick report of all transaction data
          </p>
          <Button
            onClick={() => generateReport(generateType)}
            className="w-full text-primaryCol bg-white hover:bg-white/90 rounded-lg text-[16px]"
            size="lg"
            disabled={isLoading}
          >
            Download Report
          </Button>
        </div>
      )}
      <div className="bg-white border border-borderCol py-4 px-5 mt-5 rounded-lg min-h-[70%] max-h-[80%] overflow-y-auto overflow-x-hidden flex flex-col justify-between">
        <div>
          <h4 className={"text-lg text-center font-semibold mb-3"}>
            {isBank ? "Needs Action" : "Needs Your Attention"}
          </h4>
          <div className="flex flex-col gap-y-5">
            {isBank
              ? allLcs &&
                allLcs.data &&
                allLcs.data.map((item: ILcs) => (
                  <RequestCard isBank={true} data={item} key={item._id} />
                ))
              : data &&
                data.data &&
                data.data.map((item: ILcs) => (
                  <RequestCard isBank={false} data={item} key={item._id} />
                ))}
          </div>
        </div>
        {/* {isBank && ( */}
        <Button className="mt-4 w-full rounded-xl py-6 bg-borderCol hover:bg-borderCol/90 text-[#696974] text-[16px]">
          View all requests
        </Button>
        {/* )} */}
      </div>
    </>
  );
};
