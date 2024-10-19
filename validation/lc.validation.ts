import * as Yup from "yup";

export const fileSchema = Yup.object().shape({
  url: Yup.string().required("File URL is required"),
  userFileName: Yup.string().required("User file name is required"),
  firebaseFileName: Yup.string().required("Firebase file name is required"),
  fileSize: Yup.number().required("File size is required"),
  fileType: Yup.string().required("File type is required"),
});

export const generalLcSchema = Yup.object().shape({
  participantRole: Yup.mixed()
    .oneOf(["exporter", "importer"], "Select transaction role")
    .required(),
  amount: Yup.string()
    .required("Enter amount")
    .matches(/^\d+$/, "Amount: Enter a valid number"),
  paymentTerms: Yup.mixed()
    .oneOf(
      ["Sight LC", "Usance LC", "Deferred LC", "UPAS LC"],
      "Select a payment term"
    )
    .required(),
  currency: Yup.string().default("USD").optional(),
  issuingBanks: Yup.array()
    .of(
      Yup.object().shape({
        bank: Yup.string().required("Issuing bank name is required"),
        country: Yup.string().required("Issuing bank country is required"),
      })
    )
    .min(1, "At least one issuing bank is required")
    .required("Issuing banks are required"),
  advisingBank: Yup.object()
    .shape({
      bank: Yup.string().required("Advising bank name is required"),
      country: Yup.string().required("Advising bank country is required"),
    })
    .nullable()
    .default(undefined),
  confirmingBank: Yup.object()
    .shape({
      bank: Yup.string().required("Confirming bank name is required"),
      country: Yup.string().required("Confirming bank country is required"),
    })
    .nullable()
    .default(undefined),
  confirmingBank2: Yup.object()
    .shape({
      bank: Yup.string().required("Confirming bank name is required"),
      country: Yup.string().required("Confirming bank country is required"),
    })
    .nullable()
    .default(undefined),
  period: Yup.object()
    .shape({
      expectedDate: Yup.mixed()
        .oneOf(["yes", "no"], "Select LC Period Type")
        .required(),
      startDate: Yup.date().required("Select issuance date"),
      endDate: Yup.date().required("Select expiry date"),
    })
    .required("LC Period is required"),
  shipmentPort: Yup.object()
    .shape({
      country: Yup.string().required("Select shipment country"),
      port: Yup.string().required("Select shipment port"),
    })
    .required("Shipment details are required"),
  transhipment: Yup.mixed()
    .oneOf(["yes", "no"], "Specify transhipment")
    .required(),
  importerInfo: Yup.object()
    .shape({
      applicantName: Yup.string()
        .required("Enter applicant name")
        .min(1, "Enter importer applicant name")
        .matches(/.*[a-zA-Z]+.*/, "Applicant name cannot contain only numbers"),
      countryOfImport: Yup.string()
        .required("Select country of import")
        .min(1, "Select country of import"),
    })
    .required("Importer Info is required"),
  productDescription: Yup.string()
    .min(1, "Product Description is required")
    .max(300, "Description cannot be more than 300 characters")
    .required("Add product description"),
  extraInfo: Yup.object()
    .shape({
      days: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" ? undefined : value
        ) // Transform empty string to undefined
        .required("Payment Term days is required")
        .min(1, "Days must be greater than 0")
        .max(999, "Days must be less than or equal to 999"),
      other: Yup.string().trim().required("Payment Terms type is required"),
    })
    .when("paymentTerms", {
      is: (paymentTerms) => paymentTerms !== "Sight LC",
      then: (schema) =>
        schema.required(
          "Extra info is required when payment terms are not 'Sight LC'"
        ),
      otherwise: (schema) =>
        schema
          .shape({
            days: Yup.number().nullable(), // Make `days` optional when paymentTerms is "Sight LC"
            other: Yup.string().nullable(), // Make `other` optional when paymentTerms is "Sight LC"
          })
          .nullable()
          .notRequired(), // Allow extraInfo to be nullable when "Sight LC"
    }),
  lastDateOfReceivingBids: Yup.date().required(
    "Last Date for Receiving Bids is required"
  ),
  attachments: Yup.array().of(fileSchema).optional(),
});

export const confirmationSchema = generalLcSchema.concat(
  Yup.object().shape({
    expectedConfirmationDate: Yup.date().required(
      "select expected confirmation date"
    ),
    exporterInfo: Yup.object()
      .shape({
        beneficiaryName: Yup.string()
          .required("Enter beneficiary name")
          .min(1, "Enter exporter beneficiary name"),
        countryOfExport: Yup.string().required("Select country of export"),
        beneficiaryCountry: Yup.string().required(
          "Select exporter beneficiary country"
        ),
      })
      .required(),
    confirmationInfo: Yup.object()
      .shape({
        behalfOf: Yup.mixed()
          .oneOf(["Exporter", "Importer"], "Select confirmation info")
          .required(),
        pricePerAnnum: Yup.string()
          .required("Enter expected price")
          .matches(
            /^\d+(\.\d+)?%?$/,
            "Price per annum: Enter a valid number or percentage"
          )
          .test(
            "is-valid-price",
            "Price per annum must be less than or equal to 100% and greater than 0",
            (value) => {
              if (!value) return false;
              const numericValue = parseFloat(value.replace("%", ""));
              return numericValue > 0 && numericValue <= 100;
            }
          ),
      })
      .required(),
  })
);

export const discountingSchema = generalLcSchema.concat(
  Yup.object().shape({
    expectedDiscountingDate: Yup.date().required("select date"),
    exporterInfo: Yup.object()
      .shape({
        beneficiaryName: Yup.string()
          .required("Enter beneficiary name")
          .min(1, "Enter beneficiary name"),
        countryOfExport: Yup.string().required("Select country of export"),
        beneficiaryCountry: Yup.string().required("Select beneficiary country"),
      })
      .required(),
    baseRate: Yup.string().required("Base Rate is required"),
    discountingInfo: Yup.object()
      .shape({
        discountAtSight: Yup.mixed()
          .oneOf(["Sight", "Acceptance Date"], "Specify discount at sight")
          .required(),
        behalfOf: Yup.mixed()
          .oneOf(["Exporter", "Importer"], "Select charges on account of")
          .required(),
        pricePerAnnum: Yup.string()
          .required("Enter expected price")
          .matches(
            /^\d+(\.\d+)?%?$/,
            "Price per annum: Enter a valid number or percentage"
          )
          .test(
            "is-valid-price",
            "Price per annum must be less than or equal to 100% and greater than 0",
            (value) => {
              if (!value) return false;
              const numericValue = parseFloat(value.replace("%", "")); // Remove percentage sign and parse the number
              return numericValue > 0 && numericValue <= 100;
            }
          ),
      })
      .required(),
  })
);

export const confirmationDiscountSchema = generalLcSchema.concat(
  Yup.object().shape({
    expectedConfirmationDate: Yup.date().required("select date"),
    exporterInfo: Yup.object()
      .shape({
        beneficiaryName: Yup.string()
          .required("Enter beneficiary name")
          .min(1, "Enter beneficiary name"),
        countryOfExport: Yup.string().required("Select country of export"),
        beneficiaryCountry: Yup.string().required("Select beneficiary country"),
        bank: Yup.string().required("Select export bank"),
      })
      .required(),
    confirmationInfo: Yup.object()
      .shape({
        behalfOf: Yup.mixed()
          .oneOf(["Exporter", "Importer"], "Select one of above")
          .required(),
        pricePerAnnum: Yup.string().required("Enter expected price"),
        // .matches(/^\d+(\.\d+)?$/, "Enter a valid number"),
      })
      .required(),
    discountingInfo: Yup.object()
      .shape({
        discountAtSight: Yup.mixed()
          .oneOf(["Sight", "Acceptance Date"], "Specify discount at sight")
          .required(),
        behalfOf: Yup.mixed()
          .oneOf(["Exporter", "Importer"], "Select one of above")
          .required(),
        pricePerAnnum: Yup.string()
          .required("Enter expected price")
          // .matches(/^\d+(\.\d+)?$/, "Enter a valid number")
          .test(
            "is-valid-price",
            "Price per annum must be less than 100",
            (value) => {
              return parseFloat(value) <= 100;
            }
          ),
        basePerRate: Yup.string().required("Base Rate is required"),
      })
      .required(),
  })
);

export const lcIssuanceSchema = Yup.object().shape({
  lgIssueAgainst: Yup.string().required("LG Issue against is required"),
  issuingBanks: Yup.array()
    .of(
      Yup.object().shape({
        bank: Yup.string().required("Issuing bank name is required"),
        country: Yup.string().required("Issuing bank country is required"),
      })
    )
    .min(1, "At least one issuing bank is required")
    .required("Issuing banks are required"),
  standardSAMA: Yup.string().required("Select standardSAMA"),
  priceCurrency: Yup.string().default("USD").required("Currency is required"),
  marginCurrency: Yup.string().default("USD").required("Currency is required"),
  amount: Yup.object()
    .shape({
      amountPercentage: Yup.string().required("Amount percentage is required"),
      margin: Yup.string().required("Margin is required"),
      price: Yup.string().required("Enter amount"),
    })
    .required(),
  period: Yup.object()
    .shape({
      startDate: Yup.date().required("Select issuance date"),
      endDate: Yup.date().required("Select expiry date"),
    })
    .required("LC Period is required"),
  lgType: Yup.mixed()
    .oneOf(["bid", "advance", "payment", "cg", "performance"], "Select LG Type")
    .required(),
  productDescription: Yup.string()
    .min(1, "Product Description is required")
    .max(300, "Description cannot be more than 300 characters")
    .required("Add product description"),
  lgDetail: Yup.object()
    .shape({
      lgIssueBehalfOf: Yup.string()
        .min(1, "Applicant name required")
        .required("Applicant name is required"),
      applicantCountry: Yup.string()
        .min(1, "Applicant country is required")
        .required("Applicant country is required"),
      lgIssueFavorOf: Yup.string()
        .min(1, "Beneficiary is required")
        .required("Beneficiary is required"),
      address: Yup.string()
        .min(1, "Address is required")
        .required("Address is required"),
      benficiaryCountry: Yup.string()
        .min(1, "Beneficiary country is required")
        .required("Beneficiary country is required"),
    })
    .required("LG Detail is required"),
  chargesBehalfOf: Yup.mixed()
    .oneOf(["applicant", "beneficiary"], "Select Charges BehalfOf")
    .required(),
  instrument: Yup.mixed().oneOf(["yes", "no"], "Select Instrument").required(),
  benificiaryBankName: Yup.string().nullable(),
  remarks: Yup.string().nullable().min(1, "Remarks are required"),
  priceType: Yup.string().required("Select Price Type"),
});
