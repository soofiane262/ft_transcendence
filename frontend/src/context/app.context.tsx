"use client";

import axios from "axios";
import React from "react";
import IUser from "@/interfaces/user";
import { redirect, usePathname } from "next/navigation";
import useSwr from "swr"


export interface IAppContext {
	user: IUser | undefined;
	loading: boolean;
	authenticated: boolean;
	setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	fetchUser: () => Promise<void>;
	updateUser: () => Promise<void>;
}

export const getCookieItem = (key: string): string | undefined => {
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

export const AppContext = React.createContext<IAppContext>({
	user: undefined,
	loading: true,
	authenticated: false,
	setAuthenticated: () => { },
	fetchUser: async () => { },
	updateUser: async () => { },
});

export const fetcher = async (url: string) => {
	try {
		const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_URL}${url}`, {
			withCredentials: true,
		});
		return response.data;
	}
	catch (error) {
		throw error;
	}
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const { data, isLoading, mutate } = useSwr('api/auth/42', fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 0,
		refreshWhenHidden: false,
		refreshWhenOffline: false,
		shouldRetryOnError: false,
	})
	const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);


	const path = usePathname();

	React.useEffect(() => {
		if (data) {
			setIsAuthenticated(true);
		}
		else {
			setIsAuthenticated(false);
		}
	}, [data])

	if (!isAuthenticated && !isLoading && path !== "/")
		redirect("/");
	// else if (isAuthenticated && !isLoading && path === "/")
	// 	redirect("/home");

	const appContextValue: IAppContext = {
		user: data,
		loading: isLoading,
		authenticated: isAuthenticated,
		setAuthenticated: setIsAuthenticated,
		fetchUser: mutate,
		updateUser: mutate,
	};

	return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
