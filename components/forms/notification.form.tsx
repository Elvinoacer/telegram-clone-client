"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDown, Ghost, PlayCircle } from "lucide-react";
import { SOUNDS } from "@/lib/constants";
import { cn, getSoundLabel } from "@/lib/utils";
import useAudio from "@/hooks/use-audio";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { generateToken } from "@/lib/generate-token";
import { axiosClient } from "@/http/axios";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface IPayload {
  notificationSound?: string;
  sendingSound?: string;
  muted?: boolean;
}

const NotificationForm = () => {
  const [isNotification, setIsNotification] = useState(false);
  const [isSounding, setIsSounding] = useState(false);
  const [selectedSound, setSelectedSound] = useState("");

  const { data: session, update } = useSession();
  const { playSound } = useAudio();

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: IPayload) => {
      const token = await generateToken(session?.currentUser?._id);
      const { data } = await axiosClient.put("/api/user/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      toast({ description: "Profile updated successfully" });
      update();
      setIsNotification(false);
      setIsSounding(false);
    },
  });

  const onPlaySound = (value: string) => {
    setSelectedSound(value);
    playSound(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="font-spaceGrotesk text-white/90">Notification Sound</p>
            <p className="font-spaceGrotesk text-gray-400 text-xs">
              {getSoundLabel(session?.currentUser?.notificationSound)}
            </p>
          </div>
          <Popover open={isNotification} onOpenChange={setIsNotification}>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="bg-gray-800/50 text-white hover:bg-gray-700/50 rounded-lg">
                  Select <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900/80 backdrop-blur-lg border-gray-800/50 rounded-lg p-2">
              <div className="flex flex-col space-y-1">
                {SOUNDS.map((sound) => (
                  <motion.div
                    key={sound.label}
                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.3)" }}
                    className={cn(
                      "flex justify-between items-center rounded-md p-2 cursor-pointer",
                      selectedSound === sound.value && "bg-purple-600/30"
                    )}
                    onClick={() => onPlaySound(sound.value)}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start text-white font-spaceGrotesk hover:bg-transparent"
                    >
                      {sound.label}
                    </Button>
                    {session?.currentUser?.notificationSound === sound.value ? (
                      <Button size="icon" className="bg-transparent text-purple-400">
                        <Ghost size={16} />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="text-purple-400">
                        <PlayCircle size={16} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="w-full mt-2 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-spaceGrotesk font-semibold rounded-lg"
                  disabled={isPending}
                  onClick={() => mutate({ notificationSound: selectedSound })}
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
                      Saving...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </motion.div>
            </PopoverContent>
          </Popover>
        </div>
        <Separator className="bg-gray-800/50 my-4" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="font-spaceGrotesk text-white/90">Sending Sound</p>
            <p className="font-spaceGrotesk text-gray-400 text-xs">
              {getSoundLabel(session?.currentUser?.sendingSound)}
            </p>
          </div>
          <Popover open={isSounding} onOpenChange={setIsSounding}>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="bg-gray-800/50 text-white hover:bg-gray-700/50 rounded-lg">
                  Select <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900/80 backdrop-blur-lg border-gray-800/50 rounded-lg p-2">
              <div className="flex flex-col space-y-1">
                {SOUNDS.map((sound) => (
                  <motion.div
                    key={sound.label}
                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.3)" }}
                    className={cn(
                      "flex justify-between items-center rounded-md p-2 cursor-pointer",
                      selectedSound === sound.value && "bg-purple-600/30"
                    )}
                    onClick={() => onPlaySound(sound.value)}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start text-white font-spaceGrotesk hover:bg-transparent"
                    >
                      {sound.label}
                    </Button>
                    {session?.currentUser?.sendingSound === sound.value ? (
                      <Button size="icon" className="bg-transparent text-purple-400">
                        <Ghost size={16} />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="text-purple-400">
                        <PlayCircle size={16} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="w-full mt-2 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-spaceGrotesk font-semibold rounded-lg"
                  disabled={isPending}
                  onClick={() => mutate({ sendingSound: selectedSound })}
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
                      Saving...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </motion.div>
            </PopoverContent>
          </Popover>
        </div>
        <Separator className="bg-gray-800/50 my-4" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="font-spaceGrotesk text-white/90">Mode Mute</p>
            <p className="font-spaceGrotesk text-gray-400 text-xs">
              {session?.currentUser?.muted ? "Muted" : "Unmuted"}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Switch
              checked={!session?.currentUser?.muted}
              onCheckedChange={() => mutate({ muted: !session?.currentUser?.muted })}
              disabled={isPending}
              className="data-[state=checked]:bg-purple-600"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationForm;
