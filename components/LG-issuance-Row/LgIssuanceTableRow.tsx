import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TableDataCell } from "../shared/RequestTable";
import { LgStepsProps5 } from "@/types/lg";
import { Check, Link, X } from "lucide-react";
import { Input } from "../ui/input";
import { DatePicker } from "../helpers";
import { values } from "@/utils";
import { cn } from "@/lib/utils";
import useLcIssuance from "@/store/issueance.store";
import { Button } from "../ui/button";
import FileUploadService from "@/services/apis/fileUpload.api";

const LgIssuanceTableRow: FC<LgStepsProps5> = ({
  register,
  setValue,
  setStepCompleted,
  watch,
  name,
  listValue,
  currency,
  onPercentageChange,
  onBondCheck,
}) => {
  const [displayPercentage, setDisplayPercentage] = useState("");
  const checkedValue = watch(`${name}.Contract`, false);
  const expectedDate = watch(`${name}.expectedDate`);
  const lgExpiryDate = watch(`${name}.lgExpiryDate`);
  const cashMargin = watch(`${name}.cashMargin`);
  const valueInPercentage = watch(`${name}.valueInPercentage`);
  const currencyType = watch(`${name}.currencyType`);
  const pricing = watch(`${name}.expectedPricing`);
  const lgTenorType = watch(`${name}.lgTenor.lgTenorType`);
  const lgTenorValue = watch(`${name}.lgTenor.lgTenorValue`);
  const otherBondName = watch(`${name}.name`);
  const attachments = watch(`${name}.attachments`);

  // Reference to file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      FileUploadService.upload(
        selectedFile,
        (url, firebaseFileName) => {
          const uploadedFile = {
            file: selectedFile,
            url,
            userFileName: selectedFile.name,
            firebaseFileName,
            fileSize: selectedFile.size,
            fileType: selectedFile.type.split("/")[1].toUpperCase(),
          };

          setValue(`${name}.attachments`, [uploadedFile]);
        },
        (error) => {
          console.log(error);
        },
        (progressBar, progress) => {
          console.log(progress);
        }
      );
    }
  };

  const handleRemoveFile = () => {
    if (attachments && attachments.length > 0) {
      FileUploadService.delete(
        attachments[0].firebaseFileName,
        () => {
          setValue(`${name}.attachments`, []);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };

  const currencyOptions = useMemo(
    () =>
      currency?.response.map((curr: string, idx: number) => (
        <SelectItem key={`${curr}-${idx + 1}`} value={curr}>
          {curr}
        </SelectItem>
      )),
    [currency]
  );

  const { data } = useLcIssuance();
  useEffect(() => {
    //@ts-ignore
    if (data[name]?.name) {
      //@ts-ignore
      setValue(`${name}.name`, data[name]?.name);
    }
  }, [data]);

  const lgDetails = watch("lgDetailsType");

  const handleOnChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const value = event.target.value;
    const filteredValue = value.replace(/[^0-9]/g, "");
    setValue(name, !filteredValue ? 0 : parseInt(filteredValue));
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(pricing) || 0;
    const newValue = Math.min(
      100,
      Math.round((currentValue + 0.1) * 100) / 100
    ).toFixed(2);
    setValue(`${name}.expectedPricing`, newValue);
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(pricing) || 0;
    const newValue = Math.max(
      0,
      Math.round((currentValue - 0.1) * 100) / 100
    ).toFixed(2);
    setValue(`${name}.expectedPricing`, newValue);
  };

  const handlePercentageBlur = () => {
    if (valueInPercentage) {
      setDisplayPercentage(`${valueInPercentage}%`);
    } else {
      setDisplayPercentage("");
    }
  };

  const handlePercentageFocus = () => {
    setDisplayPercentage(valueInPercentage?.toString() || "");
  };

  const handlePercentageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseInt(event.target.value) || 0;
    onPercentageChange(name, newValue);
  };

  const handleBondCheck = (isChecked: boolean) => {
    if (!lgDetails) return;
    setValue(`${name}.percentage`, "");
    setValue(`${name}.Contract`, isChecked);
    onBondCheck(name, isChecked);
  };

  return (
    <TableRow
      className={`mt-5 ${checkedValue ? "bg-white" : "bg-[#F5F7F9]"}`}
      id={`${name}`}
      key={`${name + listValue!}`}
    >
      {lgDetails !== "Choose any other type of LGs" ? (
        <TableDataCell className="min-w-[250px]">
          <div
            className={`flex gap-2 items-center flex-wrap ${
              !lgDetails && "opacity-50"
            }`}
          >
            <div
              onClick={() => handleBondCheck(!checkedValue)}
              className="bg-white border-[#5625F2] border-2 rounded-[5px] flex items-center justify-center h-[22px] w-[22px] cursor-pointer"
            >
              {checkedValue ? (
                <Check size={18} style={{ color: "#5625F2" }} />
              ) : null}
            </div>
            <p style={{ textAlign: "left" }} className="text-sm">
              {listValue}
            </p>
          </div>
        </TableDataCell>
      ) : (
        <Select
          onValueChange={(value) => {
            setValue(`${name}.Contract`, true);
            setValue(`${name}.name`, value);
          }}
          value={otherBondName}
        >
          <SelectTrigger className="ml-2">
            <SelectValue placeholder="Select LG Type" />
          </SelectTrigger>
          <SelectContent>
            {values.map((value: string, idx: number) => (
              <SelectItem key={`${value}-${idx}`} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <TableCell>
        <Select
          disabled={!checkedValue}
          value={currencyType}
          onValueChange={(value) => {
            setValue(`${name}.currencyType`, value);
          }}
        >
          <SelectTrigger className="bg-borderCol/80" defaultValue={"USD"}>
            <SelectValue placeholder={"USD"} />
          </SelectTrigger>
          <SelectContent>{currencyOptions}</SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          disabled={!checkedValue}
          value={cashMargin}
          className="min-w-[130px]"
          register={register}
          name={`${name}.cashMargin`}
          type="text"
          placeholder="Amount"
        />
      </TableCell>
      <TableCell>
        <Input
          register={register}
          disabled={!checkedValue}
          value={displayPercentage || valueInPercentage}
          name={`${name}.valueInPercentage`}
          onChange={handlePercentageChange}
          onBlur={handlePercentageBlur}
          onFocus={handlePercentageFocus}
          placeholder="%"
          className="placeholder:text-end"
        />
      </TableCell>
      <TableCell>
        <DatePicker
          value={expectedDate}
          leftText={false}
          name={`${name}.expectedDate`}
          setValue={setValue}
          disabled={!checkedValue}
        />
      </TableCell>
      <TableCell>
        <DatePicker
          value={lgExpiryDate}
          leftText={false}
          name={`${name}.lgExpiryDate`}
          setValue={setValue}
          disabled={!checkedValue}
        />
      </TableCell>
      <TableCell className="flex gap-2">
        <Select
          disabled={!checkedValue}
          value={lgTenorType || "Months"} // Ensures "Months" is the default if lgTenorType is undefined
          onValueChange={(value) => {
            setValue(`${name}.lgTenor.lgTenorType`, value);
          }}
        >
          <SelectTrigger className="bg-borderCol/80">
            <SelectValue placeholder="Months" />
          </SelectTrigger>
          <SelectContent>
            {["Days", "Months", "Years"].map((time: string, idx: number) => (
              <SelectItem key={`${time}-${idx}`} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          disabled={!checkedValue}
          register={register}
          value={lgTenorValue}
          name={`${name}.lgTenor.lgTenorValue`}
          onChange={(e) => handleOnChange(e, `${name}.lgTenor.lgTenorValue`)}
          placeholder="No."
          className="min-w-[60px]"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-x-2 relative">
          <Button
            type="button"
            variant="ghost"
            disabled={!checkedValue}
            className="bg-none border-none text-lg"
            onClick={handleDecrement}
          >
            -
          </Button>
          <input
            placeholder="0%"
            type="text"
            inputMode="numeric"
            disabled={!checkedValue}
            className={cn(
              "flex h-10 text-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-none outline-none focus-visible:ring-0 max-w-[80px] focus-visible:ring-offset-0"
            )}
            max={100}
            value={pricing ? `${pricing}%` : ""}
            onChange={(event) => {
              let newValue = event.target.value.replace(/[^0-9.]/g, "");
              if (newValue.includes(".")) {
                const parts = newValue.split(".");
                parts[1] = parts[1].slice(0, 2); // Limiting to 2 decimal places
                newValue = parts.join(".");
              }
              const numValue = parseFloat(newValue);
              if (numValue > 100) {
                newValue = "100.00";
              } else if (numValue < 0) {
                newValue = "0.00";
              }
              setValue(`${name}.expectedPricing`, newValue || "0.00");
            }}
            onBlur={(event) => {
              if (event.target.value.length === 0) return;
              let value = parseFloat(
                event.target.value.replace("%", "")
              ).toFixed(2); // Remove % for processing
              if (parseFloat(value) > 100) {
                value = "100.00";
              } else if (parseFloat(value) < 0) {
                value = "0.00";
              }
              setValue(`${name}.expectedPricing`, value || "0.00");
            }}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={!checkedValue}
            className="bg-none border-none text-lg"
            onClick={handleIncrement}
          >
            +
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center items-center">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf, .tiff, .jpeg, .jpg, .doc"
            multiple={false}
            onChange={handleFileChange}
          />
          {attachments && attachments.length > 0 ? (
            <div className="mt-2">
              <ul>
                {attachments.map((file: any, index: number) => (
                  <li key={index} className="flex items-center text-xs gap-2">
                    {/* Shorten the file name */}
                    <span
                      className="truncate max-w-[150px]"
                      title={file.userFileName}
                    >
                      {file.userFileName.length > 20
                        ? `${file.userFileName.slice(
                            0,
                            10
                          )}...${file.userFileName.slice(-7)}`
                        : file.userFileName}
                    </span>
                    <X
                      size={16}
                      className="cursor-pointer text-red-500"
                      onClick={handleRemoveFile}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link
              size={20}
              onClick={handleFileInputClick}
              className="cursor-pointer"
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LgIssuanceTableRow;
