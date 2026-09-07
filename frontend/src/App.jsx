import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
