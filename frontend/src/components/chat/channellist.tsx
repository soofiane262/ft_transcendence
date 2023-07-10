import {useContext, useEffect, useState } from "react";
import Channel from "./channel";
import { AppContext } from "../../context/app.context";
import {BsFillChatLeftTextFill} from "react-icons/bs";
import {BiFilter} from "react-icons/bi";
import { ChatContext } from "../../context/chat.context";
import clsx from "clsx";
import Modal from "../modal";
import Input from "../input";
import Button from "../button";
import axios from "axios";
import { toast } from "react-toastify";

const ChannelList = ({className, setShowModal, setCurrentChannel, setChannelMember, setOpen} : 
  {className?: string, setShowModal: any,  setCurrentChannel: any, setChannelMember: any, setOpen?: any}) => {
  
  const[channels, setChannels] = useState<any>([]);
  const [archiveChannels, setArchiveChannels] = useState<any>([]);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("")

  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [tempChannel, setTempChannel] = useState<any>();
  const {socket} = useContext(ChatContext);
  let {user} = useContext(AppContext)
  const [isFocused, setIsFocused] = useState(false);
  
  const onClick = (channel : any) : void | undefined => {
    if (channel.isacessPassword) {
      setModal(true);
      setTempChannel(channel);
    }
    else
    {
      setOpen(true);
      setCurrentChannel(channel);
      getChannelMember(channel.id);
    }
  }

  const accessChannel = async () => {
    const accesstoken = window.localStorage.getItem("access_token");
    const res = await axios.post(`${process.env.REACT_APP_BACK_END_URL}api/channels/checkpass`, {password, channelId: tempChannel.id}, {headers: {Authorization: `Bearer ${accesstoken}`}});
    console.log(res)
    if(res.data === true)
    {
      setOpen(true);
      setCurrentChannel(tempChannel);
      getChannelMember(tempChannel.id);
    }
    else
    {
      toast.error("Wrong access password !");
    }
  }

  useEffect(() => {
    if (search === "") {
      getuserChannels(user?.id);
      getNewChannel();
      getArchiveChannels(user?.id);
    }
    socket?.on('channel_leave', (channels: any) => {
      setCurrentChannel();
      setOpen(false);
    });
  
    socket?.on('channel_delete', (channels: any) => {
      setCurrentChannel();
      setOpen(false);
    });

    socket?.on('channel_remove', (channels: any) => {
      setCurrentChannel();
      setOpen(false);
    });

    //eslint-disable-next-line
  }, [channels, socket]);

  
  const getuserChannels = async (id: any) => {
      try {
        socket?.emit('getChannels', {user: {id}});
        socket?.on('getChannels', (channels: any) => {   
        channels.forEach((channel: any) => {
          if (channel.type === "CONVERSATION") {
              channel.name = channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username;
              channel.avatar = channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar;
          }
        });
        channels.sort((a: any, b: any) => {
          if (a.updatedAt < b.updatedAt) return 1;
          else return -1;
        });
        setChannels(channels);
      }
      );
    } catch (error) { 
      console.log(error);
    }
  }
  
const getArchiveChannels = async (id: any) => {
  try {
    socket?.emit('getArchiveChannels', {user: {id}});
    socket?.on('getArchiveChannels', (channels: any) => {
      channels.sort((a: any, b: any) => {
        if (a.updatedAt < b.updatedAt) return 1;
        else return -1;
      });
      setArchiveChannels(channels); 
    }
    );
  } catch (error) {
    console.log(error);
  }
}


const getNewChannel = async () => {
  try {
        socket?.on('channel_create', (channel: any) => {
          setChannels([...channels, channel]);
            setCurrentChannel(channel);
          });
          socket?.on('dm_create', (channel: any) => {
            setChannels([...channels, channel]);
            setCurrentChannel(channel);
        });
    } catch (error) {
        console.log(error);
    }
}

const getChannelMember = (channelId: any) => {
  try {
    socket?.emit('channel_member', {userId : user?.id, channelId : channelId });
    socket?.on('channel_member', (data: any) => {
      setChannelMember(data);
    }
    );
  } catch (error) {
    console.log(error);
  }
}

const onChange = (e: any) => {
  e.preventDefault();
  setSearch(e.target.value)
  if (search !== "") {
    setChannels(channels.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase())));
  } else {
    getuserChannels(user?.id);
  }
}

return (
  <>
    <div className={clsx("lg:col-span-3 col-span-10 flex flex-col justify-start gap-4 py-2 w-full h-screen overflow-y-scroll scrollbar-hide", className && className)}>
      <div className=" relative flex items-center gap-2 w-full pr-2 rounded-xl py-2">
        <form className="pl-4 pr-1 w-full">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute top-0 bottom-0 w-6 h-6 my-auto text-secondary-400 text-xs left-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full py-2 pl-12 pr-4 text-secondary-400 border border-tertiary-700 rounded-md outline-none bg-secondary-300 focus:text-primary-400 focus:border-primary-200 placeholder-secondary-400 placeholder-text-sm"
                        value={search}
                        onChange={onChange}
                    />
                </div>
            </form>
            <BsFillChatLeftTextFill style={{color: "#727587", fontSize: "30px", cursor: "pointer"}}
            onClick={
              () => {
                setShowModal(true);
              }
            }/>
            <BiFilter
            style={{ color: isFocused ? "#E5AC7C" : "#727587", fontSize: "40px", cursor: "pointer" }}
            onClick={
              () => {
                setIsFocused(!isFocused);
                setShowArchive(!showArchive);
              }
            }/>
        </div>
      {
        showArchive &&
        (
          <div className="flex items-center flex-col gap-2 text-primary-500 font-bold text-md">
            FILTERED BY ARCHIVED
          </div>
        )
      }

      {
        !showArchive ? 
        (
          
          channels?.filter(
            (channel: any) => channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)
          )?.map((channel: any) => {
            return (
              <Channel
              key={channel.id}
              id={channel.id}
              name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}
              pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
              muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
              archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
              unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
              avatar={channel.type !== "CONVERSATION" ? channel.avatar :
              channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar}
              description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)) )  ? channel.messages[channel.messages.length - 1]?.content : ""}
              updatedAt={channel.lastestMessageDate}
              newMessages={channel.newMessagesCount}
              userStatus={channel.type !== "CONVERSATION" ? false : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.status === "ONLINE"}
              onClick={() => onClick(channel)}
                />
                )
              }).concat(
                      channels?.filter(
                        (channel: any) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)))
                        ).map((channel: any) => {
                          return (
                            <Channel
                            key={channel.id}
                            id={channel.id}
                            name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}
                            pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                            muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                            archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                            unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                            avatar={channel.type !== "CONVERSATION" ? channel.avatar :
                                    channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar
                                    }
                            description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)) )  ? channel.messages[channel.messages.length - 1]?.content : ""}
                            updatedAt={channel.lastestMessageDate}
                            newMessages={channel.newMessagesCount}
                            userStatus={channel.type !== "CONVERSATION" ? false : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.status === "ONLINE"}
                            onClick={() => onClick(channel)}
                              />
                              )
                            })
              )) :
              (
                archiveChannels?.filter(
                  (channel: any) => channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)
                  )?.map((channel: any) => {
                    //list the pinned channels first
                    return (
                      <Channel
                      key={channel.id}
                      id={channel.id}
                      name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}
                      pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                      muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                    archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                    unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                    avatar={channel.type !== "CONVERSATION" ? channel.avatar :
                    channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar
                  }                    
                    description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)))  ? channel.messages[channel.messages.length - 1]?.content : ""}
                    updatedAt={channel.lastestMessageDate}
                    newMessages={channel.newMessagesCount}
                    userStatus={channel.type !== "CONVERSATION" ? false : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.status === "ONLINE"}
                    onClick={() => onClick(channel)}
                      />
                      )
                    }).concat(
                            archiveChannels?.filter(
                              (channel: any) => ((!channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)))
                              ).map((channel: any) => {
                                return (
                                  <Channel
                                  key={channel.id}
                                  id={channel.id}
                                  name={channel.type !== "CONVERSATION" ? channel.name : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.username}
                                  pinned={channel.pinnedFor?.map((user: any) => user.id).includes(user?.id)}
                                  muted={channel.mutedFor?.map((user: any) => user.id).includes(user?.id)}
                                  archived={channel.archivedFor?.map((user: any) => user.id).includes(user?.id)}
                                  unread={channel.unreadFor?.map((user: any) => user.id).includes(user?.id)}
                                  avatar={channel.type !== "CONVERSATION" ? channel.avatar :
                                  channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.avatar
                                }                                  
                                description={(channel.messages  && !(channel.bannedUsers?.map((user:any) => user.id).includes(user?.id)) && !(channel.kickedUsers?.map((user:any) => user.id).includes(user?.id)))  ? channel.messages[channel.messages.length - 1]?.content : ""}
                                updatedAt={channel.lastestMessageDate}
                                newMessages={channel.newMessagesCount}
                                userStatus={channel.type !== "CONVERSATION" ? false : channel.channelMembers?.filter((member: any) => member.userId !== user?.id)[0].user?.status === "ONLINE"}
                                onClick={() => onClick(channel)}

                                    />
                                    )
                                  })
                                  ))
                                } 
    </div>
    {
              modal && (
                <Modal
                setShowModal={setModal}
                className="z-30 bg-secondary-800 border-none flex flex-col items-center justify-start shadow-lg shadow-secondary-500 gap-4 text-white min-w-[90%] lg:min-w-[40%] xl:min-w-[50%] animate-jump-in animate-ease-out animate-duration-400 max-w-[100%] w-full"
                >
                    <span className="text-md">This channel require access pass </span>
                    <div className="flex flex-col justify-center items-center w-full">
                        <Input
                            label="Password"
                            className="h-[40px] w-[80%] rounded-md border-2 border-primary-500 text-white text-xs bg-transparent md:mr-2"
                            type="password"
                            placeholder="*****************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        <Button
                            className="h-8 w-auto md:w-20 bg-primary-500 text-white text-xs rounded-full mt-2"
                            onClick={() => {
                                accessChannel()
                                setModal(false);
                              }}
                            >
                            <span className="text-xs">Access</span>
                        </Button>
                    </div>
                </Modal>
                )
    }
    </>
  );
};

export default ChannelList;
