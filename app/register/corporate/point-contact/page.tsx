"use client";
import CorporateStepLayout from "@/components/layouts/CorporateStepLayout";
import { FloatingInput } from "@/components/helpers/FloatingInput";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Paperclip, X } from "lucide-react";
import useRegisterStore from "@/store/register.store";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { pointOfContractSchema } from "@/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { PhoneInput } from "@/components/ui/phone-input";
import { phoneVerification } from "@/services/apis";
import { toast } from "sonner";

const PointContactPage = () => {
  const router = useRouter();

  const setValues = useRegisterStore((state) => state.setValues);
  const {
    register,
    setValue,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(pointOfContractSchema),
    mode: "all",
  });

  const contactData =
    typeof window !== "undefined" ? localStorage.getItem("contactData") : null;

  const [allowSubmit, setAllowSubmit] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (contactData) {
      const data = JSON.parse(contactData);
      data && setValues(data);
      Object.entries(data).forEach(([key, value]) => {
        // @ts-ignore
        setValue(key, value);
      });
    }
  }, [contactData]);

  useEffect(() => {
    if (contactData) {
      setAllowSubmit(true);
    } else if (isValid && pdfFile) {
      setAllowSubmit(true);
    } else {
      setAllowSubmit(false);
    }
  }, [errors, isValid, isDirty, contactData, pdfFile]);

  const onSubmit: SubmitHandler<typeof pointOfContractSchema> = async (
    data: any,
  ) => {
    if (!pdfFile) {
      setPdfError(true);
      return;
    }
    const { success } = await phoneVerification(data.pocPhone);

    if (!success) {
      toast.error("Invalid phone number");
      return;
    }

    setValues(data);

    localStorage.setItem("contactData", JSON.stringify(data));
    router.push("/register/corporate/current-banking");
  };

  const [phoneInput, setPhoneInput] = useState<string>("");
  let phone = getValues("pocPhone");

  return (
    <CorporateStepLayout
      step={2}
      title="Point of Contact"
      text="Give us the details of the POC our sales team should get in touch with after verification"
    >
      <form
        className="z-10 mt-5 flex w-full max-w-2xl flex-col gap-y-6 rounded-xl bg-white p-8 shadow-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center gap-x-2">
          <div className="relative w-full">
            <FloatingInput
              register={register}
              type="text"
              name="pocName"
              placeholder="Authorized Point of Contact"
            />
            {errors.pocName && (
              <span className="absolute mt-1 text-[11px] text-red-500">
                {errors.pocName.message}
              </span>
            )}
          </div>
          <div className="relative w-full">
            <FloatingInput
              type="text"
              name="pocDesignation"
              placeholder="POC Designation"
              register={register}
            />
            {errors.pocDesignation && (
              <span className="absolute mt-1 text-[11px] text-red-500">
                {errors.pocDesignation.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="relative w-full">
            <FloatingInput
              register={register}
              name="pocEmail"
              placeholder="Point of Contact Email"
              type="email"
            />
            {errors.pocEmail && (
              <span className="absolute mt-1 text-[11px] text-red-500">
                {errors.pocEmail.message}
              </span>
            )}
          </div>
          <div className="relative w-full">
            <label
              id="beneficiaryDetails.address"
              className="flex w-full items-center justify-between rounded-md bg-white"
            >
              <div className="w-full">
                <PhoneInput
                  value={phoneInput}
                  isOnBoarding={true}
                  className=""
                  name="pocPhone"
                  onChange={(value) => {
                    setValue("pocPhone", value);
                    trigger("pocPhone");
                    setPhoneInput(value);
                  }}
                />
              </div>
            </label>
            {errors.pocPhone && (
              <span className="absolute mt-1 text-[11px] text-red-500">
                {errors.pocPhone.message}
              </span>
            )}
          </div>
        </div>
        <div className="relative w-full font-roboto">
          <label
            htmlFor="pdf-file"
            className="flex cursor-pointer items-center justify-between rounded-md border border-borderCol px-4 py-4"
          >
            <div className="flex items-center gap-x-1">
              <Paperclip className="size-4 text-gray-500" />
              <p className="text-sm">Upload authorization letter</p>
            </div>
            <p className="center relative gap-x-1 text-sm text-[#92929D]">
              {pdfFile && (
                <div
                  className="center z-20 size-4 rounded-full bg-red-500 text-[12px] text-white"
                  onClick={() => setPdfFile(undefined)}
                >
                  <X className="size-3" />
                </div>
              )}
              {pdfFile ? pdfFile.name.substring(0, 20) : "Select PDF file"}
            </p>
          </label>
          <input
            type="file"
            id="pdf-file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files?.[0])}
          />
          {(Object.keys(errors).length > 0 || pdfError) && !pdfFile && (
            <span className="absolute mt-1 text-[11px] text-red-500">
              Please select a file
            </span>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <Button
            className="rounded-lg bg-primaryCol text-[16px] hover:bg-primaryCol/90 disabled:bg-borderCol disabled:text-[#9f9faf]"
            size="lg"
            disabled={!allowSubmit}
          >
            Continue
          </Button>

          <Link href="/register/corporate/product-info" className="text-center">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[16px] text-lightGray"
            >
              Previous
            </Button>
          </Link>
        </div>
      </form>
    </CorporateStepLayout>
  );
};

export default PointContactPage;
