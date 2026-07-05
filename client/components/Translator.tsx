"use client";

import { useEffect } from "react";

export default function Translator() {
  useEffect(() => {
    // Prevent multiple script insertions
    if (document.getElementById("google-translate-script")) return;

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    // Define initialization only once
    (window as any).googleTranslateElementInit = () => {
      if (!document.getElementById("google_translate_element")) {
        const container = document.createElement("div");
        container.id = "google_translate_element";
        document.body.prepend(container); // place it at top
      }

      if (!(window as any).google?.translate?.TranslateElement) return;

      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "hi,ta,bn,te,ml,fr,de,es",
          layout:
            (window as any).google.translate.TranslateElement.InlineLayout
              .SIMPLE,
        },
        "google_translate_element"
      );
    };
  }, []);

  // Render placeholder where the dropdown will appear
  return (
    <div
      id="google_translate_element"
      className="flex justify-center mt-4 mb-4"
    ></div>
  );
}
