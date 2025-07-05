"use client";

import { Loader2 } from "lucide-react";
import ContactList from "./_components/contact-list";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import AddContact from "./_components/add-contact";
import { useCurrentContact } from "@/hooks/use-current";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { emailSchema, messageSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import TopChat from "./_components/top-chat";
import Chat from "./_components/chat";
import { useLoading } from "@/hooks/use-loading";
import { axiosClient } from "@/http/axios";
import { useSession } from "next-auth/react";
import { generateToken } from "@/lib/generate-token";
import { IError, IMessage, IUser } from "@/types";
import { toast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import useAudio from "@/hooks/use-audio";
import { CONST } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const [contacts, setContacts] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const { setCreating, setLoading, isLoading, setLoadMessages, setTyping } = useLoading();
  const { currentContact, editedMessage, setEditedMessage } = useCurrentContact();
  const { data: session } = useSession();
  const { setOnlineUsers } = useAuth();
  const { playSound } = useAudio();
  const socket = useRef<ReturnType<typeof io> | null>(null);

  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: "", image: "" },
  });

  const getContacts = async () => {
    setLoading(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.get<{ contacts: IUser[] }>("/api/user/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(data.contacts);
    } catch {
      toast({ description: "Cannot fetch contacts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async () => {
    setLoadMessages(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.get<{ messages: IMessage[] }>(`/api/user/messages/${currentContact?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data.messages);
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? { ...item, lastMessage: item.lastMessage ? { ...item.lastMessage, status: CONST.READ } : null }
            : item
        )
      );
    } catch {
      toast({ description: "Cannot fetch messages", variant: "destructive" });
    } finally {
      setLoadMessages(false);
    }
  };

  useEffect(() => {
    socket.current = io("ws://localhost:5000");
  }, []);

  useEffect(() => {
    if (session?.currentUser?._id) {
      socket.current?.emit("addOnlineUser", session.currentUser);
      socket.current?.on("getOnlineUsers", (data: { socketId: string; user: IUser }[]) => {
        setOnlineUsers(data.map((item) => item.user));
      });
      getContacts();
    }
  }, [session?.currentUser]);

  useEffect(() => {
    if (session?.currentUser) {
      socket.current?.on("getCreatedUser", (user) => {
        setContacts((prev) => {
          const isExist = prev.some((item) => item._id === user._id);
          return isExist ? prev : [...prev, user];
        });
      });

      socket.current?.on("getNewMessage", ({ newMessage, sender, receiver }: GetSocketType) => {
        setTyping({ message: "", sender: null });
        if (currentContact?._id === newMessage.sender._id) {
          setMessages((prev) => [...prev, newMessage]);
        }
        setContacts((prev) => {
          return prev.map((contact) => {
            if (contact._id === sender._id) {
              return {
                ...contact,
                lastMessage: {
                  ...newMessage,
                  status: currentContact?._id === sender._id ? CONST.READ : newMessage.status,
                },
              };
            }
            return contact;
          });
        });
        if (!receiver.muted) {
          playSound(receiver.notificationSound);
        }
      });

      socket.current?.on("getReadMessages", (messages: IMessage[]) => {
        setMessages((prev) => {
          return prev.map((item) => {
            const message = messages.find((msg) => msg._id === item._id);
            return message ? { ...item, status: CONST.READ } : item;
          });
        });
      });

      socket.current?.on("getUpdatedMessage", ({ updatedMessage, sender }: GetSocketType) => {
        setTyping({ message: "", sender: null });
        setMessages((prev) =>
          prev.map((item) =>
            item._id === updatedMessage._id
              ? { ...item, reaction: updatedMessage.reaction, text: updatedMessage.text }
              : item
          )
        );
        setContacts((prev) =>
          prev.map((item) =>
            item._id === sender._id
              ? {
                  ...item,
                  lastMessage: item.lastMessage?._id === updatedMessage._id ? updatedMessage : item.lastMessage,
                }
              : item
          )
        );
      });

      socket.current?.on("getDeletedMessage", ({ deletedMessage, sender, filteredMessages }: GetSocketType) => {
        setMessages((prev) => prev.filter((item) => item._id !== deletedMessage._id));
        const lastMessage = filteredMessages.length ? filteredMessages[filteredMessages.length - 1] : null;
        setContacts((prev) =>
          prev.map((item) =>
            item._id === sender._id
              ? { ...item, lastMessage: item.lastMessage?._id === deletedMessage._id ? lastMessage : item.lastMessage }
              : item
          )
        );
      });

      socket.current?.on("getTyping", ({ message, sender }: GetSocketType) => {
        if (currentContact?._id === sender._id) {
          setTyping({ message, sender });
        }
      });
    }
  }, [session?.currentUser, currentContact?._id]);

  useEffect(() => {
    if (currentContact?._id) {
      getMessages();
      setShowSidebar(false);
    }
  }, [currentContact]);

  const onCreateContact = async (values: z.infer<typeof emailSchema>) => {
    setCreating(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ contact: IUser }>("/api/user/contact", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts((prev) => [...prev, data.contact]);
      socket.current?.emit("createContact", { currentUser: session?.currentUser, receiver: data.contact });
      toast({ description: "Contact added successfully" });
      contactForm.reset();
    } catch (error: any) {
      if ((error as IError).response?.data?.message) {
        return toast({ description: (error as IError).response.data.message, variant: "destructive" });
      }
      return toast({ description: "Something went wrong", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    if (editedMessage?._id) {
      onEditMessage(editedMessage._id, values.text);
    } else {
      onSendMessage(values);
    }
  };

  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true);
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<GetSocketType>(
        "/api/user/message",
        { ...values, receiver: currentContact?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, data.newMessage]);
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id ? { ...item, lastMessage: { ...data.newMessage, status: CONST.READ } } : item
        )
      );
      messageForm.reset();
      socket.current?.emit("sendMessage", {
        newMessage: data.newMessage,
        receiver: data.receiver,
        sender: data.sender,
      });
      if (!data.sender.muted) {
        playSound(data.sender.sendingSound);
      }
    } catch {
      toast({ description: "Cannot send message", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const onEditMessage = async (messageId: string, text: string) => {
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.put<{ updatedMessage: IMessage }>(
        `/api/user/message/${messageId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((item) => (item._id === data.updatedMessage._id ? { ...item, text: data.updatedMessage.text } : item))
      );
      socket.current?.emit("updateMessage", {
        updatedMessage: data.updatedMessage,
        receiver: currentContact,
        sender: session?.currentUser,
      });
      messageForm.reset();
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? { ...item, lastMessage: item.lastMessage?._id === messageId ? data.updatedMessage : item.lastMessage }
            : item
        )
      );
      setEditedMessage(null);
    } catch {
      toast({ description: "Cannot edit message", variant: "destructive" });
    }
  };

  const onReadMessages = async () => {
    const receivedMessages = messages
      .filter((message) => message.receiver._id === session?.currentUser?._id)
      .filter((message) => message.status !== CONST.READ);

    if (receivedMessages.length === 0) return;
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ messages: IMessage[] }>(
        "/api/user/message-read",
        { messages: receivedMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.current?.emit("readMessages", { messages: data.messages, receiver: currentContact });
      setMessages((prev) => {
        return prev.map((item) => {
          const message = data.messages.find((msg) => msg._id === item._id);
          return message ? { ...item, status: CONST.READ } : item;
        });
      });
    } catch {
      toast({ description: "Cannot read messages", variant: "destructive" });
    }
  };

  const onReaction = async (reaction: string, messageId: string) => {
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.post<{ updatedMessage: IMessage }>(
        "/api/user/reaction",
        { reaction, messageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.updatedMessage._id ? { ...item, reaction: data.updatedMessage.reaction } : item
        )
      );
      socket.current?.emit("updateMessage", {
        updatedMessage: data.updatedMessage,
        receiver: currentContact,
        sender: session?.currentUser,
      });
    } catch {
      toast({ description: "Cannot react to message", variant: "destructive" });
    }
  };

  const onDeleteMessage = async (messageId: string) => {
    const token = await generateToken(session?.currentUser?._id);
    try {
      const { data } = await axiosClient.delete<{ deletedMessage: IMessage }>(`/api/user/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredMessages = messages.filter((item) => item._id !== data.deletedMessage._id);
      const lastMessage = filteredMessages.length ? filteredMessages[filteredMessages.length - 1] : null;
      setMessages(filteredMessages);
      socket.current?.emit("deleteMessage", {
        deletedMessage: data.deletedMessage,
        sender: session?.currentUser,
        receiver: currentContact,
        filteredMessages,
      });
      setContacts((prev) =>
        prev.map((item) =>
          item._id === currentContact?._id
            ? { ...item, lastMessage: item.lastMessage?._id === messageId ? lastMessage : item.lastMessage }
            : item
        )
      );
    } catch {
      toast({ description: "Cannot delete message", variant: "destructive" });
    }
  };

  const onTyping = (e: ChangeEvent<HTMLInputElement>) => {
    socket.current?.emit("typing", { receiver: currentContact, sender: session?.currentUser, message: e.target.value });
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      {/* Mobile header with menu button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-900/80 border-b border-gray-800/50 sticky top-0 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
        {currentContact && (
          <div className="flex-1 text-center font-medium text-white font-spaceGrotesk">
            {currentContact.firstName} {currentContact.lastName}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar || !currentContact?._id) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`w-full sm:w-80 h-full md:h-screen border-r border-gray-800/50 bg-gray-900/80 backdrop-blur-lg fixed top-0 left-0 z-50 flex flex-col ${
              !showSidebar && !currentContact?._id ? "" : "md:sticky md:top-0"
            }`}
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex justify-center items-center"
              >
                <Loader2 size={50} className="animate-spin text-purple-400" />
              </motion.div>
            ) : (
              <ContactList contacts={contacts} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 w-full min-h-screen"
      >
        <AnimatePresence>
          {!currentContact?._id ? (
            <motion.div
              key="add-contact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center p-4"
            >
              <AddContact contactForm={contactForm} onCreateContact={onCreateContact} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full relative flex flex-col h-full"
            >
              <TopChat messages={messages} onMenuClick={toggleSidebar} />
              <Chat
                messageForm={messageForm}
                onSubmitMessage={onSubmitMessage}
                messages={messages}
                onReadMessages={onReadMessages}
                onReaction={onReaction}
                onDeleteMessage={onDeleteMessage}
                onTyping={onTyping}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HomePage;

interface GetSocketType {
  receiver: IUser;
  sender: IUser;
  newMessage: IMessage;
  updatedMessage: IMessage;
  deletedMessage: IMessage;
  filteredMessages: IMessage[];
  message: string;
}
