import { nestAuthProxy } from "@/lib/nest-proxy";
export const POST = nestAuthProxy("verify-email");
