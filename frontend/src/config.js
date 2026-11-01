// Where the Recall backend (FastAPI) runs. Set VITE_API_URL in frontend/.env when you deploy.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
