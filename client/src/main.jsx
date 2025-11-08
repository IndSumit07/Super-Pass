import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { EventProvider } from "./contexts/EventContext.jsx";
import { PassProvider } from "./contexts/PassContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <EventProvider>
          <PassProvider>
            <App />
          </PassProvider>
        </EventProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);
