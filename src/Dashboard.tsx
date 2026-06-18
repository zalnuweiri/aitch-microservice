import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import DjEventForm from "./DjEventForm";
import DjEventList from "./DjEventList";

type DjEvent = {
    id: string;
    dj_name: string;
    subtitle: string | null;
    date_label: string;
    image_url: string;
    sort_order: number;
};

export default function Dashboard() {
    const [events, setEvents] = useState<DjEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    async function loadEvents() {
        setIsLoading(true);
        setLoadError("");

        const { data, error } = await supabase
            .from("dj_events")
            .select("id, dj_name, subtitle, date_label, image_url, sort_order")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            setLoadError("Could not load DJ cards.");
            setEvents([]);
        } else {
            setEvents(data ?? []);
        }

        setIsLoading(false);
    }

    async function hideEvent(id: string) {
        const { error } = await supabase
            .from("dj_events")
            .update({
                is_active: false,
                deleted_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error(error);
            alert("Could not hide this DJ card.");
            return;
        }

        loadEvents();
    }

    async function logout() {
        await supabase.auth.signOut();
        window.location.reload();
    }

    useEffect(() => {
        loadEvents();
    }, []);

    return (
        <main className="admin-page">
            <div className="admin-shell">
                <header className="admin-header">
                    <div>
                        <p className="admin-kicker">AITCH Admin</p>
                        <h1 className="admin-title">DJ Carousel Manager</h1>
                        <p className="admin-subtitle">
                            Add new DJ cards, upload artwork, and hide old cards from the live
                            AITCH carousel without rebuilding the website.
                        </p>
                    </div>

                    <button type="button" className="button button-secondary" onClick={logout}>
                        Log out
                    </button>
                </header>

                <div className="admin-grid">
                    <DjEventForm onCreated={loadEvents} />

                    <section className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Current DJ Cards</h2>
                            <p className="panel-copy">
                                These are the active cards currently available to the public carousel.
                            </p>
                        </div>

                        <div className="panel-body">
                            {isLoading ? (
                                <p className="message">Loading DJ cards...</p>
                            ) : loadError ? (
                                <p className="message message-error">{loadError}</p>
                            ) : (
                                <DjEventList events={events} onDelete={hideEvent} />
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}