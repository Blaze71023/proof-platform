"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobById } from "@/lib/shopproof";

export default function WorkOrderPage() {
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
    return <div style={{ padding: 20 }}>Work order not found</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#fff",
        color: "#000",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>AUTO TUNE PROS</h1>
        <div style={{ fontSize: 12 }}>
          Work Order / Authorization
        </div>
      </div>

      {/* CUSTOMER */}
      <Section title="Customer Information">
        <Row label="Name" value={job.customer.name} />
        <Row label="Phone" value={job.customer.phone} />
        <Row label="Email" value={job.customer.email || "-"} />
      </Section>

      {/* VEHICLE */}
      <Section title="Vehicle Information">
        <Row
          label="Vehicle"
          value={`${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}`}
        />
        <Row label="VIN" value={job.vehicle.vin} />
        <Row label="Mileage In" value={job.vehicle.mileageIn} />
        <Row label="Plate" value={job.vehicle.plate || "-"} />
        <Row label="Color" value={job.vehicle.color || "-"} />
      </Section>

      {/* VISIT */}
      <Section title="Customer Concern">
        <div style={{ marginTop: 10 }}>
          {job.visit.concern}
        </div>
      </Section>

      {/* DIAG */}
      <Section title="Diagnostics Authorization">
        <Row
          label="Diagnostics Fee"
          value={`$${job.authorization.diagnosticsFee}`}
        />

        <p style={{ fontSize: 13, marginTop: 10 }}>
          I authorize Auto Tune Pros to perform diagnostics and
          inspection on this vehicle. I understand that diagnostic
          charges apply regardless of repair.
        </p>
      </Section>

      {/* SIGNATURE */}
      <div style={{ marginTop: 50 }}>
        <div style={{ marginBottom: 30 }}>
          Signature: _____________________________
        </div>
        <div>Date: _____________________________</div>
      </div>

      {/* BUTTONS (hidden when printing) */}
      <div
        className="no-print"
        style={{
          marginTop: 40,
          display: "flex",
          gap: 10,
        }}
      >
        <button onClick={() => router.back()}>
          Back
        </button>

        <button onClick={handlePrint}>
          Print
        </button>
      </div>

      {/* PRINT STYLES */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div
        style={{
          fontWeight: "bold",
          borderBottom: "1px solid #000",
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
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