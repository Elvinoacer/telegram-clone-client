"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { axiosClient } from "@/http/axios";
import { otpSchema } from "@/lib/validation";
import { IUser } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

const Verify = () => {
  const { email } = useAuth();

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email, otp: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (otp: string) => {
      const { data } = await axiosClient.post<{ user: IUser }>("/api/auth/verify", { email, otp });
      return data;
    },
    onSuccess: ({ user }) => {
      signIn("credentials", { email: user.email, callbackUrl: "/" });
      toast({ description: "Successfully verified" });
    },
  });

  function onSubmit(values: z.infer<typeof otpSchema>) {
    mutate(values.otp);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-xl"
    >
      <p className="text-center text-gray-400 text-sm mb-6 font-spaceGrotesk">
        We’ve sent a verification code to your email. Please enter it below.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label className="text-white/90">Email</Label>
                <FormControl>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Input
                      placeholder="info@sammi.ac"
                      disabled
                      className="h-12 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-purple-500 placeholder-gray-400 rounded-lg"
                      {...field}
                    />
                  </motion.div>
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <Label className="text-white/90">One-Time Password</Label>
                <FormControl>
                  <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <InputOTP
                      maxLength={6}
                      className="w-full flex justify-center"
                      pattern={REGEXP_ONLY_DIGITS}
                      disabled={isPending}
                      {...field}
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={0}
                          className="w-12 h-12 text-center text-white bg-gray-800/50 border-gray-700/50 focus:ring-2 focus:ring-purple-500 rounded-lg"
                        />
                        <InputOTPSlot
                          index={1}
                          className="w-12 h-12 text-center text-white bg-gray-800/50 border-gray-700/50 focus:ring-2 focus:ring-purple-500 rounded-lg"
                        />
                        <InputOTPSlot
                          index={2}
                          className="w-12 h-12 text-center text-white bg-gray-800/50 border-gray-700/50 focus:ring-2 focus:ring-purple-500 rounded-lg"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-gray-400" />
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={3}
                          className="w-12 h-12 text-center text-white bg-gray-800/50 border-gray-700/50 focus:ring-2 focus:ring-purple-500 rounded-lg"
                        />
                        <InputOTPSlot
                          index={4}
                          className="w-12 h-12 text-center text-white bg-gray-800/50 border-gray-700/50 focus:ring-2 focus:ring-purple-500 rounded-lg"
                        />
                        <InputOTPSlot
                          index={5}
                          className="w-12 h-12 text-center text-white bg-gray-800/50 border-gray-700/50 focus:ring-2 focus:ring-purple-500 rounded-lg"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </motion.div>
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
};

export default Verify;
