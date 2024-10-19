import * as Yup from "yup";
import { fileSchema } from "./lc.validation";

export const generalRiskSchema = Yup.object().shape({
  // 1. Banks
  banks: Yup.array()
    .of(
      Yup.object().shape({
        country: Yup.string().required("Country is required"),
        city: Yup.string().required("City is required"),
        bank: Yup.string().required("Bank name is required"),
        swiftCode: Yup.string().nullable(),
      })
    )
    .min(1, "Please select at least one bank")
    .required("Banks are required"),

  // Signed Copy
  signedCopy: Yup.array()
    .of(Yup.object().required("Signed copy is required"))
    .min(1, "Please provide at least one signed copy")
    .required("Signed copy is required"),

  // 2. Transaction
  transaction: Yup.string()
    .oneOf(["Risk Participation", "Outright Sales"], "Invalid transaction type")
    .required("Select transaction type"),

  // Risk Participation
  riskParticipation: Yup.string()
    .oneOf(["Non-Funded", "Funded"], "Invalid risk participation type")
    .required("Select risk participation"),

  // Transaction Type
  transactionType: Yup.string()
    .oneOf(
      ["LC Confirmation", "LG", "SBLC", "Avalization", "Supply Chain Finance"],
      "Invalid transaction type"
    )
    .required("Select transaction type"),

  // Risk Participation Transaction
  riskParticipationTransaction: Yup.object().shape({
    currency: Yup.string().required("Currency is required"),

    amount: Yup.number()
      .transform((value, originalValue) => {
        return originalValue ? Number(originalValue) : value;
      })
      .typeError("Amount must be a number")
      .required("Enter amount"),

    isParticipationOffered: Yup.boolean()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      ),

    percentage: Yup.number()
      .nullable()
      .transform((value, originalValue) => {
        return originalValue ? Number(originalValue) : value;
      })
      .when("isParticipationOffered", {
        is: true,
        then: (schema) =>
          schema
            .typeError("Percentage must be a number")
            .required("Percentage is required when participation is offered"),
        otherwise: (schema) => schema.nullable(),
      }),

    participationCurrency: Yup.string()
      .nullable()
      .when("isParticipationOffered", {
        is: true,
        then: (schema) =>
          schema.required(
            "Participation currency is required when participation is offered"
          ),
        otherwise: (schema) => schema.nullable(),
      }),

    participationValue: Yup.number()
      .nullable()
      .transform((value, originalValue) => {
        return originalValue ? Number(originalValue) : value;
      })
      .when("isParticipationOffered", {
        is: true,
        then: (schema) =>
          schema
            .typeError("Participation value must be a number")
            .required(
              "Participation value is required when participation is offered"
            ),
        otherwise: (schema) => schema.nullable(),
      }),

    pricingOffered: Yup.number()
      .transform((value, originalValue) => {
        return originalValue ? Number(originalValue) : value;
      })
      .typeError("Pricing offered must be a number")
      .required("Pricing offered is required"),
  }),

  // 3. Issuing Bank
  issuingBank: Yup.object().shape({
    bank: Yup.string().required("Issuing bank name is required"),
    country: Yup.string().required("Issuing bank country is required"),
  }),

  // Advising Bank
  advisingBank: Yup.object().shape({
    bank: Yup.string().required("Advising bank name is required"),
    country: Yup.string().required("Advising bank country is required"),
  }),

  // Confirming Bank
  confirmingBank: Yup.object().shape({
    bank: Yup.string().required("Confirming bank name is required"),
    country: Yup.string().required("Confirming bank country is required"),
    dateType: Yup.string()
      .oneOf(
        ["Date LC confirmed", "Expected date to confirm"],
        "Invalid date type"
      )
      .required("Select date type for confirming bank"),
    date: Yup.date().required("Select date for confirming bank"),
  }),

  // LC Period
  lcPeriod: Yup.object().shape({
    dateType: Yup.string()
      .oneOf(
        ["Date LC issued", "Expected date of LC issuance"],
        "Invalid LC period date type"
      )
      .required("Select LC period date type"),
    date: Yup.date().required("Select date for LC period"),
    lcExpiry: Yup.date().required("Select LC expiry date"),
  }),

  // Payment Terms
  paymentTerms: Yup.string()
    .oneOf(
      ["Sight LC", "Usance LC", "Deferred LC", "UPAS LC"],
      "Invalid payment terms"
    )
    .required("Select payment terms"),

  // Extra Info
  extraInfo: Yup.object().when("paymentTerms", {
    is: (paymentTerms) => paymentTerms !== "Sight LC",
    then: (schema) =>
      schema.shape({
        days: Yup.number()
          .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? undefined : value
          )
          .required("Payment Term days is required")
          .min(1, "Days must be greater than 0")
          .max(999, "Days must be less than or equal to 999")
          .typeError("Days must be a number"),
        other: Yup.string().trim().required("Payment Terms type is required"),
      }),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Shipment Port
  shipmentPort: Yup.object().shape({
    country: Yup.string().required("Shipment country is required"),
    port: Yup.string().required("Shipment port is required"),
  }),

  // Transhipment
  transhipment: Yup.mixed()
    .transform((value) => {
      if (value === "yes") return true;
      if (value === "no") return false;
      return value;
    })
    .oneOf([true, false], "Invalid transhipment value")
    .required("Select transhipment option"),

  // Product Description
  productDescription: Yup.string().required("Product description is required"),

  // Importer Info
  importerInfo: Yup.object().shape({
    name: Yup.string().required("Importer name is required"),
    countryOfImport: Yup.string().required("Country of import is required"),
    port: Yup.string().required("Port is required"),
  }),

  // Exporter Info
  exporterInfo: Yup.object().shape({
    name: Yup.string().required("Exporter name is required"),
    countryOfExport: Yup.string().required("Country of export is required"),
    beneficiaryCountry: Yup.string().required(
      "Beneficiary country is required"
    ),
  }),

  // Attachments
  attachments: Yup.array().of(fileSchema).optional(),

  // Last Date of Receiving Bids
  lastDateOfReceivingBids: Yup.date().required(
    "Last date of receiving bids is required"
  ),

  // Additional Notes
  additionalNotes: Yup.string().optional(),
});
