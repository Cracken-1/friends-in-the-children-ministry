import "server-only";

import { normalizeKenyanPhone } from "@/server/security/phone";

export type PaymentInitiationInput = {
  phone: string;
  contentId: string;
  contentType: "blog_post" | "lesson" | "bible_study";
};

export function preparePaymentRequest(input: PaymentInitiationInput) {
  return {
    ...input,
    phone: normalizeKenyanPhone(input.phone)
  };
}
