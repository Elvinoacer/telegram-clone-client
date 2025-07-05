"use client";

import { FaTelegram } from "react-icons/fa";
import StateAuth from "./_component/state";
import Social from "./_component/social";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { FC } from "react";
import { motion } from "framer-motion";

// Client-side wrapper component to apply animations
const ClientAuthPage: FC<{ session: any }> = ({ session }) => {
  if (session) {
    redirect("/");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="container max-w-md w-full min-h-screen flex justify-center items-center flex-col space-y-8 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 px-4 sm:px-6"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="flex justify-center"
      >
        <FaTelegram size={100} className="text-purple-400 drop-shadow-lg" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-spaceGrotesk tracking-tight">Telegram</h1>
        <ModeToggle />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="w-full bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl shadow-xl"
      >
        <StateAuth />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="w-full bg-gray-900/80 backdrop-blur-lg p-6 rounded-xl shadow-xl"
      >
        <Social />
      </motion.div>
    </motion.div>
  );
};

// Server-side page component
const Page = async () => {
  const session = await getServerSession(authOptions);

  // Pass session to client-side wrapper
  return <ClientAuthPage session={session} />;
};

export default Page;
