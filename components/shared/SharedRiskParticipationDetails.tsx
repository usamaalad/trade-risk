import { convertDateToCommaString } from "@/utils";
import { formatFirstLetterOfWord, LcLgInfo } from "../LG-Output/helper";
import ViewFileAttachment from "./ViewFileAttachment";

const SharedRiskParticipationDetails = ({ riskData }: { riskData: any }) => {
  const riskDetails = [
    { label: "Transaction Type", value: "Risk Participation" },
    {
      label: "Risk Participation",
      value: riskData?.riskParticipation,
    },
    {
      label: "Transaction Offered",
      value: riskData?.transactionType,
    },
    {
      label: "Pricing Offered",
      value: `${riskData?.riskParticipationTransaction?.pricingOffered} Per Annum`,
    },
    {
      label: "Participation Offered",
      value: `${riskData?.riskParticipationTransaction?.percentage}%`,
    },
    {
      label: "Last date for receiving Bids",
      value: riskData?.lastDateOfReceivingBids
        ? convertDateToCommaString(riskData?.lastDateOfReceivingBids)
        : "-",
    },
  ];

  const riskDetails2 = [
    {
      label: "LC Issuing Bank",
      value: formatFirstLetterOfWord(riskData?.issuingBank?.bank),
    },
    {
      label: "LC Advising Bank",
      value: formatFirstLetterOfWord(riskData?.advisingBank?.bank),
    },
    {
      label: "LC Confirming Bank",
      value: formatFirstLetterOfWord(riskData?.confirmingBank?.bank),
    },
    {
      label: "Issuance Date",
      value: convertDateToCommaString(riskData?.lcPeriod?.date),
    },
    {
      label: "Confirmation Issued Date",
      value: convertDateToCommaString(riskData?.confirmingBank?.date),
    },
    {
      label: "Date of Expiry",
      value: convertDateToCommaString(riskData?.lcPeriod?.lcExpiry),
    },
    {
      label: "Payment Terms",
      value:
        riskData?.paymentTerms !== "Sight LC"
          ? `${riskData.paymentTerms}: ${riskData.extraInfo?.days} days at ${riskData.extraInfo?.other}`
          : riskData?.paymentTerms,
    },
    {
      label: "Port of Shipment",
      value: `${riskData?.shipmentPort?.port}, ${riskData?.shipmentPort?.country}`,
    },
    {
      label: "Transhipment",
      value: riskData.transhipment ? "Yes" : "No",
    },
    {
      label: "Purpose",
      value: riskData.productDescription,
    },
  ];

  const importerInfo = [
    { label: "Applicant", value: riskData?.importerInfo?.name || "-" },
    {
      label: "Country of Import",
      value: riskData?.importerInfo?.countryOfImport || "-",
    },
    {
      label: "Port of Discharge",
      value: riskData?.importerInfo?.port || "-",
    },
  ];

  const exporterInfo = [
    {
      label: "Beneficiary Name",
      value: riskData?.exporterInfo?.name || "-",
    },
    {
      label: "Beneficiary Country",
      value: riskData?.exporterInfo?.beneficiaryCountry || "-",
    },
    {
      label: "Country of Export",
      value: riskData?.exporterInfo?.countryOfExport || "-",
    },
  ];

  return (
    <div>
      <div className="bg-bg px-4 border-b-2 border-b-borderCol">
        <h2 className="text-xl font-semibold pt-2">LC Details</h2>
        {riskDetails.map((field, index) => (
          <LcLgInfo
            key={index}
            label={field.label}
            value={field.value || "-"}
            noBorder={index === riskDetails.length - 1}
          />
        ))}
      </div>
      <div className="px-4">
        {riskDetails2.map((field, index) => (
          <LcLgInfo
            key={index}
            label={field.label}
            value={field.value || "-"}
            noBorder={index === riskDetails2.length - 1}
          />
        ))}

        <h2 className="text-xl font-semibold mt-3">Importer Info</h2>
        {importerInfo.map((field, index) => (
          <LcLgInfo
            key={index}
            label={field.label}
            value={field.value || "-"}
            noBorder={index === importerInfo.length - 1}
          />
        ))}

        <h2 className="text-xl font-semibold mt-3">Exporter Info</h2>
        {exporterInfo.map((field, index) => (
          <LcLgInfo
            key={index}
            label={field.label}
            value={field.value || "-"}
            noBorder={index === exporterInfo.length - 1}
          />
        ))}
        {riskData?.signedCopy?.length > 0 &&
          riskData.signedCopy.map((signedCopy: any, index: number) => (
            <ViewFileAttachment key={index} attachment={signedCopy} />
          ))}
        {riskData?.attachment?.length > 0 &&
          riskData.attachment.map((attachment: any, index: number) => (
            <ViewFileAttachment key={index} attachment={attachment} />
          ))}
      </div>
    </div>
  );
};

export default SharedRiskParticipationDetails;
