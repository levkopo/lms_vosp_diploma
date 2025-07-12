import {render} from "preact";
import {Fullscreen, ZnUIProvider} from "@znui/react";
import {theme} from "./theme.ts";
import {RouterProvider} from "react-router";
import {routes} from "./routes.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();
render(<QueryClientProvider client={queryClient}>
    <ZnUIProvider initialScheme='light' theme={theme}>
        <Fullscreen>
            <RouterProvider router={routes}/>
        </Fullscreen>
    </ZnUIProvider>
</QueryClientProvider>, document.getElementById("root")!);
