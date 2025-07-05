"use client";

import { useCurrentContact } from "@/hooks/use-current";
import { CONST } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IMessage } from "@/types";
import { format } from "date-fns";
import { Check, CheckCheck, Edit2, Trash } from "lucide-react";
import { FC } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import Image from "next/image";
import { motion } from "framer-motion";

interface Props {
  message: IMessage;
  onReaction: (reaction: string, messageId: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

const MessageCard: FC<Props> = ({ message, onReaction, onDeleteMessage }) => {
  const { currentContact, setEditedMessage } = useCurrentContact();

  const reactions = ["👍", "😂", "❤️", "😍", "👎"];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          initial={{ opacity: 0, x: message.receiver._id === currentContact?._id ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={cn(
            "m-2.5 font-medium text-xs flex",
            message.receiver._id === currentContact?._id ? "justify-start" : "justify-end"
          )}
        >
          <div
            className={cn(
              "relative p-3 pr-12 max-w-[80%] sm:max-w-[60%] rounded-lg shadow-md",
              message.receiver._id === currentContact?._id
                ? "bg-gradient-to-r from-purple-600/80 to-indigo-600/80"
                : "bg-gray-800/80"
            )}
          >
            {message.image && (
              <Image
                src={message.image}
                alt={message.image}
                width={200}
                height={150}
                className="rounded-lg object-cover mb-2"
              />
            )}
            {message.text.length > 0 && <p className="text-sm text-white font-spaceGrotesk">{message.text}</p>}
            <div className="absolute right-2 bottom-2 flex items-center gap-1 text-[9px] text-gray-300 opacity-80">
              <p>{format(message.updatedAt, "hh:mm")}</p>
              {message.receiver._id === currentContact?._id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                  {message.status === CONST.READ ? (
                    <CheckCheck size={12} className="text-purple-400" />
                  ) : (
                    <Check size={12} className="text-gray-400" />
                  )}
                </motion.div>
              )}
            </div>
            {message.reaction && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="absolute -right-3 -bottom-3 text-xl bg-gray-900/80 rounded-full px-2 py-1 shadow-md"
              >
                {message.reaction}
              </motion.span>
            )}
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-gray-900/80 backdrop-blur-lg border-gray-800/50 rounded-lg p-1">
        <ContextMenuItem className="grid grid-cols-5 p-0">
          {reactions.map((reaction) => (
            <motion.div
              key={reaction}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "text-xl cursor-pointer p-2 rounded-md hover:bg-purple-600/50 transition-all duration-200",
                message.reaction === reaction && "bg-purple-600/50"
              )}
              onClick={() => onReaction(reaction, message._id)}
            >
              {reaction}
            </motion.div>
          ))}
        </ContextMenuItem>
        {message.sender._id !== currentContact?._id && (
          <>
            <ContextMenuSeparator className="bg-gray-800/50" />
            {!message.image && (
              <ContextMenuItem
                className="cursor-pointer text-white hover:bg-gray-700/50 rounded-md p-2"
                onClick={() => setEditedMessage(message)}
              >
                <Edit2 size={14} className="mr-2 text-purple-400" />
                <span className="font-spaceGrotesk">Edit</span>
              </ContextMenuItem>
            )}
            <ContextMenuItem
              className="cursor-pointer text-white hover:bg-gray-700/50 rounded-md p-2"
              onClick={() => onDeleteMessage(message._id)}
            >
              <Trash size={14} className="mr-2 text-red-400" />
              <span className="font-spaceGrotesk">Delete</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MessageCard;
