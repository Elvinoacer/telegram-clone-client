"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentContact } from "@/hooks/use-current";
import { useLoading } from "@/hooks/use-loading";
import { sliceText } from "@/lib/utils";
import { IMessage } from "@/types";
import { Settings2 } from "lucide-react";
import Image from "next/image";
import { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  messages: IMessage[];
}

const TopChat: FC<Props> = ({ messages }) => {
  const { currentContact } = useCurrentContact();
  const { onlineUsers } = useAuth();
  const { typing } = useLoading();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex items-center justify-between sticky top-0 z-50 h-16 p-4 border-b border-gray-800/50 bg-gray-900/90 backdrop-blur-lg"
    >
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={currentContact?.avatar}
              alt={currentContact?.email}
              className="object-cover rounded-full"
            />
            <AvatarFallback className="uppercase bg-gray-700/50 text-white font-spaceGrotesk rounded-full">
              {currentContact?.email?.[0] || ""}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div>
          <h2 className="font-medium text-sm text-white font-spaceGrotesk">{currentContact?.email}</h2>
          {currentContact?._id === typing?.sender?._id && typing?.message.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs flex items-center gap-1 text-gray-400"
            >
              <p className="text-purple-400 animate-pulse line-clamp-1">{sliceText(typing?.message, 20)}</p>
              <div className="flex justify-center items-center gap-1">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", delay: -0.3 }}
                  className="w-1 h-1 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", delay: -0.15 }}
                  className="w-1 h-1 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", delay: -0.1 }}
                  className="w-1 h-1 bg-purple-400 rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <p className="text-xs text-gray-400">
              {onlineUsers.some((user) => user._id === currentContact?._id) ? (
                <>
                  <span className="text-green-400">●</span> Online
                </>
              ) : (
                <>
                  <span className="text-gray-500">●</span> Last seen recently
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant="secondary"
              className="bg-gray-800/50 text-purple-400 hover:bg-gray-700/50 rounded-lg"
            >
              <Settings2 size={20} />
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:w-80 h-full p-6 bg-gray-900/80 backdrop-blur-lg border-gray-800/50 fixed top-0 right-0 z-50 overflow-y-auto sidebar-custom-scrollbar"
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl text-white font-spaceGrotesk">Contact Info</SheetTitle>
            </SheetHeader>
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={currentContact?.avatar}
                      alt={currentContact?.email}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback className="text-4xl uppercase font-spaceGrotesk bg-gray-700/50 text-white rounded-full">
                      {currentContact?.email?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>
            </div>
            <h1 className="text-center capitalize font-spaceGrotesk text-xl text-white mb-6">
              {currentContact?.email}
            </h1>
            <Separator className="my-6 bg-gray-800/50" />
            <div className="flex flex-col space-y-4">
              {currentContact?.firstName && (
                <div className="flex items-center gap-3">
                  <p className="font-spaceGrotesk text-white font-medium">First Name:</p>
                  <p className="font-spaceGrotesk text-gray-400">{currentContact?.firstName}</p>
                </div>
              )}
              {currentContact?.lastName && (
                <div className="flex items-center gap-3">
                  <p className="font-spaceGrotesk text-white font-medium">Last Name:</p>
                  <p className="font-spaceGrotesk text-gray-400">{currentContact?.lastName}</p>
                </div>
              )}
              {currentContact?.bio && (
                <div className="flex flex-col gap-2">
                  <p className="font-spaceGrotesk text-white font-medium">About:</p>
                  <p className="font-spaceGrotesk text-gray-400">{currentContact?.bio}</p>
                </div>
              )}
              <Separator className="my-6 bg-gray-800/50" />
              <h2 className="text-xl text-white font-spaceGrotesk">Shared Images</h2>
              <div className="flex flex-col space-y-4">
                <AnimatePresence>
                  {messages.filter((msg) => msg.image).length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-400 text-sm font-spaceGrotesk"
                    >
                      No images shared
                    </motion.p>
                  ) : (
                    messages
                      .filter((msg) => msg.image)
                      .map((msg) => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-48 relative"
                        >
                          <Image src={msg.image} alt={msg._id} fill className="object-cover rounded-lg" />
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default TopChat;
