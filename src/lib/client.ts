"use client";

// Anonymous client identity used for favorites without full auth.
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sd_client_id");
  if (!id) {
    id = "c_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("sd_client_id", id);
  }
  return id;
}
