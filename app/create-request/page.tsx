"use client";
import CreateLCLayout from "@/components/layouts/CreateLCLayout";
import { Button } from "@/components/ui/button";
import { DisclaimerDialog } from "@/components/helpers";
import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7,
} from "@/components/LCSteps";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { onCreateLC } from "@/services/apis/lcs.api";
import { confirmationSchema } from "@/validation/lc.validation";
import useLoading from "@/hooks/useLoading";
import Loader from "../../components/ui/loader";
import { useRouter } from "next/navigation";

const CreateRequestPage = () => {
  const {
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof confirmationSchema>>({
    resolver: zodResolver(confirmationSchema),
  });
  const { startLoading, stopLoading, isLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    if (errors) {
      const showNestedErrors = (errorsObj: any, parentKey = "") => {
        Object.keys(errorsObj)
          .reverse()
          .forEach((key) => {
            const errorMessage =
              errorsObj[key as keyof typeof errorsObj]?.message;

            if (errorMessage) {
              const fieldName = parentKey ? `${parentKey}.${key}` : key;
              toast.error(`${fieldName}: ${errorMessage}`);
            } else if (typeof errorsObj[key] === "object") {
              showNestedErrors(errorsObj[key], key);
            }
          });
      };

      showNestedErrors(errors);
    }
  }, [errors]);
  const onSubmit: SubmitHandler<z.infer<typeof confirmationSchema>> = async (
    data: z.infer<typeof confirmationSchema>
  ) => {
    startLoading();
    const reqData = {
      ...data,
      lcType: "LC Confirmation",
      transhipment: data.transhipment === "yes" ? true : false,
    };

    const { response, success } = await onCreateLC(reqData);
    stopLoading();
    if (!success) return toast.error(response);
    else {
      toast.success(response?.message);
      reset();
      router.push("/");
    }
  };

  return (
    <CreateLCLayout>
      <form
        className="border border-borderCol bg-white py-4 px-3 w-full flex flex-col gap-y-5 mt-4 rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Step1 register={register} />
        <Step2 register={register} />
        <Step3 register={register} setValue={setValue} />
        <Step4 register={register} setValue={setValue} />
        <Step5 register={register} setValue={setValue} />
        <div className="flex items-start gap-x-4 h-full w-full relative">
          <Step6
            register={register}
            setValue={setValue}
            getValues={getValues}
            title="Confirmation Charges"
          />
          <Step7 register={register} step={7} />
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-x-4 w-full">
          <Button type="button" variant="ghost" className="bg-none w-1/3">
            Save as draft
          </Button>
          <Button
            size="lg"
            disabled={isLoading}
            className="bg-primaryCol hover:bg-primaryCol/90 text-white w-2/3"
          >
            {isLoading ? <Loader /> : "Submit request"}
          </Button>
        </div>
        {/* <DisclaimerDialog /> */}
      </form>
    </CreateLCLayout>
  );
};

export default CreateRequestPage;
