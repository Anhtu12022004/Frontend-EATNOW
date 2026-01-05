import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner";

// Option 1: Use App.tsx directly (current implementation with demo role switcher)
// This is good for demo/testing purposes
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  </>
);

// Option 2: Use Router with AuthContext (for production)
// Uncomment below and comment above to use router-based navigation
/*
import { AuthProvider } from "./contexts/AuthContext";
import { AppRouter } from "./router";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppRouter />
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  </AuthProvider>
);
*/
  