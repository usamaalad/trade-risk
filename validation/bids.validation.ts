import * as Yup from "yup";

export const addBidTypes = Yup.object().shape({
  validity: Yup.date().required("Validity date is required"),
  confirmationPrice: Yup.string()
    .required("Confirmation price is required")
    .matches(/^\d+(\.\d+)?$/, "Enter a valid number")
    .test(
      "is-valid-confirmation-price",
      "Confirmation price must be greater than 0 and less than or equal to 100",
      (value) => {
        if (!value) return false;
        const numericValue = parseFloat(value); // Parse the number from string
        return numericValue > 0 && numericValue <= 100;
      }
    ),
});

export const getRiskAddBidTypes = (isCounterOffer: boolean, riskData: any) => {
  return Yup.object().shape({
    bidValidity: Yup.date().required("Validity date is required"),
    confirmationPrice: Yup.string().test(
      "is-valid-confirmation-price",
      "Confirmation price must be greater than 0 and less than or equal to 100",
      (value, context) => {
        if (isCounterOffer) {
          if (!value)
            return context.createError({
              message: "Confirmation price is required",
            });
          const numericValue = parseFloat(value);
          return numericValue > 0 && numericValue <= 100;
        }
        const offeredPrice =
          riskData?.riskParticipationTransaction?.pricingOffered;
        if (!offeredPrice || offeredPrice <= 0 || offeredPrice > 100) {
          return context.createError({
            message: "Confirmation price must be within the valid range",
          });
        }
        return true;
      }
    ),
  });
};
