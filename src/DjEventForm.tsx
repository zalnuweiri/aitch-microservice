import { useEffect, useState } from "react";
import { supabase } from "./supabase";

type DjEventFormProps = {
    onCreated: () => void;
};

export default function DjEventForm({ onCreated }: DjEventFormProps) {
    const [djName, setDjName] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [dateLabel, setDateLabel] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreviewUrl("");
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(nextPreviewUrl);

        return () => URL.revokeObjectURL(nextPreviewUrl);
    }, [file]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!file) {
            setMessage("Please choose an image.");
            setMessageType("error");
            return;
        }

        setIsSubmitting(true);
        setMessage("");
        setMessageType("");

        try {
            const fileExt = file.name.split(".").pop();
            const safeName = djName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            const filePath = `${safeName || "dj"}-${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("dj-event-images")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from("dj-event-images")
                .getPublicUrl(filePath);

            const imageUrl = publicUrlData.publicUrl;

            const { error: insertError } = await supabase.from("dj_events").insert({
                dj_name: djName.trim(),
                subtitle: subtitle.trim() || null,
                date_label: dateLabel.trim(),
                image_url: imageUrl,
                image_path: filePath,
                sort_order: sortOrder ? Number(sortOrder) : 999,
                is_active: true,
            });

            if (insertError) {
                throw insertError;
            }

            setDjName("");
            setSubtitle("");
            setDateLabel("");
            setSortOrder("");
            setFile(null);
            setMessage("DJ card added successfully.");
            setMessageType("success");
            onCreated();
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong while creating the DJ card.");
            setMessageType("error");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="panel">
            <div className="panel-header">
                <h2 className="panel-title">Add New DJ Card</h2>
                <p className="panel-copy">
                    Upload artwork and enter the display text exactly as it should appear.
                </p>
            </div>

            <div className="panel-body">
                <form onSubmit={handleSubmit} className="form-stack">
                    <div className="image-preview">
                        {previewUrl ? <img src={previewUrl} alt="" /> : <span>Image preview</span>}
                    </div>

                    <label className="field">
                        <span className="field-label">DJ Name</span>
                        <input
                            className="input"
                            value={djName}
                            onChange={(event) => setDjName(event.target.value)}
                            placeholder="e.g. Murda Beatz"
                            required
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Subtitle optional</span>
                        <input
                            className="input"
                            value={subtitle}
                            onChange={(event) => setSubtitle(event.target.value)}
                            placeholder="e.g. From Italy"
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Date Label</span>
                        <input
                            className="input"
                            value={dateLabel}
                            onChange={(event) => setDateLabel(event.target.value)}
                            placeholder="e.g. Friday June 12th"
                            required
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Sort Order optional</span>
                        <input
                            className="input"
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                            placeholder="e.g. 1"
                            type="number"
                            min="0"
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Image</span>
                        <input
                            className="file-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                            required
                        />
                    </label>

                    <button className="button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding card..." : "Add DJ Card"}
                    </button>

                    {message && (
                        <p
                            className={`message ${
                                messageType === "success"
                                    ? "message-success"
                                    : messageType === "error"
                                        ? "message-error"
                                        : ""
                            }`}
                        >
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}