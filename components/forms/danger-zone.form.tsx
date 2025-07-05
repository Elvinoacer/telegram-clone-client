"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { confirmTextSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { generateToken } from "@/lib/generate-token";
import { signOut, useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/http/axios";
import { motion } from "framer-motion";

const DangerZoneForm = () => {
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof confirmTextSchema>>({
    resolver: zodResolver(confirmTextSchema),
    defaultValues: { confirmText: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.delete("/api/user", { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    onSuccess: () => {
      signOut();
    },
  });

  function onSubmit() {
    mutate();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-xl"
    >
      <p className="text-center text-gray-400 text-sm mb-6 font-spaceGrotesk">
        Are you sure you want to delete your account? This action cannot be undone.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-spaceGrotesk font-bold rounded-lg transition-all duration-300"
              variant="destructive"
            >
              Delete Permanently
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/80 backdrop-blur-lg border-gray-800/50 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-spaceGrotesk">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <Separator className="bg-gray-800/50 my-4" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmText"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription className="text-gray-400">
                      Please type <span className="font-bold text-white">DELETE</span> to confirm.
                    </FormDescription>
                    <FormControl>
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Input
                          className="h-12 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-red-500 placeholder-gray-400 rounded-lg"
                          disabled={isPending}
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
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-spaceGrotesk font-bold rounded-lg transition-all duration-300"
                  disabled={isPending}
                >
                  {isPending ? (
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
                      Deleting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default DangerZoneForm;
