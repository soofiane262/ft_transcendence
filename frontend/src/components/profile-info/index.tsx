"use client";

import useSWR from "swr";
import IUser from "@/interfaces/user";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import {
    addFriend,
    cancelFriend,
    acceptFriend,
    BlockUser,
    UnBlockUser,
    isBlocked,
} from "./tools";
import Image from "next/image";

import { Spinner, Avatar, Button } from "@/components";
import { ChatContext } from "@/context/chat.context";
import { useRouter } from "next/navigation";
import { BiBlock } from "react-icons/bi";
import { CgUnblock } from "react-icons/cg";

const status = {
    ONLINE: { status: "online", color: "text-green-500" },
    OFFLINE: { status: "offline", color: "text-red-500" },
    INGAME: { status: "in game", color: "text-yellow-600" },
};

const ProfileInfo = ({
    user,
    currentUser,
}: {
    user: IUser;
    currentUser?: IUser;
}) => {
    const router = useRouter();
    const { socket } = useContext(ChatContext);
    const {
        data: friendRequest,
        isLoading,
        mutate,
    } = useSWR(
        `api/users/${user?.id}/friend-request`,
        async (url) => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACK_END_URL}${url}`,
                {
                    withCredentials: true,
                    params: {
                        senderId: currentUser?.id,
                        receiverId: user?.id,
                    },
                }
            );
            return response.data;
        },
        {
            refreshInterval: 1,
        }
    );
    const [text, setText] = useState("");
    const blocked = isBlocked(currentUser?.id || 0, user);

    useEffect(() => {
        if (
            friendRequest?.status === "PENDING" &&
            friendRequest?.senderId === currentUser?.id
        )
            setText("Cancel Request");
        else if (
            friendRequest?.status === "PENDING" &&
            friendRequest?.senderId !== currentUser?.id
        )
            setText("Accept");
        else if (friendRequest?.status === "ACCEPTED") setText("Remove Friend");
        else setText("Add Friend");
    }, [friendRequest, isLoading, currentUser?.id]);

    if (isLoading) return <Spinner />;

    const userStatus = status[user.status as "ONLINE" | "OFFLINE" | "INGAME"];
    return (
        <>
            <div className="flex w-full max-w-[1024px] flex-col items-center justify-between gap-4 md:flex-row ">
                <div className=" w-full ">
                    <div className="flex w-full items-center justify-between gap-4 text-white">
                        <div className="flex w-full flex-col items-center justify-between lg:gap-6 gap-4 lg:flex-row">
                            <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row">
                                <div className="basis-1/3">
                                    <Avatar
                                        src={user?.avatar || "/img/default-avatar.png"}
                                        alt="avatar"
                                        className="h-48 w-48 md:h-24 md:w-24"
                                    />
                                </div>
                                <div className="place-items-left grid w-full gap-1">
                                    <span className="text-lg font-semibold">
                                        {user?.fullname}
                                    </span>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-sm font-light">
                                            @{user?.username}
                                        </span>
                                        <span className={`${userStatus.color}`}>
                                            {userStatus.status}
                                        </span>
                                    </div>
                                    <div className="flex w-full gap-4">
                                        <Button
                                            disabled={user?.id === currentUser?.id}
                                            className="w-full !text-xs"
                                            onClick={async () => {
                                                if (text === "Add Friend")
                                                    await addFriend(currentUser?.id || 0, user.id);
                                                else if (text === "Accept")
                                                    await acceptFriend(friendRequest.id);
                                                else await cancelFriend(friendRequest.id);

                                                await mutate();
                                            }}
                                        >
                                            {text}
                                        </Button>
                                        <Button
                                            disabled={user?.id === currentUser?.id}
                                            className="w-full !text-xs"
                                            onClick={() => {
                                                socket?.emit("dm_create", {
                                                    senderId: currentUser?.id,
                                                    receiverId: user?.id,
                                                });
                                                router.push(`/chat`);
                                            }}
                                        >
                                            Message
                                        </Button>
                                        <Button
                                            type={blocked ? "success" : "danger"}
                                            onClick={async () => {
                                                blocked
                                                    ? UnBlockUser(currentUser?.id || 0, user.id)
                                                    : BlockUser(currentUser?.id || 0, user.id);
                                                await mutate();

                                            }}
                                        >
                                            {blocked ? <CgUnblock /> : <BiBlock />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid w-full justify-between grid-cols-1">
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Score
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className=" font-medium">
                                            {user?.rating}
                                            <span className=" text-gray-300 ">/10000</span>
                                        </span>
                                        <img src={`/img/smalllogo.svg`} alt="" width={14} />
                                    </div>
                                </div>
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Rank
                                    </span>
                                    <span>
                                        {user.ladder
                                            .toLowerCase()
                                            .split("_")
                                            .map(
                                                (word: string) =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                            )
                                            .join(" ")}
                                    </span>
                                </div>
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Games Won
                                    </span>
                                    <span>
                                        {user.wins} of {user.totalGames}
                                    </span>
                                </div>
                                <div className="flex w-full justify-between gap-1">
                                    <span className="text-sm font-light text-primary-500">
                                        Win Streak
                                    </span>
                                    <span>{user.winStreak}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileInfo;