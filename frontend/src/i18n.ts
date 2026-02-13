export type Lang = "fr" | "en";

export function getLang(): Lang {
  return (localStorage.getItem("lang") as Lang) || "fr";
}

export function toggleLang(): Lang {
  const next: Lang = getLang() === "fr" ? "en" : "fr";
  localStorage.setItem("lang", next);
  return next;
}
