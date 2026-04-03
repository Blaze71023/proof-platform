"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJobs, updateJob } from "@/lib/shopproof";

export default function SignPage() {
  const params = useParams();
  const token = params?.token as string;

  const [job, setJob] = useState<any>(null);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;

    const jobs = getJobs();
    const found = jobs.find(
      (j) => j.authorization?.token === token
    );

    setJob(found || null);
  }, [token]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter your name to sign.");
      return;
    }

    const updated = {
      ...job,
      authorization: {
        ...job.authorization,
        authorizationStatus: "signed_remote",
        signatureName: name,
        signatureTimestamp: new Date().toISOString(),
        signatureMethod: "digital",
      },
    };

    updateJob(updated);
    setSubmitted(true);
  };

  if (!job) {
    return (
      <div style={{ padding: 20 }}>
        Invalid or expired link
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Authorization Submitted</h2>
          <p>You’re all set. The shop has your approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#000",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>
          Auto Tune Pros
        </h2>
        <div style={{ fontSize: 12 }}>
          Authorization Request
        </div>
      </div>

      {/* VEHICLE */}
      <div style={{ marginBottom: 20 }}>
        <strong>
          {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
        </strong>
        <div style={{ fontSize: 12 }}>
          VIN: {job.vehicle.vin}
        </div>
      </div>

      {/* CONCERN */}
      <div style={{ marginBottom: 20 }}>
        <strong>Concern:</strong>
        <div>{job.visit.concern}</div>
      </div>

      {/* DIAG */}
      <div style={{ marginBottom: 20 }}>
        <strong>Diagnostics Fee:</strong>{" "}
        ${job.authorization.diagnosticsFee}
      </div>

      {/* AUTH TEXT */}
      <div style={{ fontSize: 13, marginBottom: 30 }}>
        I authorize this shop to perform diagnostic inspection on my vehicle.
        I understand charges apply even if no repair is completed.
      </div>

      {/* SIGN */}
      <div style={{ marginBottom: 20 }}>
        <label>Your Name (Signature)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 6,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: 14,
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        Sign & Authorize
      </button>
    </div>
  );
}