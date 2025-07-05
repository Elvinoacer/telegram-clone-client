"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/hooks/use-loading";
import { emailSchema } from "@/lib/validation";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { FaTelegram } from "react-icons/fa";
import { z } from "zod";
import { motion } from "framer-motion";

interface Props {
  contactForm: UseFormReturn<z.infer<typeof emailSchema>>;
  onCreateContact: (values: z.infer<typeof emailSchema>) => void;
}

const AddContact: FC<Props> = ({ contactForm, onCreateContact }) => {
  const { isCreating } = useLoading();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 z-40 relative"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-md mx-4 p-6 rounded-xl bg-gray-900/80 backdrop-blur-lg shadow-xl flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <FaTelegram size={80} className="text-purple-400" />
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-spaceGrotesk font-bold text-white text-center">
          Add a contact to start chatting
        </h1>
        <Form {...contactForm}>
          <form onSubmit={contactForm.handleSubmit(onCreateContact)} className="w-full space-y-4">
            <FormField
              control={contactForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-white/90">Email</Label>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        placeholder="info@sammi.ac"
                        disabled={isCreating}
                        className="h-12 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-purple-500 placeholder-gray-400 rounded-lg"
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
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
                size="lg"
                disabled={isCreating}
              >
                {isCreating ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-flex items-center"
                  >
                    <FaTelegram className="mr-2" /> Adding...
                  </motion.span>
                ) : (
                  "Add Contact"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
};

export default AddContact;
