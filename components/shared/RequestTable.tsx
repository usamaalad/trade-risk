import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse, ILcs, IRisk, Country } from "@/types/type";
import {
  convertDateToString,
  formatAmount,
  formatNumberByAddingDigitsToStart,
} from "@/utils";
import { getCountries } from "@/services/apis/helpers.api";
import { Plus, ChevronUp, Ellipsis, ListFilter } from "lucide-react"; // Import the plus and chevron icons
import { LGTableBidStatus } from "../LG-Output/LG-Issuance-Corporate/LgTableBidStatus"; // Import your components
import { LGCashMarginCorporate } from "../LG-Output/LG-Issuance-Corporate/LgCashMarginCorporate";
import { TableDialog } from "./TableDialog";
import { ButtonBase } from "@mui/material"; // To make cells clickable
import {
  ProductFilter,
  BidsCountrySelect,
  DateRangePicker,
  SearchBar,
  TableBidStatus,
} from "../helpers";
import MuiGrid from "./CustomTableGrid";
import { useDebounce } from "@uidotdev/usehooks";
import { formatFirstLetterOfWord } from "../LG-Output/helper";
import { GridComparatorFn } from "@mui/x-data-grid";

export const gridCellStyling = {
  border: "1px solid rgba(224, 224, 224, 1)",
  borderRadius: "4px",
  height: "100%",
  padding: "0 8px", // Add padding for visual spacing
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const RequestTable = ({
  isBank,
  data,
  isLoading,
  isRisk = false,
}: {
  isBank: boolean;
  isRisk?: boolean;
  data: ApiResponse<ILcs> | IRisk | undefined;
  isLoading: boolean;
}) => {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [tableData, setTableData] = useState<any>();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 700);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  console.log(data, "tableData");

  const { data: countriesData } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
  });

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  useEffect(() => {
    if (
      countriesData &&
      countriesData.success &&
      countriesData.response &&
      countriesData.response.length > 0
    ) {
      setAllCountries(countriesData.response);
    }
  }, [countriesData]);

  const getCountryFlagByName = (countryName: string): string | undefined => {
    const country = allCountries.find(
      (c: Country) => c.name.toLowerCase() === countryName?.toLowerCase()
    );
    return country ? country.flag : undefined;
  };

  const getTotal = (item: any) => {
    const otherBond = item?.otherBond?.cashMargin ?? 0;
    const bidBond = item?.bidBond?.cashMargin ?? 0;
    const advancePaymentBond = item?.advancePaymentBond?.cashMargin ?? 0;
    const performanceBond = item?.performanceBond?.cashMargin ?? 0;
    const retentionMoneyBond = item?.retentionMoneyBond?.cashMargin ?? 0;
    const total =
      otherBond +
      bidBond +
      advancePaymentBond +
      performanceBond +
      retentionMoneyBond;
    return total;
  };

  const columns = [
    { field: "id", headerName: "ID", width: 200 },
    {
      field: "refId",
      flex: 1,
      minWidth: 100,
      align: "center",
      sortable: true,
      hideSortIcons: true,
      disableColumnMenu: true,
      renderHeader: () => (
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#44444F]">
            {isBank ? "Deal ID" : "Ref No"}
          </span>
          <div className="border border-primaryCol center rounded-full size-4 hover:bg-primaryCol hover:text-white transition-colors duration-100 cursor-pointer mx-2">
            <ChevronUp className="size-3" />
          </div>
        </div>
      ),
      renderCell: (params) => (
        <div style={gridCellStyling}>
          {formatNumberByAddingDigitsToStart(params.value)}
        </div>
      ),
    },
    {
      field: "startDate",
      flex: 1,
      minWidth: 140,
      sortable: true,
      hideSortIcons: true,
      valueGetter: (params, row) =>
        new Date(row.period?.startDate || row.startDate || row.createdAt),
      align: "center",
      renderHeader: () => (
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#44444F]">
            {isBank ? "Deal Received" : "Request On"}
          </span>
          <div className="border border-primaryCol center rounded-full size-4 hover:bg-primaryCol hover:text-white transition-colors duration-100 cursor-pointer mx-2">
            <ChevronUp className="size-3" />
          </div>
        </div>
      ),
      renderCell: (params) => {
        const item = params.row;
        return (
          <div style={gridCellStyling}>
            {item?.period?.startDate
              ? convertDateToString(item?.period?.startDate)
              : item?.startDate
              ? convertDateToString((item as IRisk)?.startDate)
              : (item as IRisk)?.createdAt &&
                convertDateToString(new Date((item as IRisk)?.createdAt))}
          </div>
        );
      },
    },
    {
      field: "endDate",
      flex: 1,
      minWidth: 140,
      sortable: true,
      hideSortIcons: true,
      align: "center",
      valueGetter: (params, row) =>
        new Date(
          row.period?.endDate || row.expiryDate || row.lastDateOfReceivingBids
        ),
      renderHeader: () => (
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#44444F]">Expires On</span>
          <div className="border border-primaryCol center rounded-full size-4 hover:bg-primaryCol hover:text-white transition-colors duration-100 cursor-pointer mx-2">
            <ChevronUp className="size-3" />
          </div>
        </div>
      ),
      renderCell: (params) => {
        const item = params.row;
        return (
          <div style={gridCellStyling}>
            {item?.period?.endDate
              ? convertDateToString(item?.period?.endDate)
              : item?.expiryDate
              ? convertDateToString((item as IRisk)?.lastDateOfReceivingBids)
              : item?.lastDateOfReceivingBids
              ? convertDateToString(item?.lastDateOfReceivingBids)
              : "-"}
          </div>
        );
      },
    },
    {
      field: "type",
      flex: 1,
      minWidth: 170,
      sortable: true,
      disableColumnMenu: true,
      align: "center",
      hideSortIcons: true,
      renderHeader: () => (
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#44444F]">Product Type</span>
          <div className="border border-primaryCol center rounded-full size-4 hover:bg-primaryCol hover:text-white transition-colors duration-100 cursor-pointer mx-2">
            <ChevronUp className="size-3" />
          </div>
        </div>
      ),
      renderCell: (params) => {
        const item = params.row;
        return (
          <div style={gridCellStyling}>
            {item?.type === "LG Issuance"
              ? item?.lgIssuance
              : item?.type ||
                (item as IRisk)?.riskParticipationTransaction?.type}
          </div>
        );
      },
    },
    {
      field: "issuingBank",
      headerName: "Issuing Bank",
      flex: 1,
      minWidth: 200,
      sortable: false,
      align: "center",
      renderCell: (params) => {
        const item = params.row.issuingBanks?.[0];
        const flag = getCountryFlagByName(item?.country);
        return (
          <div className="space-x-1" style={gridCellStyling}>
            <span className="emoji-font text-[16px]">{flag}</span>
            {item?.bank ? (
              <span>{formatFirstLetterOfWord(item.bank)}</span>
            ) : (
              <span>-</span>
            )}
          </div>
        );
      },
    },
    {
      field: "beneficiaryName",
      headerName: "Beneficiary",
      flex: 1,
      minWidth: 150,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => {
        const item = params.row;
        return (
          <div style={gridCellStyling}>
            {(item.exporterInfo &&
              formatFirstLetterOfWord(item.exporterInfo?.beneficiaryName)) ||
              formatFirstLetterOfWord(item?.beneficiaryDetails?.name) ||
              ""}
          </div>
        );
      },
    },
    {
      field: "applicantName",
      headerName: "Applicant",
      flex: 1,
      minWidth: 180,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => {
        const item = params.row;
        return (
          <div style={gridCellStyling}>
            {((item.importerInfo &&
              formatFirstLetterOfWord(item.importerInfo?.applicantName)) ||
              item?.applicantDetails?.name ||
              item?.applicantDetails?.company) ??
              "-"}
          </div>
        );
      },
    },
    {
      field: "amount",
      flex: 1,
      minWidth: 150,
      sortable: true,
      hideSortIcons: true,
      disableColumnMenu: true,
      align: "center",
      renderHeader: () => (
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#44444F] text-[14px]">Amount</span>
          <div className="border border-primaryCol center rounded-full size-4 hover:bg-primaryCol hover:text-white transition-colors duration-100 cursor-pointer mx-2">
            <ChevronUp className="size-4" />
          </div>
        </div>
      ),
      renderCell: (params) => {
        const item = params.row;
        return (
          <div style={gridCellStyling}>
            {item.type === "LG Issuance"
              ? item.lgIssuance === "LG 100% Cash Margin"
                ? `${item.lgDetails.currency || "USD"} ${formatAmount(
                    item?.lgDetails?.amount
                  )}`
                : `${item.totalContractCurrency || "USD"} ${formatAmount(
                    getTotal(item)
                  )}`
              : formatAmount(item?.amount)
              ? `${
                  item?.currency ? item.currency.toUpperCase() : "USD"
                } ${item?.amount?.price?.toLocaleString()}`
              : `${item?.currency ? item.currency.toUpperCase() : "USD"} ${(
                  item as IRisk
                )?.riskParticipationTransaction?.amount?.toLocaleString()}`}
          </div>
        );
      },
    },
    {
      field: "bids",
      width: isBank ? 150 : 100,
      sortable: true, // Enable sorting
      disableColumnMenu: true,
      hideSortIcons: true,
      valueGetter: (value) => {
        return value.length || 0; // Return 0 if no bids
      },
      renderHeader: () => (
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#44444F] text-[14px]">Bids</span>
          <div className="border border-primaryCol center rounded-full size-4 hover:bg-primaryCol hover:text-white transition-colors duration-100 cursor-pointer mx-2">
            <ChevronUp className="size-3" />
          </div>
        </div>
      ),
      renderCell: (params) => {
        const item = params.row;
        return (
          <>
            {!isBank
              ? item.bids?.length === 1
                ? "1 bid"
                : `${item.bids?.length || 0} bids`
              : null}
          </>
        );
      },
    },
    {
      field: "actions",
      width: 30,
      align: "center",
      renderHeader: () => (
        <div className="center size-5 cursor-pointer rounded-full bg-black">
          <Plus strokeWidth={2.5} className="size-4 text-white" />
        </div>
      ),
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => {
        const originalItem = params.row;
        return (
          <ButtonBase>
            {originalItem.type == "LG Issuance" &&
            originalItem.lgIssuance !== "LG 100% Cash Margin" ? (
              <LGTableBidStatus data={originalItem} />
            ) : originalItem.type == "LG Issuance" &&
              originalItem.lgIssuance === "LG 100% Cash Margin" ? (
              <LGCashMarginCorporate data={originalItem} />
            ) : (
              <TableDialog
                lcData={originalItem}
                bids={originalItem.bids}
                isRisk={isRisk}
              />
            )}
          </ButtonBase>
        );
      },
    },
  ];

  return (
    <div
      style={{ width: "100%", backgroundColor: "white" }}
      className="p-5 rounded-lg border border-[#E2E2EA]"
    >
      <div className="mb-4 flex w-full items-center justify-between gap-x-2">
        <h2 className="text-[16px] font-semibold text-[#1A1A26]">
          {isBank ? "Deals Received by Corporates" : "Transaction Requests"}
        </h2>

        <div className="flex items-center gap-x-2">
          {isBank && (
            <>
              <ProductFilter isRisk={isRisk} />
              <BidsCountrySelect />
            </>
          )}
          <DateRangePicker />
          <SearchBar />
          <div className="flex items-center gap-x-2">
            <ListFilter className="size-4 text-[#1A1A26]" />
            <p className="text-[14px] text-[#1A1A26]">Filter</p>
          </div>
          <Ellipsis className="mx-3" />
        </div>
      </div>
      <MuiGrid
        data={tableData?.data || []}
        columns={columns}
        rowCount={tableData?.pagination?.totalItems || 0}
        loading={isLoading}
        paginationModel={paginationModel}
        columnVisibilityModel={{
          issuingCountry: isBank,
        }}
        onPaginationModelChange={setPaginationModel}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
};
