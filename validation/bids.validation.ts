import { z } from "zod";

export const addBidTypes = z.object({
  validity: z.string().nonempty("Validity date is required"),
  confirmationPrice: z
    .string()
    .nonempty("Confirmation price is required")
    .refine((value) => /^\d+(\.\d+)?$/.test(value), {
      message: "Enter a valid number",
    }),
});
