"use client";
import CreateLCLayout from "@/components/layouts/CreateLCLayout";
import { Button } from "@/components/ui/button";
import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7,
  Step7Disounting,
} from "@/components/LCSteps";
import { BgRadioInput, RadioInput } from "@/components/LCSteps/helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DiscountBanks,
  Period,
  Transhipment,
} from "@/components/LCSteps/Step3Helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { onCreateLC, onUpdateLC } from "@/services/apis/lcs.api";
import { usePathname, useRouter } from "next/navigation";
import { confirmationDiscountSchema } from "@/validation/lc.validation";
import Loader from "@/components/ui/loader";
import useLoading from "@/hooks/useLoading";
import { getCountries, getCurrenncy } from "@/services/apis/helpers.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Country } from "@/types/type";
import { DisclaimerDialog } from "@/components/helpers";
import useConfirmationDiscountingStore, {
  getStateValues,
} from "@/store/confirmationDiscounting.store";

const ConfirmationPage = () => {
  const {
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof confirmationDiscountSchema>>({
    resolver: zodResolver(confirmationDiscountSchema),
  });

  const queryClient = useQueryClient();
  const btnRef = useRef();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const router = useRouter();
  const pathname = usePathname();

  const [valueChanged, setValueChanged] = useState<boolean>(false);

  const setValues = useConfirmationDiscountingStore((state) => state.setValues);
  const confirmationData = useConfirmationDiscountingStore((state) => state);
  useEffect(() => {
    if (confirmationData && confirmationData?._id) {
      Object.entries(confirmationData).forEach(([key, value]) => {
        // @ts-ignore
        setValue(key, value);
        if (key === "transhipment") {
          setValue(key, value === true ? "yes" : "no");
        }
        if (key === "lcPeriod.expectedDate") {
          setValue(key, value === true ? "yes" : "no");
        }
      });
    }
    setValueChanged(!valueChanged);
  }, [confirmationData]);

  // Show errors
  useEffect(() => {
    if (errors) {
      const showNestedErrors = (errorsObj: any, parentKey = "") => {
        Object.keys(errorsObj)
          .reverse()
          .forEach((key) => {
            const errorMessage =
              errorsObj[key as keyof typeof errorsObj]?.message;

            if (errorMessage) {
              // const fieldName = parentKey ? `${parentKey}.${key}` : key;
              toast.error(`${errorMessage}`);
            } else if (typeof errorsObj[key] === "object") {
              showNestedErrors(errorsObj[key], key);
            }
          });
      };

      showNestedErrors(errors);
    }
  }, [errors]);

  const [proceed, setProceed] = useState(false);

  const onSubmit: SubmitHandler<
    z.infer<typeof confirmationDiscountSchema>
  > = async (data: z.infer<typeof confirmationDiscountSchema>) => {
    if (proceed) {
      startLoading();
      const reqData = {
        ...data,
        transhipment: data.transhipment === "yes" ? true : false,
        lcType: "LC Confirmation & Discounting",
        shipmentPort: {
          ...data?.shipmentPort,
          port: "xyz",
        },
        lcPeriod: {
          ...data.lcPeriod,
          expectedDate: data.lcPeriod.expectedDate === "yes" ? true : false,
        },
      };

      const { response, success } = confirmationData?._id
        ? await onUpdateLC({
            payload: reqData,
            id: confirmationData?._id,
          })
        : await onCreateLC(reqData);
      stopLoading();
      if (!success) return toast.error(response);
      else {
        toast.success(response?.message);
        setValues(
          getStateValues(useConfirmationDiscountingStore.getInitialState())
        );
        reset();
        router.push("/");
      }
    } else {
      let openDisclaimerBtn = document.getElementById("open-disclaimer");
      // @ts-ignore
      openDisclaimerBtn.click();
      setProceed(true)
    }
  };

  const [loader, setLoader] = useState(false);

  const saveAsDraft: SubmitHandler<
    z.infer<typeof confirmationDiscountSchema>
  > = async (data: z.infer<typeof confirmationDiscountSchema>) => {
    setLoader(true);
    const reqData = {
      ...data,
      transhipment: data.transhipment === "yes" ? true : false,
      lcType: "LC Confirmation & Discounting",
      isDraft: "true",
      shipmentPort: {
        ...data?.shipmentPort,
        port: "xyz",
      },
      lcPeriod: {
        ...data.lcPeriod,
        expectedDate: data.lcPeriod.expectedDate === "yes" ? true : false,
      },
    };
    const { response, success } = confirmationData?._id
      ? await onUpdateLC({
          payload: reqData,
          id: confirmationData?._id,
        })
      : await onCreateLC(reqData);

    setLoader(false);
    if (!success) return toast.error(response);
    else {
      toast.success("LC saved as draft");
      setValues(
        getStateValues(useConfirmationDiscountingStore.getInitialState())
      );
      reset();
      queryClient.invalidateQueries({
        queryKey: ["fetch-lcs-drafts"],
      });
    }
  };

  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [countries, setCountries] = useState([]);
  const [flags, setFlags] = useState([]);

  const { data: countriesData } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getCountries(),
  });

  useEffect(() => {
    if (
      countriesData &&
      countriesData.success &&
      countriesData.response &&
      countriesData.response.length > 0
    ) {
      setAllCountries(countriesData.response);
      const fetchedCountries = countriesData.response.map(
        (country: Country) => {
          return country.name;
        }
      );
      setCountries(fetchedCountries);
      const fetchedFlags = countriesData.response.map((country: Country) => {
        return country.flag;
      });
      setFlags(fetchedFlags);
    }
  }, [countriesData]);

  const { data: currency } = useQuery({
    queryKey: ["currency"],
    queryFn: () => getCurrenncy(),
  });

  const [checkedState, setCheckedState] = useState({
    "payment-sight": false,
    "payment-usance": false,
    "payment-deferred": false,
    "payment-upas": false,
  });

  const handleCheckChange = (id: string) => {
    setCheckedState((prevState) => ({
      ...prevState,
      "payment-sight": id === "payment-sight",
      "payment-usance": id === "payment-usance",
      "payment-deferred": id === "payment-deferred",
      "payment-upas": id === "payment-upas",
    }));
  };

  let amount = getValues("amount");
  let currencyVal = getValues("currency");
  useEffect(() => {
    if (amount) {
      setValue("amount", amount.toString());
      setValue("currency", currencyVal);
    }
  }, [valueChanged]);

  // reset the form on page navigation
  useEffect(() => {
    const handleRouteChange = () => {
      setValues(
        getStateValues(useConfirmationDiscountingStore.getInitialState())
      );
      reset();
    };

    handleRouteChange();
  }, [pathname, router]);

  return (
    <CreateLCLayout>
      <form className="border border-borderCol py-4 px-3 w-full flex flex-col gap-y-5 mt-4 rounded-lg bg-white">
        <Step1 register={register} />
        {/* Step 2 */}
        <div className="py-3 px-2 border border-borderCol rounded-lg w-full">
          <div className="flex items-center gap-x-2 justify-between mb-3">
            <div className="flex items-center gap-x-2 ml-3">
              <p className="size-6 rounded-full bg-primaryCol center text-white font-semibold">
                2
              </p>
              <p className="font-semibold text-lg text-lightGray">Amount</p>
            </div>
            <div className="flex items-center gap-x-2">
              <Select onValueChange={(value) => setValue("currency", value)}>
                <SelectTrigger className="w-[100px] bg-borderCol/80">
                  <SelectValue placeholder="USD" defaultValue="USD" />
                </SelectTrigger>
                <SelectContent>
                  {currency &&
                    currency.response.length > 0 &&
                    currency.response.map((curr: string, idx: number) => (
                      <SelectItem key={`${curr}-${idx}`} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                register={register}
                name="amount"
                className="border border-borderCol focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="border border-borderCol px-2 py-3 rounded-md bg-[#F5F7F9]">
            <h5 className="font-semibold ml-3">LC Payment Terms</h5>
            <div className="flex items-center gap-x-3 w-full mt-2">
              <BgRadioInput
                id="payment-sight"
                label="Sight LC"
                name="paymentTerms"
                value="sight-lc"
                register={register}
                checked={checkedState["payment-sight"]}
                handleCheckChange={handleCheckChange}
              />
              <BgRadioInput
                id="payment-usance"
                label="Usance LC"
                name="paymentTerms"
                value="usance-lc"
                register={register}
                checked={checkedState["payment-usance"]}
                handleCheckChange={handleCheckChange}
              />
              <BgRadioInput
                id="payment-deferred"
                label="Deferred LC"
                name="paymentTerms"
                value="deferred-lc"
                register={register}
                checked={checkedState["payment-deferred"]}
                handleCheckChange={handleCheckChange}
              />
              <BgRadioInput
                id="payment-upas"
                label="UPAS LC (Usance payment at sight)"
                name="paymentTerms"
                value="upas-lc"
                register={register}
                checked={checkedState["payment-upas"]}
                handleCheckChange={handleCheckChange}
              />
            </div>
          </div>
        </div>
        {/* Step 3 */}
        <div className="py-3 px-2 border border-borderCol rounded-lg w-full">
          <div className="flex items-center gap-x-2 ml-3 mb-3">
            <p className="size-6 rounded-full bg-primaryCol center text-white font-semibold">
              3
            </p>
            <p className="font-semibold text-lg text-lightGray">LC Details</p>
          </div>
          <DiscountBanks
            countries={countries}
            flags={flags}
            setValue={setValue}
            getValues={getValues}
          />
          {/* Period */}
          <Period
            setValue={setValue}
            getValues={getValues}
            countries={countries}
            flags={flags}
            valueChanged={valueChanged}
            setValueChanged={setValueChanged}
          />
          {/* Transhipment */}
          <Transhipment
            getValues={getValues}
            register={register}
            setValue={setValue}
            valueChanged={valueChanged}
          />
        </div>

        <Step4
          register={register}
          countries={countries}
          setValue={setValue}
          getValues={getValues}
          flags={flags}
        />
        <Step5
          register={register}
          isConfirmation
          countries={countries}
          flags={flags}
          setValue={setValue}
          getValues={getValues}
          valueChanged={valueChanged}
          setValueChanged={setValueChanged}
        />

        <div className="flex items-start gap-x-4 h-full w-full relative">
          <Step6
            register={register}
            title="Confirmation Info"
            getValues={getValues}
            setValue={setValue}
            valueChanged={valueChanged}
          />
          <Step7Disounting
            getValues={getValues}
            setValue={setValue}
            register={register}
            valueChanged={valueChanged}
          />
        </div>
        <Step7 register={register} step={8} />

        {/* Action Buttons */}
        <div className="flex items-center gap-x-4 w-full">
          <Button
            type="button"
            onClick={handleSubmit(saveAsDraft)}
            disabled={loader}
            variant="ghost"
            className="bg-none w-1/3"
          >
            {loader ? <Loader /> : "Save as draft"}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            size="lg"
            className="bg-primaryCol hover:bg-primaryCol/90 text-white w-2/3"
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? <Loader /> : "Submit request"}
          </Button>
        </div>
        <DisclaimerDialog
          title="Submit Request"
          className="hidden"
          setProceed={setProceed}
          onAccept={handleSubmit(onSubmit)}
          />
      </form>
    </CreateLCLayout>
  );
};

export default ConfirmationPage;
