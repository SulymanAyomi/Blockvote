
import type { Context } from "hono";
import { errorResponse } from "@/lib/api-response"; // your existing helper; adjust the path

export const onInvalid = (result: { success: boolean }, c: Context) => {
  if (!result.success) {
    // Log the field names for debugging if you like, but never return or log the values.
    return c.json(errorResponse("INVALID_REQUEST"), 400);
  }
};
