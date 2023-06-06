import { useContext } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppProvider, { AppContext } from "./context/app.context";
import { Spinner } from "./components";
import {
  TwoFactorAuth,
  Login,
  Home,
  SignUp,
  Chat,
  Settings,
  Pong,
  FourOhFour,
  Profile,
  Search,
} from "./pages/";

const PrivateRoutes = () => {
  const { authenticated, loading, user, fetchUser } = useContext(AppContext);
  const path = useLocation().pathname;
  const twoFactorAuth = user?.twoFactorAuth;

  if (loading) {
    return <Spinner />;
  }
  return authenticated || (path === "/tfa" && twoFactorAuth) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pong" element={<Pong />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tfa" element={<TwoFactorAuth />} />
          <Route path="/profile/" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<FourOhFour />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
