import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem 2rem",
      background: "#222",
      color: "#fff"
    }}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold", fontSize: 22 }}>
        VanSport
      </Link>
      <div>
        {!user ? (
          <Link to="/login" style={{ color: "#fff", textDecoration: "none", fontSize: 16 }}>
            Login
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>
              {user.nombre} {user.apellido}
            </span>
            <button
              onClick={logout}
              style={{
                background: "#fff",
                color: "#222",
                border: "none",
                borderRadius: 4,
                padding: "0.3rem 0.8rem",
                cursor: "pointer"
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;