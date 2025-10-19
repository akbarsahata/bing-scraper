import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { httpBatchLink } from "@trpc/client";
import { StrictMode, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";

import reportWebVitals from "./reportWebVitals";
import { createRouter } from "./router";
import { trpcReact } from "./utils/trpc-types";

const router = createRouter();

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        httpBatchLink({
          url: "/trpc",
          headers: () => {
            const token = localStorage.getItem("auth_token");
            return token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {};
          },
        }),
      ],
    })
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}

// Render the app
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
