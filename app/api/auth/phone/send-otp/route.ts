import { nestAuthProxy } from "@/lib/nest-proxy";
export const POST = nestAuthProxy("phone/send-otp");
