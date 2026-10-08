import Navbar from "../components/Navbar";

export default function AppLayout({
  children,
  navMode = "home",
  className = "",
}) {
  return (
    <div className={`app-shell ${className}`}>
      <Navbar mode={navMode} />
      <main>{children}</main>
    </div>
  );
}
