// app/auth/client-auth-page.tsx
"use client";

import { FaTelegram } from "react-icons/fa";
import StateAuth from "./_component/state";
import Social from "./_component/social";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { motion } from "framer-motion";

export default function ClientAuthPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full min-h-screen flex justify-center items-center flex-col space-y-6 sm:space-y-8 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 sm:p-6"
    >
      <div className="w-full max-w-[95vw] sm:max-w-md flex flex-col items-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="flex justify-center"
        >
          <FaTelegram size={80} className="text-purple-400 drop-shadow-lg sm:size-[100px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-4 mt-4"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-white font-spaceGrotesk tracking-tight">Telegram</h1>
          <ModeToggle />
        </motion.div>
      </div>

      <div className="w-full max-w-[95vw] sm:max-w-md space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full bg-gray-900/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-xl"
        >
          <StateAuth />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="w-full bg-gray-900/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-xl"
        >
          <Social />
        </motion.div>
      </div>
    </motion.div>
  );
}
