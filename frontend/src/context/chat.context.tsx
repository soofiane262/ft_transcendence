"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { AppContext, fetcher } from "./app.context";
import { toast } from "react-toastify";
import { Toast } from "../components";

import { INotification } from "./socket.context";
import IUser from "@/interfaces/user";
import useSWR from "swr";
import Link from "next/link";
import { cookies } from "next/dist/client/components/headers";

export interface IchatContext {
    // users: IUser[] | undefined;
    socket: Socket | null;
}

export interface Ichannel {
    id: number | undefined;
    avatar: string;
    name: string;
    description: string;
    channelMembers: IchannelMember[];
    pinnedFor: IUser[];
    unreadFor: IUser[];
    archivedFor: IUser[];
    deletedFor: IUser[];
    mutedFor: IUser[];
    bannedUsers: IUser[];
    kickedUsers: IUser[];
    messages: Imessage[];
    visiblity: string;
    type: string;
    createAt: string;
    updatedAt: string;
    isacessPassword: boolean;
};

export interface Imessage {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    date: string;
    sender: IUser;
    receiver: IUser;
};

export interface IchannelMember {
    id: number;
    userId: number;
    channelId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: IUser;
    role: string;
    newMessagesCount: number;
};



export const ChatContext = createContext<IchatContext>({
    socket: null,
});

export default function ChatProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useContext(AppContext);

    const getCookieItem = (key: string): string | undefined => {
        const cookieString = document.cookie;
        const cookiesArray = cookieString.split("; ");

        for (const cookie of cookiesArray) {
            const [cookieKey, cookieValue] = cookie.split("=");
            if (cookieKey === key) {
                return decodeURIComponent(cookieValue);
            }
        }

        return undefined;
    };

    useEffect(() => {
        const token = getCookieItem("access_token");
        if (!token) return;
        const newSocket = io(`${process.env.NEXT_PUBLIC_BACK_END_URL}chat`, {
            auth: {
                token: token,
            },
        });

        newSocket.on("connect", () => {
            console.log("Chat Connected");
        });

        newSocket.on("disconnect", () => {
            console.log("Chat Disconnected");
        });

        newSocket.on("notification", (data: INotification) => {
            if (data.sender.id === user?.id) return;
            toast(
                <Link href={data.url}>
                    <Toast
                        title={data.title}
                        content={data.content}
                        sender={data.sender.id === user?.id ? data.receiver : data.sender}
                    />
                </Link>,
                {
                    className: "md:w-[400px] md:right-[90px]",
                }
            );
        });
        // add a toast like for error messages

        newSocket.on("error", (data: string) => {
            toast.error(
                <div className="">
                    <h1 className="text-white">Error</h1>
                    <p className="text-sm text-white">{data}</p>
                </div>
            );
        });
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const chatContextValue: IchatContext = {
        socket,
    };
    return (
        <ChatContext.Provider value={chatContextValue}>
            {children}
        </ChatContext.Provider>
    );
}