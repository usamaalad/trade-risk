"use client";
import {
  RiskBanks,
  RiskAgreement,
  RiskStep1,
  RiskStep4,
  RiskStep5,
  RiskStep6,
  RiskStep8,
  RiskStep3,
  RiskStep2,
} from "@/components/RiskSteps";
import CreateLCLayout from "@/components/layouts/CreateLCLayout";
import { Button } from "@/components/ui/button";
import useCountries from "@/hooks/useCountries";
import useLoading from "@/hooks/useLoading";
import { onCreateRisk, onUpdateRisk } from "@/services/apis/risk.api";
import useFormStore, { getStateValues } from "@/store/risk.store";
import { bankCountries } from "@/utils/data";
import { generalRiskSchema } from "@/validation/risk.validation";
import Loader from "../../../components/ui/loader";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as Yup from "yup";
import useRiskStore from "@/store/risk.store";
import LgStep12 from "@/components/LG-Steps/LgStep12";
import { Step7 } from "@/components/LCSteps";

const RiskFundedPage = () => {
  const { register, setValue, reset, watch, getValues, control, handleSubmit } =
    useForm({});
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [isDraftLoading, setIsDraftLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const { countries, flags } = useCountries();
  const [days, setDays] = useState<number>(90);
  const countryNames = bankCountries.map((country) => country.name);
  const countryFlags = bankCountries.map((country) => country.flag);

  useEffect(() => {
    router.prefetch("/");
  }, []);

  // const hideStep6 = riskParticipationTransaction === "LC Confirmation";
  const hideStep6 = true;

  const formData = useRiskStore((state) => state);
  const setFormData = useRiskStore((state) => state.setValues);

  const cleanData = (data) => {
    const cleanedData = { ...data };
    Object.keys(cleanedData).forEach((key) => {
      if (
        cleanedData[key] === "" ||
        cleanedData[key] === undefined ||
        cleanedData[key] === null
      ) {
        delete cleanedData[key];
      }
    });
    if (!cleanedData.expectedDateConfimation) {
      delete cleanedData.expectedDateConfimation;
    }
    return cleanedData;
  };

  useEffect(() => {
    if (formData && formData?._id) {
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "number" || typeof value === "string") {
          setValue(key, value);
        } else if (typeof value === "boolean") {
          setValue(key, value ? "yes" : "no");
        } else if (typeof value === "object" && value !== null) {
          if (!Object.values(value).every((v) => v === "")) {
            setValue(key, value);
          }
        }
        if (key === "extraInfo") {
          setDays(value?.days);
          setValue("extraInfo.days", value.days);
          setValue("extraInfo.other", value?.other);
        }
      });
    }
  }, [formData, setValue]);

  useEffect(() => {
    const handleRouteChange = () => {
      setFormData(getStateValues(useRiskStore.getInitialState()));
      reset();
    };
    handleRouteChange();
  }, [router, pathname, setFormData, reset]);

  const onSubmit: SubmitHandler<typeof generalRiskSchema> = async (
    data,
    isDraft
  ) => {
    let extraInfoObj;
    console.log(data, "data");
    if (
      data.paymentTerms &&
      data.paymentTerms !== "Sight LC" &&
      data.extraInfo
    ) {
      console.log("something");
      extraInfoObj = { days: days, other: data.extraInfo.other };
    }

    const preparedData = {
      ...data,
    };

    try {
      const validationResult = await generalRiskSchema.validate(preparedData, {
        abortEarly: false,
      });
      console.log(validationResult, "validation");

      const reqData = {
        ...validationResult,
        draft: false,
      };

      // Clean up the reqData object
      const cleanedReqData = { ...reqData };
      const fieldsToRemove = [
        "draft",
        "updatedAt",
        "createdAt",
        "createdBy",
        "isDeleted",
        "__v",
        "_id",
        "status",
        "refId",
      ];
      fieldsToRemove.forEach((field) => delete cleanedReqData[field]);

      try {
        startLoading(); // Start the general loading state
        let result;
        if (formData?._id) {
          result = await onUpdateRisk({
            id: formData?._id,
            payload: cleanedReqData,
          });
        } else {
          result = await onCreateRisk(cleanedReqData);
        }

        const { response, success } = result;

        if (!success) {
          toast.error(response);
        } else {
          console.log(response, "response");
          toast.success("Risk created successfully");
          router.push("/risk-participation");
          reset();
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred");
      } finally {
        stopLoading(); // Stop the general loading state
      }
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        validationError.errors.forEach((errorMessage) => {
          toast.error(`Error: ${errorMessage}`);
        });
      } else {
        console.error("Unexpected error during validation:", validationError);
      }
    }
  };

  const onSaveAsDraft: SubmitHandler<typeof generalRiskSchema> = async (
    data
  ) => {
    setIsDraftLoading(true); // Start the draft loading state
    const reqData = {
      ...data,
      transhipment: data?.transhipment === "no" ? false : true,
      draft: true,
    };
    console.log(reqData, "REQDATA");
    try {
      let result;
      if (formData?._id) {
        result = await onUpdateRisk({ id: formData?._id, payload: reqData });
      } else {
        result = await onCreateRisk(reqData);
      }

      const { response, success } = result;
      if (!success) {
        toast.error(response);
      } else {
        toast.success("Risk draft created successfully");
        router.push("/risk-participation");
        reset();
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDraftLoading(false); // Stop the draft loading state
    }
  };

  return (
    <CreateLCLayout isRisk={true}>
      <form className="mt-2 flex flex-col gap-y-5">
        <RiskBanks
          countries={countries}
          flags={flags}
          register={register}
          watch={watch}
          setValue={setValue}
        />
        <RiskAgreement watch={watch} setValue={setValue} />
        <RiskStep1 register={register} watch={watch} setValue={setValue} />
        <RiskStep2 register={register} watch={watch} setValue={setValue} />

        <RiskStep3
          countries={countryNames}
          flags={countryFlags}
          register={register}
          watch={watch}
          setValue={setValue}
          days={days}
          setDays={setDays}
        />
        <RiskStep4
          countries={countries}
          flags={flags}
          register={register}
          watch={watch}
          setValue={setValue}
        />

        <RiskStep5
          register={register}
          watch={watch}
          setValue={setValue}
          countries={countries}
          flags={flags}
        />
        {hideStep6 ? null : <RiskStep6 register={register} watch={watch} />}

        <div className="relative flex items-center justify-between h-full gap-x-2">
          <div className="w-1/2 bg-white rounded-md">
            <Step7 step={6} watch={watch} setValue={setValue} />
          </div>
          <div className="w-1/2 space-y-2">
            <div className="bg-white rounded-lg">
              <LgStep12
                register={register}
                setValue={setValue}
                step={7}
                watch={watch}
              />
            </div>
            <RiskStep8
              step={hideStep6 ? 8 : undefined}
              watch={watch}
              register={register}
            />
          </div>
        </div>

        <div className="py-4 px-4 border border-borderCol rounded-lg w-full bg-white flex items-center justify-between gap-x-4">
          <Button
            id="draft"
            variant="ghost"
            className="w-1/3 py-6 text-[16px] text-lightGray bg-[#F1F1F5]"
            onClick={handleSubmit(onSaveAsDraft)}
            disabled={isLoading || isDraftLoading}
          >
            {isDraftLoading ? <Loader /> : "Save as draft"}
          </Button>
          <Button
            type="button"
            className="w-2/3 py-6 text-[16px] bg-text hover:bg-text/90 text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || isDraftLoading}
          >
            {isLoading ? <Loader /> : "Submit Request"}
          </Button>
        </div>
      </form>
    </CreateLCLayout>
  );
};

export default RiskFundedPage;
