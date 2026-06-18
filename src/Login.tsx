import { useState } from "react";
import { supabase } from "./supabase";

type LoginProps = {
    onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsSubmitting(false);

        if (error) {
            setErrorMessage("Login failed. Check the email and password.");
            return;
        }

        onLogin();
    }

    return (
        <main className="login-page">
            <section className="panel login-card">
                <div className="panel-body">
                    <div className="login-logo">A</div>

                    <p className="admin-kicker">Private Portal</p>
                    <h1 className="admin-title">AITCH DJ Admin</h1>
                    <p className="admin-subtitle">
                        Sign in to manage the live DJ carousel shown on the AITCH website.
                    </p>

                    <form onSubmit={handleSubmit} className="form-stack" style={{ marginTop: 28 }}>
                        <label className="field">
                            <span className="field-label">Email</span>
                            <input
                                className="input"
                                type="email"
                                placeholder="client@email.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </label>

                        <label className="field">
                            <span className="field-label">Password</span>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </label>

                        {errorMessage && <p className="message message-error">{errorMessage}</p>}

                        <button className="button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Logging in..." : "Log in"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}