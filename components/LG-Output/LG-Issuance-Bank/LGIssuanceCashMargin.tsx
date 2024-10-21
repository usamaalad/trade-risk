import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "../../ui/button";
import { ApplicantQuery } from "./ApplicantQuery";
import {
  cn,
  convertDateAndTimeToString,
  convertDateAndTimeToStringGMTNoTsx,
  convertDateToCommaString,
  formatAmount,
} from "@/utils";
import { useAuth } from "@/context/AuthProvider";
import {
  BgRadioInputLG,
  getLgBondTotal,
  formatFirstLetterOfWord,
} from "../helper";
import { DatePicker } from "@/components/helpers";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitLgBid } from "@/services/apis/lg.apis";
import BidPreviewCashMargin from "./BidPreviewCashMargin";
import { DDInput } from "@/components/LCSteps/helpers";
import { getCities } from "@/services/apis/helpers.api";
import { toast } from "sonner";
import FileUploadService from "@/services/apis/fileUpload.api";
import { FileCard } from "@/components/LCSteps/Step7";
import ViewFileAttachment from "@/components/shared/ViewFileAttachment";
import { convertDateAndTimeToStringGMT } from "@/utils/helper/dateAndTimeGMT";

const LGInfo = ({
  label,
  value,
  noBorder,
}: {
  label: string;
  value: string | null;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={`flex items-start justify-between py-2 ${
        !noBorder && "border-b border-b-borderCol"
      }`}
    >
      <p className="font-roboto text-sm font-normal text-para">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-semibold capitalize">
        {value || "-"}
      </p>
    </div>
  );
};

const LGIssuanceCashMarginDialog = ({ data }: { data: any }) => {
  const { user } = useAuth();
  const [formattedConfirmationPrice, setFormattedConfirmationPrice] =
    useState("");
  const [userBidStatus, setUserBidStatus] = useState<any>({});
  const [userBid, setUserBid] = useState();
  const [bidNotApplicable, setBidNotApplicable] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const confirmationPrice = watch("confirmationPrice");
  const bidValidity = watch("bidValidity");
  const lgIssueInType = watch("issueLg.type");
  const lgCollectInType = watch("collectLg.type");
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [files, setFiles] = useState<
    {
      file: File;
      url: string;
      userFileName: string;
      firebaseFileName: string;
      fileSize: number;
      fileType: string;
    }[]
  >([]);
  const [isoCodeIssue, setIsoCodeIssue] = useState<string | null>(
    data.lgIssueIn.isoCode
  );
  const [isoCodeCollect, setIsoCodeCollect] = useState<string | null>(
    data.lgCollectIn.isoCode
  );

  useEffect(() => {
    setValue("issueLg.type", "accept");
    setValue("collectLg.type", "accept");
  }, []);

  const lgDetails = [
    { label: "LG Type", value: data.typeOfLg },
    {
      label: "LG Tenor",
      value: `${data?.lgDetails?.lgTenor?.lgTenorValue} ${data?.lgDetails?.lgTenor?.lgTenorType}`,
    },
    {
      label: "Expected Date of LG Issuance",
      value: convertDateToCommaString(data?.lgDetails?.expectedDateToIssueLg),
    },
    {
      label: "LG Expiry Date",
      value: convertDateToCommaString(data?.lgDetails?.lgExpiryDate),
    },
    { label: "Purpose of LG", value: data?.remarks },
  ].filter((detail) => detail.value);

  const applicantDetails = [
    { label: "Applicant Name", value: data?.createdBy?.accountHolderName },
    { label: "Applicant CR number", value: data.applicantDetails?.crNumber },
    { label: "Applicant Account Number", value: data.createdBy?.accountNumber },
    { label: "Applicant City", value: data.createdBy?.accountCity },
    { label: "Applicant Country", value: data.applicantDetails?.country },
    {
      label: "Last date for receiving bids",
      value: convertDateToCommaString(data.lastDateOfReceivingBids),
    },
  ].filter((detail) => detail.value);

  const beneficiaryDetails = [
    { label: "Country", value: data.beneficiaryDetails?.country },
    { label: "Name", value: data.beneficiaryDetails?.name },
    { label: "Address", value: data.beneficiaryDetails?.address },
    { label: "City", value: data.beneficiaryDetails?.city },
    { label: "Phone Number", value: data.beneficiaryDetails?.phoneNumber },
  ].filter((detail) => detail.value);

  const mutation = useMutation({
    mutationFn: (newData: any) => submitLgBid(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bondData"] });
    },
  });

  const validateFields = (data: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.bidValidity) {
      toast.error("Bid Validity is required");
      return false;
    }
    if (!data.confirmationPrice) {
      toast.error("Price is required");
      return false;
    }
    if (!data.issueLg?.branchAddress) {
      toast.error("Issue LG Branch Address is required");
      return false;
    }
    if (!data.issueLg?.email) {
      toast.error("Issue LG Email is required");
      return false;
    }
    if (!emailRegex.test(data.issueLg.email)) {
      toast.error("Please enter a valid Issue LG Email address");
      return false;
    }
    if (!data.issueLg?.branchName) {
      toast.error("Issue LG Branch Name is required");
      return false;
    }
    if (!data.issueLg?.city && lgIssueInType === "alternate") {
      toast.error("Issue LG City is required");
      return false;
    }
    if (!data.collectLg?.branchAddress) {
      toast.error("Collect LG Branch Address is required");
      return false;
    }
    if (!data.collectLg?.email) {
      toast.error("Collect LG Email is required");
      return false;
    }
    if (!emailRegex.test(data.collectLg.email)) {
      toast.error("Please enter a valid Collect LG Email address");
      return false;
    }
    if (!data.collectLg?.branchName) {
      toast.error("Collect LG Branch Name is required");
      return false;
    }
    if (!data.collectLg?.city && lgCollectInType === "alternate") {
      toast.error("Collect LG City is required");
      return false;
    }

    return true;
  };

  useEffect(() => {
    // Add % sign if confirmationPrice exists and is a number
    if (confirmationPrice !== undefined) {
      const priceValue = confirmationPrice.replace(/\D/g, "");
      setFormattedConfirmationPrice(priceValue ? `${priceValue}%` : "");
    }
  }, [confirmationPrice]);

  const onSubmit = (formData: any) => {
    const updatedData = {
      ...formData,
      confirmationPrice: confirmationPrice.replace(/\D/g, ""), // Submit as number without %
      collectLg: {
        ...formData.collectLg,
        city: formData.collectLg.city || data?.lgCollectIn?.city,
      },
      issueLg: {
        ...formData.issueLg,
        city: formData.issueLg.city || data?.lgIssueIn?.city,
      },
    };
    if (validateFields(updatedData)) {
      setFormData(updatedData);
      setIsPreview(true);
    }
  };

  useEffect(() => {
    const userBids = data.bids
      .filter((bid: any) => bid.createdBy === user?._id)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    const anotherBankBidAccepted = data.bids.some(
      (bid: any) => bid.status === "Accepted" && bid.createdBy !== user?._id
    );
    if (anotherBankBidAccepted) {
      setBidNotApplicable(true);
    }
    const mostRecentBid = userBids[0];
    setUserBid(mostRecentBid);

    if (userBids.length > 0 && mostRecentBid) {
      setFormData({
        bidValidity: mostRecentBid.bidValidity,
        confirmationPrice: mostRecentBid.confirmationPrice,
        issueLg: mostRecentBid.issueLg,
        collectLg: mostRecentBid.collectLg,
      });
      setFiles(mostRecentBid.attachments);
      setIsPreview(true);
    }

    if (mostRecentBid && anotherBankBidAccepted) {
      setUserBidStatus({
        label: "Another Bank Bid Accepted",
        status: "Not Accepted",
      });
    } else if (!mostRecentBid && anotherBankBidAccepted) {
      setUserBidStatus({
        label: "Bid Not Applicable",
        status: "Not Applicable",
      });
    } else if (mostRecentBid) {
      if (mostRecentBid.status === "Pending") {
        setUserBidStatus({
          label: `Bid Submitted on ${convertDateAndTimeToStringGMTNoTsx(
            mostRecentBid.createdAt
          )}`,
          status: "Pending",
        });
      } else if (mostRecentBid.status === "Accepted") {
        setUserBidStatus({
          label: "Bid Accepted",
          status: "Accepted",
        });
      } else if (mostRecentBid.status === "Rejected") {
        setUserBidStatus({
          label: "Bid Rejected",
          status: "Rejected",
        });
      } else if (new Date(mostRecentBid.bidValidity) < new Date()) {
        setUserBidStatus({
          label: "Bid Expired",
          status: "Expired",
        });
      }
    }
  }, [data.bids, user?._id]);

  const onSubmitBid = () => {
    const confirmationPrice = parseInt(
      formData.confirmationPrice.replace(/\D/g, ""),
      10
    );

    const submissionData = {
      confirmationPrice: confirmationPrice,
      bidType: "LG 100% Cash Margin",
      lc: data._id,
      bidValidity: formData.bidValidity,
      attachments: files,
      issueLg: {
        branchAddress: formData.issueLg.branchAddress,
        email: formData.issueLg.email,
        branchName: formData.issueLg.branchName,
        city: formData.issueLg.city || data?.lgIssueIn?.city,
      },
      collectLg: {
        branchAddress: formData.collectLg.branchAddress,
        email: formData.collectLg.email,
        branchName: formData.collectLg.branchName,
        city: formData.collectLg.city || data?.lgCollectIn?.city,
      },
    };

    console.log(submissionData, "submissionData");
    mutation.mutate(submissionData);
  };

  // Fetch cities based on isoCode for issueLg
  const { data: citiesIssue, isLoading: isLoadingIssue } = useQuery({
    queryKey: ["cities", isoCodeIssue],
    queryFn: () => getCities(isoCodeIssue!),
    enabled: !!isoCodeIssue, // Fetch cities only when isoCodeIssue is set
  });

  // Fetch cities based on isoCode for collectLg
  const { data: citiesCollect, isLoading: isLoadingCollect } = useQuery({
    queryKey: ["cities", isoCodeCollect],
    queryFn: () => getCities(isoCodeCollect!),
    enabled: !!isoCodeCollect, // Fetch cities only when isoCodeCollect is set
  });

  const handleNewBid = () => {
    setIsPreview(false);
    setUserBidStatus({});
    setUserBid(null);
    setFormData(null);
    setUserBidStatus({});
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);

      // Define allowed MIME types, not just file extensions
      const allowedFileTypes = [
        "application/pdf", // PDF
        "image/jpeg", // JPEG/JPG
        "image/jpg", // JPG (not always required as image/jpeg covers this)
        "image/tiff", // TIFF
        "application/msword", // DOC
        "image/png",
      ];

      // Filter files based on MIME types
      const filteredFiles = newFiles.filter((file) => {
        return allowedFileTypes.includes(file.type);
      });
      // Proceed with the file upload for valid files
      filteredFiles.forEach((file) => {
        FileUploadService.upload(
          file,
          (url, firebaseFileName) => {
            const newFile = {
              file,
              url,
              userFileName: file.name, // User's file name for display
              firebaseFileName, // Firebase's file name for deletion
              fileSize: file.size,
              fileType: file.type.split("/")[1].toUpperCase(), // Get file type from MIME type
            };

            setFiles((prevFiles) => {
              const updatedFiles = [...prevFiles, newFile];
              setValue(
                "attachments",
                updatedFiles.map((f) => ({
                  url: f.url,
                  userFileName: f.userFileName,
                  firebaseFileName: f.firebaseFileName,
                  fileSize: f.fileSize,
                  fileType: f.fileType,
                }))
              );
              return updatedFiles.slice(0, 1);
            });
          },
          (error) => {
            toast.error("Unable to upload file");
            setUploadError(error.message);
          },
          (progressBar, progress) => {
            setShowProgressBar(progressBar);
            setProgress(progress);
          }
        );
      });
    }
  };

  const handleRemoveFile = (userFileName: string) => {
    const fileToRemove = files.find(
      (file) => file.userFileName === userFileName
    );
    if (fileToRemove) {
      FileUploadService.delete(
        fileToRemove.firebaseFileName, // Use Firebase file name for deletion
        () => {
          const updatedFiles = files.filter(
            (file) => file.userFileName !== userFileName
          );
          setFiles(updatedFiles);
          setValue(
            "attachments",
            updatedFiles.map((f) => ({
              url: f.url,
              userFileName: f.userFileName,
              firebaseFileName: f.firebaseFileName,
              fileSize: f.fileSize,
              fileType: f.fileType,
            }))
          );
        },
        (error) => {
          toast.error("Unable to remove file");
          console.log(error);
        }
      );
    }
  };

  return (
    <div className="mt-0 flex w-full h-full items-start justify-between overflow-y-scroll">
      <div className="flex-1 border-r-2 border-[#F5F7F9]">
        <div className="border-r-2 border-b-2 bg-[#F5F7F9] p-4 flex flex-col gap-3 border-[#F5F7F9]">
          <h5 className="text-[14px] text-[#696974]">
            Created at,{" "}
            {data.createdAt &&
              convertDateAndTimeToStringGMT({ date: data.createdAt })}
            , by{" "}
            <span className="text-blue-500">
              {formatFirstLetterOfWord(data.applicantDetails.company)}
            </span>
          </h5>
          <h3 className="text-[#92929D] text-xl font-light">
            LG Amount:{" "}
            <span className="text-[20px] text-[#1A1A26] font-semibold">
              {data?.lgDetails?.currency || "USD"}{" "}
              {formatAmount(data?.lgDetails?.amount) + ".00"}
            </span>
          </h3>
          <div>
            {applicantDetails.map((detail, index) => (
              <LGInfo
                key={index}
                label={detail.label}
                value={detail.value || "-"}
              />
            ))}
          </div>
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-lg">LG Details</h2>
          {lgDetails.map((detail, index) => (
            <LGInfo
              key={index}
              label={detail.label}
              value={detail.value || "-"}
            />
          ))}
          {data.issueLgWithStandardText &&
            data?.attachments &&
            data.attachments.length > 0 &&
            data.attachments.map((attachment, index) => (
              <ViewFileAttachment key={index} attachment={attachment} />
            ))}
          <h2 className="font-semibold text-lg mt-3">Beneficiary Details</h2>
          {beneficiaryDetails.map((detail, index) => (
            <LGInfo
              key={index}
              label={detail.label}
              value={detail.value || "-"}
            />
          ))}
        </div>
      </div>
      {bidNotApplicable ? (
        <div className="flex-1 text-center text-lg font-semibold mt-[30%] text-[#696974]">
          <p>Bid Not Applicable</p>
        </div>
      ) : isPreview ? (
        <BidPreviewCashMargin
          formData={formData}
          files={files}
          onSubmitBid={onSubmitBid}
          setIsPreview={setIsPreview}
          handleNewBid={handleNewBid}
          userBidStatus={userBidStatus}
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 px-4 pb-2">
          {/* Form View */}
          <h3 className="text-xl font-semibold text-black my-3">
            Submit your bid
          </h3>

          <div className="border-[1.5px] border-borderCol p-2 rounded-md">
            {/* Bid Validity */}
            <div className="w-full mb-2">
              <label htmlFor="bidValidity" className="block font-semibold mb-2">
                Bid Validity
              </label>
              <DatePicker
                placeholder="Select Date"
                name="bidValidity"
                value={bidValidity}
                setValue={setValue}
                disabled={{
                  before: new Date(),
                  after: new Date(data?.lgDetails?.lgExpiryDate),
                }}
                leftText={false}
              />
            </div>

            {/* Pricing Input */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="confirmation" className="block font-semibold">
                  Enter your Pricing Below
                </label>
                {data.expectedPrice.pricePerAnnum && (
                  <p className="text-xs text-green-500">
                    Client&apos;s Expected Price:{" "}
                    {data.expectedPrice.pricePerAnnum}% Per Annum
                  </p>
                )}
              </div>
              <input
                placeholder="Enter your pricing per annum (%)"
                type="text"
                inputMode="numeric"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
                max={100}
                {...register("confirmationPrice")}
                onChange={(event) => {
                  const newValue: any = event.target.value.replace(
                    /[^0-9.]/g,
                    ""
                  );
                  event.target.value = newValue;
                  setValue("confirmationPrice", newValue);
                }}
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                  if (
                    event.target.value.includes("%") ||
                    event.target.value.length === 0
                  )
                    return;
                  event.target.value += "%";
                }}
                onKeyUp={(event: any) => {
                  if (Number(event.target.value.replace("%", "")) > 100) {
                    event.target.value = "100.0%";
                  }
                }}
              />
            </div>

            {/* Upload Section */}
            {files.length < 1 && (
              <label
                htmlFor="attachment-input"
                className="cursor-pointer flex flex-col justify-center items-center border-[3px] border-borderCol border-dotted py-4 rounded-md bg-transparent my-4"
              >
                <input
                  id="attachment-input"
                  type="file"
                  multiple={false}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.pdf,.tiff,.doc,.png"
                />
                <div className="size-12 bg-white center rounded-full shadow-sm">
                  <Image
                    src="/images/attachment.svg"
                    alt="att"
                    width={27}
                    height={27}
                  />
                </div>
                <p className="text-lg font-semibold text-lightGray mt-4">
                  Upload Your Attachment Here
                </p>
                <p className="text-lightGray">
                  Drag your files here or click to select from your device
                </p>
              </label>
            )}
            {files.length > 0 && (
              <div className="my-3 flex flex-col gap-y-3">
                {files.map((file) => (
                  <FileCard
                    key={file.userFileName}
                    file={file}
                    onRemoveFile={handleRemoveFile}
                  />
                ))}
              </div>
            )}
            {/* Corporate Wants to Issue Section */}
            <div className="w-full bg-gray-50 p-4 rounded-lg mb-4 border border-gray-300">
              <p className="text-sm font-semibold mb-2">
                Corporate wants to Issue LG in{" "}
                <span className="text-blue-500">
                  {formatFirstLetterOfWord(data.lgIssueIn.city)},{" "}
                  {formatFirstLetterOfWord(data.lgIssueIn.country)}
                </span>
              </p>
              <div className="flex items-center gap-3">
                <BgRadioInputLG
                  id="acceptRequest"
                  label="Accept Request"
                  extraClass="h-12"
                  name="issueLg.type"
                  value="accept"
                  checked={lgIssueInType === "accept"}
                  onChange={(e) => setValue("issueLg.type", e.target.value)}
                />
                <BgRadioInputLG
                  id="alternateRequest"
                  label="If no, Alternate"
                  extraClass="h-12"
                  name="issueLg.type"
                  value="alternate"
                  checked={lgIssueInType === "alternate"}
                  onChange={(e) => setValue("issueLg.type", e.target.value)}
                />
              </div>

              {/* Input Fields with Labels */}
              {["email", "branchName", "branchAddress"].map((field) => (
                <div
                  key={field}
                  className="mb-3 flex items-center border bg-white rounded-md h-12"
                >
                  <p className="flex-1 pl-3 text-sm capitalize">
                    {field === "branchName"
                      ? "Branch Name"
                      : field === "branchAddress"
                      ? "Branch Address"
                      : "Branch Email"}
                  </p>
                  <Input
                    placeholder="Enter Text"
                    className="text-sm text-end flex-1 h-full border-none focus:ring-0 focus:outline-none px-3"
                    register={register}
                    name={`issueLg.${field}`}
                    type="text"
                  />
                </div>
              ))}
              {lgIssueInType === "alternate" && (
                <DDInput
                  placeholder="Select City"
                  label="City"
                  id={"issueLg.city"}
                  value={watch("issueLg.city")}
                  setValue={setValue}
                  disabled={isLoadingIssue || !isoCodeIssue}
                  data={
                    citiesIssue?.success
                      ? Array.from(
                          new Set(
                            citiesIssue.response.map((city: any) => city.name)
                          )
                        )
                      : []
                  }
                />
              )}
            </div>

            {/* Corporate Wants to Collect Section */}
            <div className="w-full bg-gray-50 p-4 rounded-lg mb-4 border border-gray-300">
              <p className="text-sm font-semibold mb-2">
                Corporate wants to Collect LG in{" "}
                <span className="text-blue-500">
                  {formatFirstLetterOfWord(data.lgCollectIn.city)},{" "}
                  {formatFirstLetterOfWord(data.lgCollectIn.country)}
                </span>
              </p>
              <div className="flex items-center gap-3">
                <BgRadioInputLG
                  id="acceptRequestCollect"
                  label="Accept Request"
                  extraClass="h-12"
                  name="collectLg.type"
                  value="accept"
                  checked={lgCollectInType === "accept"}
                  onChange={(e) => setValue("collectLg.type", e.target.value)}
                />
                <BgRadioInputLG
                  id="alternateRequestCollect"
                  label="If no, Alternate"
                  extraClass="h-12"
                  name="collectLg.type"
                  value="alternate"
                  checked={lgCollectInType === "alternate"}
                  onChange={(e) => setValue("collectLg.type", e.target.value)}
                />
              </div>

              {/* Input Fields with Labels */}
              {["email", "branchName", "branchAddress"].map((field) => (
                <div
                  key={field}
                  className="mb-3 flex items-center border bg-white rounded-md h-12"
                >
                  <p className="flex-1 pl-3 text-sm capitalize">
                    {field === "branchName"
                      ? "Branch Name"
                      : field === "branchAddress"
                      ? "Branch Address"
                      : "Branch Email"}
                  </p>
                  <Input
                    placeholder="Enter Text"
                    className="text-sm text-end flex-1 h-full border-none focus:ring-0 focus:outline-none px-3"
                    register={register}
                    type="text"
                    name={`collectLg.${field}`}
                  />
                </div>
              ))}
              {lgCollectInType === "alternate" && (
                <DDInput
                  placeholder="Select City"
                  label="City"
                  id={"collectLg.city"}
                  value={watch("collectLg.city")}
                  setValue={setValue}
                  disabled={isLoadingCollect || !isoCodeCollect}
                  data={
                    citiesCollect?.success
                      ? Array.from(
                          new Set(
                            citiesCollect.response.map((city: any) => city.name)
                          )
                        )
                      : []
                  }
                />
              )}
            </div>

            {/* Preview Button */}
            <Button
              type="submit"
              className="w-full mt-4 bg-[#f1f1f5] text-black hover:bg-[#e4e4ec]"
            >
              Preview
            </Button>
          </div>
          <ApplicantQuery />
        </form>
      )}
    </div>
  );
};

export default LGIssuanceCashMarginDialog;
