// import { IRisk } from "@/types/type";
// import { create } from "zustand";

// interface RiskStore {
//   formData: IRisk;
//   setFormData: (data: Partial<IRisk> | null) => void;
// }

// const useRiskStore = create<RiskStore>((set) => ({
//   formData: {
//     advisingBank: {
//       country: "",
//       bank: "",
//     },
//     attachment: [],
//     banks: [],
//     confirmingBank: {
//       country: "",
//       bank: "",
//     },
//     createdBy: "",
//     description: "",
//     draft: false,
//     expectedDateConfimation: "",
//     expectedDateDiscounting: "",
//     expectedDiscounting: false,
//     expiryDate: "",
//     exporterInfo: {
//       beneficiaryCountry: "",
//       beneficiaryName: "",
//       countryOfExport: "",
//     },
//     importerInfo: { applicantName: "", countryOfImport: "" },
//     isDeleted: false,
//     isLcDiscounting: false,
//     issuingBank: {
//       country: "",
//       bank: "",
//     },
//     note: "",
//     outrightSales: "",
//     paymentTerms: "",
//     riskParticipation: "",
//     riskParticipationTransaction: {
//       type: "",
//       amount: 0,
//       perAnnum: "",
//       returnOffer: "",
//       baseRate: "",
//     },
//     shipmentPort: {
//       country: "",
//       port: "",
//     },
//     startDate: "",
//     transaction: "",
//     transhipment: false,
//     __v: 0,
//     _id: "",
//     createdAt: new Date(),
//   },
//   setFormData: (data) =>
//     set((state) => ({ formData: { ...state.formData, ...data } })),
// }));

// export default useRiskStore;

import { IRisk } from "@/types/type";
import { create } from "zustand";

// Define a type that includes all IRisk properties and the setValues method
type RiskState = IRisk & {
  setValues: (values: Partial<IRisk> | null) => void;
};

// Create the store with the combined type
const useRiskStore = create<RiskState>((set) => ({
  advisingBank: {
    country: "",
    bank: "",
  },
  attachment: [], // Array for file attachments
  banks: [], // Array of bank objects
  confirmingBank: {
    country: "",
    bank: "",
    dateType: "", // New field to match validation
    date: "", // New field to match validation
  },
  createdBy: "",
  productDescription: "", // Product description
  draft: false, // Draft flag
  exporterInfo: {
    beneficiaryCountry: "",
    beneficiaryName: "",
    countryOfExport: "",
  },
  importerInfo: {
    name: "", // Updated to match validation
    countryOfImport: "",
    port: "", // Port of import added
  },
  isDeleted: false, // Deletion flag
  issuingBank: {
    country: "",
    bank: "",
  },
  additionalNotes: "", // Additional notes
  paymentTerms: "", // Payment terms
  riskParticipation: "", // Risk participation type
  riskParticipationTransaction: {
    currency: "USD", // Default currency
    amount: 0, // Amount
    isParticipationOffered: false, // Participation offered flag
    percentage: 0, // Participation percentage
    participationCurrency: "USD", // Participation currency
    participationValue: 0, // Participation value
    pricingOffered: 0, // Pricing offered
  },
  shipmentPort: {
    country: "",
    port: "",
  },
  transaction: "", // Transaction type
  transhipment: false, // Transhipment flag
  __v: 0, // Version
  _id: "", // ID
  createdAt: new Date(), // Creation date

  setValues: (values: Partial<IRisk> | null) =>
    set((state) => ({
      ...state,
      ...values,
    })),
}));

// Function to get state values excluding setValues
export const getStateValues = (
  state: RiskState
): Omit<RiskState, "setValues"> => {
  const { setValues, ...stateValues } = state;
  return stateValues;
};

export default useRiskStore;
