type RouteSwitchProps = {
  isBeforeFix: boolean;
};

export function RouteSwitch({ isBeforeFix }: RouteSwitchProps) {
  return (
    <nav className="route-switch" aria-label="Route switcher">
      <a className={`route-button ${isBeforeFix ? "route-button-active" : ""}`} href="/events">
        /events
      </a>
      <a className={`route-button ${!isBeforeFix ? "route-button-active" : ""}`} href="/events-fix">
        /events-fix
      </a>
    </nav>
  );
}
