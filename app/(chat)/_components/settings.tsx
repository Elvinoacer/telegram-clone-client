"use client";

import DangerZoneForm from "@/components/forms/danger-zone.form";
import EmailForm from "@/components/forms/email.form";
import InformationForm from "@/components/forms/information.form";
import NotificationForm from "@/components/forms/notification.form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { axiosClient } from "@/http/axios";
import { generateToken } from "@/lib/generate-token";
import { UploadButton } from "@/lib/uploadthing";
import { useMutation } from "@tanstack/react-query";
import { LogIn, Menu, Moon, Settings2, Sun, Upload, UserPlus, VolumeOff } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion } from "framer-motion";

interface IPayload {
  muted?: boolean;
  avatar?: string;
}

const Settings = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, update } = useSession();

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
    },
  });

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant="secondary"
              className="bg-gray-800/50 text-purple-400 hover:bg-gray-700/50 rounded-lg"
            >
              <Menu size={20} />
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-gray-900/80 backdrop-blur-lg border-gray-800/50 rounded-lg p-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-gray-400 text-sm font-spaceGrotesk">
              Settings: <span className="text-white">{session?.currentUser?.email}</span>
            </h2>
            <Separator className="my-4 bg-gray-800/50" />
            <div className="flex flex-col space-y-2">
              <motion.div
                whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-between items-center p-3 rounded-md cursor-pointer"
                onClick={() => setIsProfileOpen(true)}
              >
                <div className="flex items-center gap-3">
                  <Settings2 size={16} className="text-purple-400" />
                  <span className="text-sm text-white font-spaceGrotesk">Profile</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-between items-center p-3 rounded-md cursor-pointer"
                onClick={() => window.location.reload()}
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={16} className="text-purple-400" />
                  <span className="text-sm text-white font-spaceGrotesk">Create Contact</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
                className="flex justify-between items-center p-3 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <VolumeOff size={"16"} className="text-purple-400" />
                  <span className="text-sm text-white font-spaceGrotesk">Mute</span>
                </div>
                <Switch
                  checked={!session?.currentUser?.muted}
                  onCheckedChange={() => mutate({ muted: !session?.currentUser?.muted })}
                  disabled={isPending}
                  className="data-[state=checked]:bg-purple-600"
                />
              </motion.div>
              <motion.div
                whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
                className="flex justify-between items-center p-3 rounded-md"
              >
                <div className="flex items-center gap-3">
                  {resolvedTheme === "dark" ? (
                    <Sun size={16} className="text-purple-400" />
                  ) : (
                    <Moon size={16} className="text-purple-400" />
                  )}
                  <span className="text-sm text-white font-spaceGrotesk">
                    {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </div>
                <Switch
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="data-[state=checked]:bg-purple-600"
                />
              </motion.div>
              <motion.div
                whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-between items-center p-3 rounded-md bg-red-600/80 cursor-pointer"
                onClick={() => signOut()}
              >
                <div className="flex items-center gap-3">
                  <LogIn size={16} className="text-white" />
                  <span className="text-sm text-white font-spaceGrotesk">Logout</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent
          side="left"
          className="w-full sm:w-96 p-6 bg-gray-900/80 backdrop-blur-lg border-gray-800/50 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl text-white font-spaceGrotesk">My Profile</SheetTitle>
              <SheetDescription className="text-gray-400 font-spaceGrotesk">
                Setting up your profile will help you connect with your friends and family easily.
              </SheetDescription>
            </SheetHeader>
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={session?.currentUser?.avatar}
                      alt={session?.currentUser?.email}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback className="text-4xl uppercase font-spaceGrotesk bg-gray-700/50 text-white rounded-full">
                      {session?.currentUser?.email?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -right-2 -bottom-2"
                >
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      mutate({ avatar: res[0].url });
                    }}
                    config={{ appendOnPaste: true, mode: "auto" }}
                    appearance={{
                      allowedContent: { display: "none" },
                      button: { width: 40, height: 40, borderRadius: "100%" },
                    }}
                    content={{ button: <Upload size={16} className="text-purple-400" /> }}
                    className="bg-gray-800/50 hover:bg-gray-700/50 rounded-full"
                  />
                </motion.div>
              </div>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-none">
                <motion.div whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }} className="rounded-lg">
                  <AccordionTrigger className="bg-gray-800/50 px-4 py-3 text-white font-spaceGrotesk rounded-lg hover:no-underline">
                    Basic Information
                  </AccordionTrigger>
                </motion.div>
                <AccordionContent className="pt-4">
                  <InformationForm />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-none">
                <motion.div whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }} className="rounded-lg">
                  <AccordionTrigger className="bg-gray-800/50 px-4 py-3 text-white font-spaceGrotesk rounded-lg hover:no-underline">
                    Email
                  </AccordionTrigger>
                </motion.div>
                <AccordionContent className="pt-4">
                  <EmailForm />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none">
                <motion.div whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }} className="rounded-lg">
                  <AccordionTrigger className="bg-gray-800/50 px-4 py-3 text-white font-spaceGrotesk rounded-lg hover:no-underline">
                    Notification
                  </AccordionTrigger>
                </motion.div>
                <AccordionContent className="pt-4">
                  <NotificationForm />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-none">
                <motion.div whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }} className="rounded-lg">
                  <AccordionTrigger className="bg-gray-800/50 px-4 py-3 text-white font-spaceGrotesk rounded-lg hover:no-underline">
                    Danger Zone
                  </AccordionTrigger>
                </motion.div>
                <AccordionContent className="pt-4">
                  <DangerZoneForm />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Settings;
