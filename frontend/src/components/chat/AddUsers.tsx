
import React from 'react';
import { useContext, useState } from 'react';
import ProfileBanner from '../profilebanner';
import { AppContext } from '../../context/app.context';
import Modal from "../modal"
import { ChatContext } from '../../context/chat.context';


const AddUsers = ({}) => 
{
    // const [Allusers, setUsers] = useState([]);
    const {user} = useContext(AppContext);
    const {users} = useContext(ChatContext);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    return (
        <div className="animation-fade animate-duration-500 absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
            <Modal>
            <div className="w-full h[100px] flex items-center justify-center flex-col align-middle gap-2 pt-2 overflow-y-scroll scrollbar-hide">
            <span className="w-full mb-2 text-sm font-medium text-gray-900 dark:text-white">Select users: </span>
            {users?.filter((u : any) => {
                return u.id !== user?.id;
            }).map((u : any) => {
                return (
                <div key={u.id} className="flex flex-row items-center justify-between w-full">
                    <ProfileBanner
                        key={u.id}
                        avatar={u.avatar}
                        name={u.username}
                        description={u.status}
                    />
                    <div className="w-8">
                        <input
                        type="checkbox"
                        className="h-5 w-5"
                        onClick={() => {
                        }}
                        onChange={() => {
                            !selectedUsers.includes(u.id) ?
                            setSelectedUsers([...selectedUsers, u.id]) :
                            setSelectedUsers(selectedUsers?.filter((id) => id !== u.id));
                            }}
                        />
                    </div>
                    </div>
                );
            })}
            </div>
            </Modal>
        </div>
    );
}

export default AddUsers;