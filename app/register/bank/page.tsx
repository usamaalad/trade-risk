"use client";
import { CountrySelect, DisclaimerDialog } from "@/components/helpers";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FloatingInput } from "@/components/helpers/FloatingInput";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { onRegister } from "@/services/apis";
import { bankSchema } from "@/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "@/services/apis/helpers.api";
import { bankCountries } from "@/utils/data";
import { cn } from "@/utils";

export const CheckBoxInput = ({
  label,
  id,
  register,
  onChange,
  checked,
}: {
  label: string;
  id: string;
  register: any;
  onChange?: any;
  checked?: boolean; // Accept checked prop
}) => {
  return (
    <div className="my-2 flex items-center space-x-2 font-roboto w-full">
      <input
        type="checkbox"
        id={id}
        {...register(id)}
        onChange={onChange}
        checked={checked} // Bind checked prop
        className="mt-1 px-2" // Adjust vertical alignment for small screens
      />
      <label
        htmlFor={id}
        className="text-sm leading-none text-[#44444F] whitespace-normal break-words"
      >
        {label}
      </label>
    </div>
  );
};

const BankRegisterPage = () => {
  const router = useRouter();
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    trigger,
  } = useForm({
    resolver: yupResolver(bankSchema),
    mode: "all",
  });

  const accountCountry = watch("accountCountry");
  const bankVal = watch("bank");
  const onSubmit: SubmitHandler<typeof bankSchema> = async (data) => {
    if (!procceed)
      return toast.error("Please view and sign the agreement first");

    const reqData = {
      name: data?.bank,
      email: data?.email,
      type: "bank",
      role: "admin",
      fcmTokens: ["adflskjdfklsdjfkldsj"],
      businessData: {
        name: data?.bank,
        pocName: data?.pocName,
        email: data?.email,
        type: data?.type,
        address: data?.address,
        swiftCode: data?.swiftCode,
        pocEmail: data?.pocEmail,
        pocPhone: data?.pocPhone,
        country: data?.accountCountry,
        confirmationLcs: data?.confirmationLcs,
        discountingLcs: data?.discountingLcs,
        guaranteesCounterGuarantees: data?.guaranteesCounterGuarantees,
        discountingAvalizedBills: data?.discountingAvalizedBills,
        avalizationExportBills: data?.avalizationExportBills,
        riskParticipation: data?.riskParticipation,
      },
    };

    const { response, success } = await onRegister(reqData);
    if (!success) return toast.error(response);
    else {
      toast.success("Account Register successfully");
      router.push("/register/complete");
      console.log("Email = ", response?.data?.email);
      console.log("Password = ", response?.data?.password);
    }
  };

  const [procceed, setProceed] = useState(false);
  const [procceedErr, setProceedErr] = useState(false);
  const [phoneInput, setPhoneInput] = useState<string>("");

  const countryNames = bankCountries.map((country) => country.name);

  const { data: banks, isLoading: banksLoading } = useQuery({
    queryKey: ["banks", accountCountry],
    queryFn: () => getBanks(accountCountry),
    enabled: !!accountCountry,
  });

  useEffect(() => {
    if (isValid && isDirty) setAllowSubmit(true);
    if (!isValid || !isDirty) setAllowSubmit(false);
  }, [errors, isValid, isDirty]);

  useEffect(() => {
    if (procceed) setProceedErr(false);
  }, [procceed]);

  return (
    <AuthLayout>
      <section className="max-xs:px-1 z-10 mx-auto w-full max-w-[800px]">
        <h2 className="text-center text-3xl font-semibold">Register</h2>
        <p className="mt-5 text-center font-roboto text-para">
          Please complete the form below to register your bank. The designated
          point of contact will also serve as the admin for user access at your
          bank.
        </p>
        <form
          className="max-xs:py-8 max-xs:px-4 z-10 mx-auto mt-3 flex w-full max-w-[800px] flex-col gap-y-2 rounded-xl bg-white shadow-md sm:gap-y-[22px] xs:p-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="max-sm:flex-col max-sm:gap-y-3 flex w-full items-center gap-x-2">
            <div className="relative w-full">
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-expanded={countryOpen}
                    role="combobox"
                    className={`w-full justify-between py-6 font-roboto text-sm font-normal capitalize ${
                      accountCountry ? "text-lightGray" : "text-gray-400"
                    } `}
                  >
                    {accountCountry
                      ? countryNames?.find(
                          (country) =>
                            country.toLowerCase() ===
                            accountCountry.toLowerCase()
                        )
                      : "Bank Country"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command className="font-roboto">
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {countryNames &&
                        countryNames.length > 0 &&
                        countryNames.map((country, idx) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={(currentValue) => {
                              setCountryOpen(false); // Close the dropdown
                              setValue("accountCountry", currentValue, {
                                shouldValidate: true,
                              });
                              setValue("bank", "");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                country.toLowerCase() ===
                                  accountCountry?.toLowerCase()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {country}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.accountCountry && (
                <span className="absolute left-0 top-12 mt-1 text-[11px] text-red-500">
                  {errors.accountCountry.message}
                </span>
              )}
            </div>

            <div className="relative w-full">
              <Popover onOpenChange={setBankOpen} open={bankOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!accountCountry}
                    className={`w-full justify-between py-6 font-roboto text-sm font-normal capitalize ${
                      bankVal ? "text-lightGray" : "text-gray-400"
                    } `}
                  >
                    {bankVal
                      ? banks?.response.find(
                          (bank: string) =>
                            bank.toLowerCase() === bankVal.toLowerCase()
                        )
                      : "Bank Name"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[230px] p-0">
                  <Command className="font-roboto">
                    <CommandInput placeholder="Search bank..." />
                    <CommandEmpty>No bank found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {!banksLoading &&
                        banks &&
                        banks.success &&
                        banks?.response.map((bank: string) => (
                          <CommandItem
                            key={bank}
                            value={bank}
                            onSelect={(currentValue) => {
                              setBankOpen(false);
                              setValue("bank", currentValue);
                            }}
                          >
                            {bank}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.name && (
                <span className="absolute mt-1 text-[11px] text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>
          </div>
          <div className="max-sm:flex-col max-sm:gap-y-3 flex w-full items-center gap-x-2">
            <div className="relative w-full">
              <FloatingInput
                name="email"
                placeholder="Bank Email Address"
                register={register}
              />
              {errors.email && (
                <span className="absolute mt-1 text-[11px] text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="relative w-full">
              <FloatingInput
                name="swiftCode"
                placeholder="Swift Code"
                register={register}
              />
              {errors.swiftCode && (
                <span className="absolute mt-1 text-[11px] text-red-500">
                  {errors.swiftCode.message}
                </span>
              )}
            </div>
          </div>
          <div className="max-sm:flex-col max-sm:gap-y-3 flex w-full items-center gap-x-2">
            <div className="relative w-full">
              <FloatingInput
                name="address"
                placeholder="Registered Address"
                register={register}
              />
              {errors.address && (
                <span className="absolute mt-1 text-[11px] text-red-500">
                  {errors.address.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full items-center gap-x-2">
            <div className="relative w-full">
              <FloatingInput
                register={register}
                name="pocName"
                placeholder="Authorized Point of Contact Name"
                type="text"
              />
              {errors.pocName && (
                <span className="absolute mt-1 text-[11px] text-red-500">
                  {errors.pocName.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full items-center gap-x-2">
            <div className="relative w-full">
              <FloatingInput
                register={register}
                name="pocEmail"
                placeholder="Authorized Point of Contact Email"
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
                id="pocPhone"
                className="flex flex-1 items-center justify-between rounded-md bg-white p-1 px-1"
              >
                <div className="w-full">
                  <PhoneInput
                    isOnBoarding
                    value={phoneInput}
                    name="pocPhone"
                    // className="h-10"
                    onChange={(value) => {
                      setValue("pocPhone", value);
                    }}
                  />
                </div>
              </label>

              {/* <TelephoneInput
                name="pocPhone"
                placeholder="POC Telephone"
                setValue={setValue}
                setPhoneInput={setPhoneInput}
                value={phoneInput}
                setAllowSubmit={setAllowSubmit}
                trigger={trigger}
              /> */}
              {errors.pocPhone && (
                <span className="absolute mt-1 text-[11px] text-red-500">
                  {errors.pocPhone.message}
                </span>
              )}
            </div>
          </div>

          <p className="text-[16px] font-semibold">
            Select all the type of deals you would be interested in
          </p>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 gap-x-2 gap-y-1 rounded-lg border border-borderCol bg-[#F5F7F9] p-2 sm:grid-cols-2">
            <CheckBoxInput
              label="Confirmation of LCs"
              id="confirmationLcs"
              register={register}
            />
            <CheckBoxInput
              label="Discounting of LCs"
              id="discountingLcs"
              register={register}
            />
            <CheckBoxInput
              label="Guarantees and counter guarantees"
              id="guaranteesCounterGuarantees"
              register={register}
            />
            <CheckBoxInput
              label="Avalization of Export Bills"
              id="avalizationExportBills"
              register={register}
            />
            <CheckBoxInput
              label="Avalization & Discounting of Avalized Bills"
              id="discountingAvalizedBills"
              register={register}
            />
            <CheckBoxInput
              label="Risk Participation (bank to bank)"
              id="riskParticipation"
              register={register}
            />
            <CheckBoxInput
              label="LC Confirmation & Discounting"
              id="lcConfirmationDiscounting"
              register={register}
            />
          </div>

          {/* PDF */}
          <div>
            <div className="flex items-center justify-between gap-x-2 rounded-lg border border-borderCol p-2">
              <div className="flex items-center gap-x-2">
                <Button
                  type="button"
                  className="bg-red-200 p-1 hover:bg-red-300"
                >
                  <Image
                    src="/images/pdf.png"
                    alt="pdf"
                    width={500}
                    height={500}
                    className="size-8"
                  />
                </Button>
                <span className="text-sm text-[#50B5FF] underline">
                  <DisclaimerDialog
                    title="Click to view and sign the agreement"
                    className="underline"
                    setProceed={setProceed}
                  />
                </span>
              </div>
              {procceed && <Check className="text-[#29C084]" strokeWidth={3} />}
            </div>
            {procceedErr && (
              <span className="absolute mt-1 text-[11px] text-red-500">
                Please view and sign the agreement first
              </span>
            )}
          </div>
          <p className="font-roboto text-sm text-para">
            By signing up you agree that final confirmation to abide by the
            above and the transaction will be processed, (based on Legal rules
            and regulation of the country)
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-x-2">
            <Link href="/login" className="w-1/3 text-center">
              <Button
                type="button"
                variant="ghost"
                className="w-full bg-[#F5F7F9] text-[16px] text-para"
              >
                Login
              </Button>
            </Link>
            <Button
              className="w-full rounded-lg bg-primaryCol text-[16px] hover:bg-primaryCol/90 disabled:bg-[#5625F2]/30 disabled:text-white"
              size="lg"
              // disabled={!isValid}
              type="button"
              onClick={(e) => {
                if (procceed) handleSubmit(onSubmit)();
                else setProceedErr(true);
              }}
            >
              Get Started
            </Button>
          </div>
        </form>
      </section>
    </AuthLayout>
  );
};

export default BankRegisterPage;
