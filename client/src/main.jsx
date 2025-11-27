import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Mainlayout from "./layout/MainLayout.jsx";
import History from "./routes/History.jsx";
import DataLog from "./routes/DataLog.jsx";
import Settings from "./routes/Settings.jsx";
import Alert from "./routes/Alert.jsx";
import About from "./routes/About.jsx";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import Dashboard from "./routes/Dashboard.jsx";

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    element: <Mainlayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/history",
        element: <History />,
      },
      {
        path: "/data-log",
        element: <DataLog />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/alert",
        element: <Alert />,
      },
      {
        path: "/about",
        element: <About />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);