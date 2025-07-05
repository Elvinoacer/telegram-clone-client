"use client";

import { oldEmailSchema, otpSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import { generateToken } from "@/lib/generate-token";
import { signOut, useSession } from "next-auth/react";
import { axiosClient } from "@/http/axios";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const EmailForm = () => {
  const [verify, setVerify] = useState(false);
  const { data: session } = useSession();

  const emailForm = useForm<z.infer<typeof oldEmailSchema>>({
    resolver: zodResolver(oldEmailSchema),
    defaultValues: { email: "", oldEmail: session?.currentUser?.email },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "", email: "" },
  });

  const otpMutation = useMutation({
    mutationFn: async (email: string) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.post<{ email: string }>(
        "/api/user/send-otp",
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: ({ email }) => {
      toast({ description: "OTP sent to your email" });
      otpForm.setValue("email", email);
      setVerify(true);
    },
  });

  function onEmailSubmit(values: z.infer<typeof oldEmailSchema>) {
    otpMutation.mutate(values.email);
  }

  const verifyMutation = useMutation({
    mutationFn: async (otp: string) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.put(
        "/api/user/email",
        { email: otpForm.getValues("email"), otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      toast({ description: "Email updated successfully" });
      signOut();
    },
  });

  function onVerifySubmit(values: z.infer<typeof otpSchema>) {
    verifyMutation.mutate(values.otp);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-xl"
    >
      {!verify ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="oldEmail"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-white/90">Current Email</Label>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        className="h-12 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-purple-500 placeholder-gray-400 rounded-lg"
                        disabled
                        {...field}
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-white/90">New Email</Label>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        placeholder="info@sammi.ac"
                        className="h-12 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-purple-500 placeholder-gray-400 rounded-lg"
                        disabled={otpMutation.isPending}
                        {...field}
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-spaceGrotesk font-semibold rounded-lg transition-all duration-300"
                disabled={otpMutation.isPending}
              >
                {otpMutation.isPending ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onVerifySubmit)} className="space-y-4">
            <div>
              <Label className="text-white/90">New Email</Label>
              <Input
                className="h-12 bg-gray-800/50 text-white border-gray-700/50 rounded-lg"
                disabled
                value={emailForm.watch("email")}
              />
            </div>
            <FormField
              control={otpForm.control}
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
                        disabled={verifyMutation.isPending}
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
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-spaceGrotesk font-semibold rounded-lg transition-all duration-300"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
                  "Submit"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      )}
    </motion.div>
  );
};

export default EmailForm;
