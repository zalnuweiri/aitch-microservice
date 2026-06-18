type DjEvent = {
    id: string;
    dj_name: string;
    subtitle: string | null;
    date_label: string;
    image_url: string;
    sort_order: number;
};

type DjEventListProps = {
    events: DjEvent[];
    onDelete: (id: string) => void;
};

export default function DjEventList({ events, onDelete }: DjEventListProps) {
    if (events.length === 0) {
        return (
            <div className="empty-state">
                <p>No active DJ cards.</p>
                <p className="message">
                    Add the first card using the form on the left.
                </p>
            </div>
        );
    }

    return (
        <div className="cards-list">
            {events.map((event) => (
                <article key={event.id} className="dj-card">
                    <img className="dj-card-image" src={event.image_url} alt="" />

                    <div>
                        <h3 className="dj-card-name">{event.dj_name}</h3>
                        {event.subtitle && <p className="dj-card-meta">{event.subtitle}</p>}
                        <p className="dj-card-meta">{event.date_label}</p>
                        <span className="badge">Order {event.sort_order}</span>
                    </div>

                    <button
                        className="button button-danger"
                        type="button"
                        onClick={() => {
                            const confirmed = window.confirm(
                                `Hide ${event.dj_name} from the public carousel?`
                            );

                            if (confirmed) {
                                onDelete(event.id);
                            }
                        }}
                    >
                        Hide
                    </button>
                </article>
            ))}
        </div>
    );
}