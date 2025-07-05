"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

const Social = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          onClick={() => onSignIn("google")}
          disabled={isLoading}
          className="w-full h-12 bg-gray-800/50 text-white border-gray-700/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
        >
          {isLoading ? (
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
              Signing In...
            </span>
          ) : (
            <>
              <span className="font-spaceGrotesk">Google</span>
              <FaGoogle className="text-purple-400" />
            </>
          )}
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="secondary"
          onClick={() => onSignIn("github")}
          disabled={isLoading}
          className="w-full h-12 bg-gray-800/50 text-white border-gray-700/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
        >
          {isLoading ? (
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
              Signing In...
            </span>
          ) : (
            <>
              <span className="font-spaceGrotesk">GitHub</span>
              <FaGithub className="text-purple-400" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default Social;
