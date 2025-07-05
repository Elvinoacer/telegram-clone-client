"use client";

import { IUser } from "@/types";
import React, { FC, useState } from "react";
import Settings from "./settings";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, sliceText } from "@/lib/utils";
import { useCurrentContact } from "@/hooks/use-current";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { CONST } from "@/lib/constants";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  contacts: IUser[];
  onContactSelect?: () => void;
}

const ContactList: FC<Props> = ({ contacts, onContactSelect }) => {
  const [query, setQuery] = useState("");
  const { onlineUsers } = useAuth();
  const { setCurrentContact, currentContact } = useCurrentContact();
  const { data: session } = useSession();

  const filteredContacts = contacts
    .filter((contact) => contact.email.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.lastMessage?.updatedAt ? new Date(a.lastMessage.updatedAt).getTime() : 0;
      const dateB = b.lastMessage?.updatedAt ? new Date(b.lastMessage.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

  const renderContact = (contact: IUser) => {
    const onChat = () => {
      if (currentContact?._id === contact._id) return;
      setCurrentContact(contact);
      onContactSelect?.();
    };

    return (
      <motion.div
        whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex justify-between items-center cursor-pointer p-3 rounded-lg",
          currentContact?._id === contact._id && "bg-gray-800/50"
        )}
        onClick={onChat}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.email} className="object-cover rounded-full" />
                <AvatarFallback className="uppercase bg-gray-700/50 text-white font-spaceGrotesk rounded-full">
                  {contact.email[0]}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {onlineUsers.some((user) => user._id === contact._id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="size-3 bg-green-400 absolute rounded-full bottom-0 right-0 border border-gray-900"
              />
            )}
          </div>
          <div className="max-md:w-36">
            <h2 className="capitalize line-clamp-1 text-sm font-medium text-white font-spaceGrotesk">
              {contact.email.split("@")[0]}
            </h2>
            {contact.lastMessage?.image && (
              <div className="flex items-center gap-2">
                <Image
                  src={contact.lastMessage.image}
                  alt={contact.email}
                  width={20}
                  height={20}
                  className="object-cover rounded-sm"
                />
                <p
                  className={cn(
                    "text-xs line-clamp-1",
                    contact.lastMessage
                      ? contact.lastMessage?.sender._id === session?.currentUser?._id
                        ? "text-gray-400"
                        : contact.lastMessage.status !== CONST.READ
                        ? "text-white font-medium"
                        : "text-gray-400"
                      : "text-gray-400"
                  )}
                >
                  Photo
                </p>
              </div>
            )}
            {!contact.lastMessage?.image && (
              <p
                className={cn(
                  "text-xs line-clamp-1",
                  contact.lastMessage
                    ? contact.lastMessage?.sender._id === session?.currentUser?._id
                      ? "text-gray-400"
                      : contact.lastMessage.status !== CONST.READ
                      ? "text-white font-medium"
                      : "text-gray-400"
                    : "text-gray-400"
                )}
              >
                {contact.lastMessage ? sliceText(contact.lastMessage.text, 25) : "No messages yet"}
              </p>
            )}
          </div>
        </div>
        {contact.lastMessage && (
          <div className="self-end">
            <p className="text-xs text-gray-400">{format(contact.lastMessage.updatedAt, "hh:mm a")}</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center bg-gray-900/90 border-b border-gray-800/50 p-4 sticky top-0 z-50"
      >
        <Settings />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="ml-3 w-full"
        >
          <Input
            className="h-10 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-purple-500 placeholder-gray-400 rounded-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search contacts..."
          />
        </motion.div>
      </motion.div>
      <div className="flex-1 overflow-y-auto sidebar-custom-scrollbar p-4">
        <AnimatePresence>
          {filteredContacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex justify-center items-center text-center text-gray-400 p-6"
            >
              <p className="font-spaceGrotesk">Contact list is empty</p>
            </motion.div>
          ) : (
            filteredContacts.map((contact) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContact(contact)}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContactList;
