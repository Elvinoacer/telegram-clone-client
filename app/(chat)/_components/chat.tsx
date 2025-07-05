"use client";

import MessageCard from "@/components/cards/message.card";
import ChatLoading from "@/components/loadings/chat.loading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messageSchema } from "@/lib/validation";
import { Paperclip, Send, Smile } from "lucide-react";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import emojies from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { useLoading } from "@/hooks/use-loading";
import { IMessage } from "@/types";
import { useCurrentContact } from "@/hooks/use-current";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSubmitMessage: (values: z.infer<typeof messageSchema>) => Promise<void>;
  onReadMessages: () => Promise<void>;
  onReaction: (reaction: string, messageId: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onTyping: (e: ChangeEvent<HTMLInputElement>) => void;
  messageForm: UseFormReturn<z.infer<typeof messageSchema>>;
  messages: IMessage[];
}

const Chat: FC<Props> = ({
  onSubmitMessage,
  messageForm,
  messages,
  onReadMessages,
  onReaction,
  onDeleteMessage,
  onTyping,
}) => {
  const [open, setOpen] = useState(false);
  const { loadMessages } = useLoading();
  const { editedMessage, setEditedMessage, currentContact } = useCurrentContact();
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLFormElement | null>(null);

  const filteredMessages = messages.filter(
    (message, index, self) =>
      ((message.sender._id === session?.currentUser?._id && message.receiver._id === currentContact?._id) ||
        (message.sender._id === currentContact?._id && message.receiver._id === session?.currentUser?._id)) &&
      index === self.findIndex((m) => m._id === message._id)
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    onReadMessages();
  }, [messages]);

  useEffect(() => {
    if (editedMessage) {
      messageForm.setValue("text", editedMessage.text);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editedMessage]);

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const text = messageForm.getValues("text");
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    const newText = text.slice(0, start) + emoji + text.slice(end);
    messageForm.setValue("text", newText);

    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-end z-40 min-h-[92vh] sidebar-custom-scrollbar overflow-y-auto bg-gray-900/80 backdrop-blur-lg"
    >
      {/* Loading */}
      {loadMessages && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
          <ChatLoading />
        </motion.div>
      )}

      {/* Messages */}
      <motion.div
        className="flex-1 p-4 space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <AnimatePresence>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageCard message={message} onReaction={onReaction} onDeleteMessage={onDeleteMessage} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Start conversation */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-[88vh] flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="text-[100px] cursor-pointer"
            onClick={() => onSubmitMessage({ text: "✋" })}
          >
            ✋
          </motion.div>
        </motion.div>
      )}

      {/* Message input */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="p-4 bg-gray-900/90 border-t border-gray-800/50"
      >
        <Form {...messageForm}>
          <form
            onSubmit={messageForm.handleSubmit(onSubmitMessage)}
            className="w-full flex items-center gap-2 relative"
            ref={scrollRef}
          >
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="icon"
                    type="button"
                    variant="secondary"
                    className="bg-gray-800/50 text-purple-400 hover:bg-gray-700/50"
                  >
                    <Paperclip size={20} />
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/80 backdrop-blur-lg border-gray-800/50">
                <DialogHeader>
                  <DialogTitle className="text-white">Upload Image</DialogTitle>
                </DialogHeader>
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    onSubmitMessage({ text: "", image: res[0].url });
                    setOpen(false);
                  }}
                  config={{ appendOnPaste: true, mode: "auto" }}
                  className="bg-gray-800/50 border-gray-700/50 rounded-lg"
                />
              </DialogContent>
            </Dialog>

            <FormField
              control={messageForm.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        className="h-12 bg-gray-800/50 text-white border-gray-700/50 focus:ring-2 focus:ring-purple-500 placeholder-gray-400 rounded-lg"
                        placeholder="Type a message"
                        value={field.value}
                        onBlur={() => field.onBlur()}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          onTyping(e);
                          if (e.target.value === "") setEditedMessage(null);
                        }}
                        ref={inputRef}
                      />
                    </motion.div>
                  </FormControl>
                </FormItem>
              )}
            />

            <Popover>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="icon"
                    type="button"
                    variant="secondary"
                    className="bg-gray-800/50 text-purple-400 hover:bg-gray-700/50"
                  >
                    <Smile size={20} />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="p-0 border-none rounded-md absolute right-0 bottom-14 bg-gray-900/80 backdrop-blur-lg">
                <Picker
                  data={emojies}
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  onEmojiSelect={(emoji: { native: string }) => handleEmojiSelect(emoji.native)}
                />
              </PopoverContent>
            </Popover>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg"
              >
                <Send size={20} />
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
};

export default Chat;
