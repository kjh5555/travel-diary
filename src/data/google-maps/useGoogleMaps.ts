import { useEffect, useState } from "react";

export const useGoogleMaps = (apiKey: string) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    useEffect(() => {
        if (!apiKey) {
            setLoadError(new Error("Google Maps API Key is missing"));
            return;
        }

        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        const scriptId = "google-maps-script";
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            // Check if already loaded or wait for load event
            if (window.google?.maps) {
                setIsLoaded(true);
            } else {
                existingScript.addEventListener("load", () => setIsLoaded(true));
                existingScript.addEventListener("error", () => setLoadError(new Error("Failed to load Google Maps script")));
            }
            return;
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => setIsLoaded(true);
        script.onerror = () => setLoadError(new Error("Failed to load Google Maps script"));

        document.head.appendChild(script);

        return () => {
            // Clean up if needed, though usually we want to keep the script
        };
    }, [apiKey]);

    return { isLoaded, loadError };
};
