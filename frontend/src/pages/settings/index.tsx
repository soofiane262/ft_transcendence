import { MdSettings } from "react-icons/md";
import {
  Avatar, Sidepanel, Spinner, ConfirmationModal,
  UpdateAvatar,
  UpdateInfo,
  ActivateFfa,
  JoinGameCard
} from "./../../components";
import { useContext, useState } from "react";
import { AppContext } from "../../context/app.context";
import axios from "axios";

export default function Settings() {
  const { user } = useContext(AppContext);
  const [previewImage, setPreviewImage] = useState<string>(user?.avatar || "");
  const [showmodal, setShowmodal] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="relative grid h-screen grid-cols-10 overflow-hidden bg-secondary-500">
      <Sidepanel className="col-span-2 2xl:col-span-1" />
      <div className="col-span-8 flex h-full w-full flex-col items-center justify-start overflow-y-auto px-2 pt-8 scrollbar-hide 2xl:col-span-9">
        <div className="w-full max-w-[1024px] md:flex md:flex-col md:items-center md:justify-center 2xl:w-[65%]">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="flex w-full items-center gap-2 p-2 text-lg text-white md:gap-4 md:text-2xl">
                <MdSettings />
                Account Settings
              </div>
              <UpdateAvatar
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
              />
              <div className="flex w-full flex-wrap items-start justify-center divide-y divide-quaternary-400 md:mt-4 md:flex-nowrap md:divide-x md:divide-y-0">
                {showmodal && (
                  <ConfirmationModal
                    title="Are you sure you want to delete your account"
                    accept="Yes, Delete"
                    reject="Keep Account"
                    icon={
                      <img
                        src={"/img/danger.png"}
                        alt=""
                        className="h-32 w-32"
                      />
                    }
                    onAccept={async () => {
                      try {
                        const accessToken =
                          window.localStorage.getItem("access_token");
                        await axios.delete(
                          `${process.env.REACT_APP_BACK_END_URL}api/users/${user?.id}`,
                          {
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                            },
                          }
                        );
                        window.location.reload();
                      } catch (e) {
                        setShowmodal(false);
                        setError("Error: Could not delete Accout");
                      }
                    }}
                    onReject={() => {
                      setShowmodal(false);
                    }}
                    showReject
                  />
                )}
                <ActivateFfa
                  setShowmodal={setShowmodal}
                  user={user}
                  setUpdated={setError}
                />
                <div className="flex w-full flex-col items-center justify-center gap-4 p-4 ">
                  <UpdateInfo
                    user={user}
                    previewImage={previewImage}
                    setModalText={setError}
                    setLoading={setLoading}
                  />
                  {!!error && (
                    <ConfirmationModal
                      className="flex flex-col items-center justify-center gap-8"
                      title={error}
                      accept={!error.includes("Error") ? "Continue" : "Close"}
                      icon={
                        <Avatar
                          src={
                            !error.includes("Error")
                              ? "/img/success.png"
                              : "/img/failure.png"
                          }
                          alt=""
                          className="h-32 w-32"
                        />
                      }
                      onAccept={() => {
                        setError("");
                      }}
                      danger={error.includes("Error")}
                    />
                  )}
                  <JoinGameCard />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
