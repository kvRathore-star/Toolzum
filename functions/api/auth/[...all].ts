import { auth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  return auth.handler(context.request);
};
