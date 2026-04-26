"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobById, updateJob, generateToken } from "@/lib/shopproof";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const found = getJobById(id);
    setJob(found);
  }, [id]);

  if (!job) {
    return (
      <div style={{ padding: 20, color: "#fff" }}>
        Job not found
      </div>
    );
  }

  // -----------------------------
  // ACTIONS
  // -----------------------------

  const handlePrint = () => {
    router.push(`/shopproof/jobs/${job.id}/work-order`);
  };

  const handleSendAuthorization = () => {
    const token = generateToken();

    const updated = {
      ...job,
      authorization: {
        ...job.authorization,
        token,
        authorizationStatus: "pending",
      },
    };

    updateJob(updated);
    setJob(updated);

    const link = `${window.location.origin}/shopproof/sign/${token}`;

    navigator.clipboard.writeText(link);

    alert("Authorization link copied:\n\n" + link);
  };

  const markSignedInPerson = () => {
    const updated = {
      ...job,
      authorization: {
        ...job.authorization,
        authorizationStatus: "signed_in_person",
        signatureName: job.customer.name,
        signatureTimestamp: new Date().toISOString(),
        signatureMethod: "print",
      },
    };

    updateJob(updated);
    setJob(updated);
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#02060B",
        color: "#fff",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>
          {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
        </h1>
        <div style={{ opacity: 0.7 }}>
          VIN: {job.vehicle.vin}
        </div>
      </div>

      {/* STATUS */}
      <div style={{ marginBottom: 20 }}>
        <strong>Status:</strong> {job.status}
      </div>

      {/* CUSTOMER */}
      <Section title="Customer">
        <Row label="Name" value={job.customer.name} />
        <Row label="Phone" value={job.customer.phone} />
        <Row label="Email" value={job.customer.email || "-"} />
      </Section>

      {/* VEHICLE */}
      <Section title="Vehicle">
        <Row label="Mileage In" value={job.vehicle.mileageIn} />
        <Row label="Plate" value={job.vehicle.plate || "-"} />
        <Row label="Color" value={job.vehicle.color || "-"} />
      </Section>

      {/* VISIT */}
      <Section title="Visit">
        <div>{job.visit.concern}</div>
      </Section>

      {/* AUTH */}
      <Section title="Authorization">
        <Row
          label="Diagnostics Fee"
          value={`$${job.authorization.diagnosticsFee}`}
        />

        <Row
          label="Status"
          value={job.authorization.authorizationStatus}
        />

        {job.authorization.signatureName && (
          <>
            <Row
              label="Signed By"
              value={job.authorization.signatureName}
            />
            <Row
              label="Method"
              value={job.authorization.signatureMethod}
            />
          </>
        )}
      </Section>

      {/* ACTIONS */}
      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Button onClick={handlePrint}>
          🖨 Print Work Order
        </Button>

        <Button onClick={handleSendAuthorization}>
          📲 Send Authorization
        </Button>

        <Button onClick={markSignedInPerson}>
          ✍️ Mark Signed In Person
        </Button>
      </div>
    </div>
  );
}

// -----------------------------
// UI HELPERS
// -----------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: 16,
        borderRadius: 10,
        background: "#0B1420",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function Button({
  children,
  onClick,
}: {
  children: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: "none",
        background: "#3B82F6",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}