import { EventsFixPage } from "./pages/EventsFixPage";
import { EventsPage } from "./pages/EventsPage";
import { RouteSwitch } from "./components/RouteSwitch";

export default function App() {
  const isBeforeFix = window.location.pathname !== "/events-fix";

  return (
    <main className="events-page">
      <RouteSwitch isBeforeFix={isBeforeFix} />
      {isBeforeFix ? <EventsPage /> : <EventsFixPage />}
    </main>
  );
}
