import React from "react";

export default function Loader({
  label = "Chargement…",
  fullScreen = false,
  size = 42,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={fullScreen ? "loader-screen" : "loader-inline"}
    >
      <div
        className="spinner"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label ? <div className="loader-label">{label}</div> : null}
    </div>
  );
}
