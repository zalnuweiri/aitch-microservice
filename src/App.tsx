import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./admin.css";

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();

    setIsAuthed(Boolean(data.session));
    setIsCheckingSession(false);
  }

  useEffect(() => {
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isCheckingSession) {
    return (
        <main className="login-page">
          <p className="message">Loading admin panel...</p>
        </main>
    );
  }

  return isAuthed ? <Dashboard /> : <Login onLogin={checkSession} />;
}