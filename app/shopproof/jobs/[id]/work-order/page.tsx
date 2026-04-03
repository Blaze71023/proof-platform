"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Printer,
  Shield,
  Wrench,
} from "lucide-react";
import { getJobById } from "@/lib/shopproof";

type ApprovalStatus =
  | "pending"
  | "signed_in_person"
  | "signed_remote";

export default function WorkOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const found = getJobById(id);
    setJob(found || null);
  }, [id]);

  const normalized = useMemo(() => {
    if (!job) return null;

    const customer = job.customer || {};
    const vehicle = job.vehicle || {};
    const visit = job.visit || {};
    const authorization = job.authorization || {};

    const approvalStatus = (authorization.authorizationStatus ||
      "pending") as ApprovalStatus;

    return {
      id: job.id || "",
      createdAt: job.createdAt || "",
      status: job.status || "New",
      customer: {
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      },
      vehicle: {
        year: vehicle.year || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        vin: vehicle.vin || "",
        mileageIn: vehicle.mileageIn || "",
        plate: vehicle.plate || "",
        color: vehicle.color || "",
      },
      visit: {
        concern: visit.concern || "",
      },
      authorization: {
        diagnosticsFee: authorization.diagnosticsFee || "",
        authorizationStatus: approvalStatus,
        signatureName: authorization.signatureName || "",
        signatureMethod: authorization.signatureMethod || "",
        signatureTimestamp: authorization.signatureTimestamp || "",
      },
    };
  }, [job]);

  if (!normalized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          color: "#111111",
          padding: 24,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            border: "1px solid #d7d7d7",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Work order not found
          </div>
          <div style={{ color: "#555", marginBottom: 18 }}>
            This job record could not be loaded.
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            style={screenButton}
            className="no-print"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </main>
    );
  }

  const vehicleLine =
    [normalized.vehicle.year, normalized.vehicle.make, normalized.vehicle.model]
      .filter(Boolean)
      .join(" ") || "-";

  const printDate = formatDate(normalized.createdAt) || formatDate(new Date().toISOString());
  const authLabel = formatApprovalLabel(normalized.authorization.authorizationStatus);
  const signedAlready =
    normalized.authorization.authorizationStatus === "signed_in_person" ||
    normalized.authorization.authorizationStatus === "signed_remote";

  const handlePrint = () => {
    window.print();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef1f4",
        padding: "18px 12px 40px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111111",
      }}
    >
      <div
        className="no-print"
        style={{
          maxWidth: 980,
          margin: "0 auto 14px",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button type="button" onClick={() => router.back()} style={screenButton}>
          <ArrowLeft size={16} />
          Back
        </button>

        <button type="button" onClick={handlePrint} style={primaryScreenButton}>
          <Printer size={16} />
          Print
        </button>
      </div>

      <div
        id="print-sheet"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background: "#ffffff",
          color: "#111111",
          boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
          border: "1px solid #d8dde3",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "28px 28px 18px",
            borderBottom: "2px solid #111111",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                AUTO TUNE PROS
              </div>

              <div
                style={{
                  fontSize: 12,
                  marginTop: 8,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#444",
                  fontWeight: 700,
                }}
              >
                Work Order / Diagnostics Authorization
              </div>
            </div>

            <div
              style={{
                minWidth: 260,
                fontSize: 12,
                lineHeight: 1.6,
                textAlign: "right",
              }}
            >
              <div>
                <strong>Record Date:</strong> {printDate}
              </div>
              <div>
                <strong>Job ID:</strong> {normalized.id || "-"}
              </div>
              <div>
                <strong>Status:</strong> {normalized.status || "-"}
              </div>
              <div>
                <strong>Authorization:</strong> {authLabel}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: 28 }}>
          {/* CUSTOMER + VEHICLE */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              marginBottom: 22,
            }}
            className="print-grid-2"
          >
            <Section title="Customer Information" icon={<Shield size={15} />}>
              <DataRow label="Name" value={normalized.customer.name || "-"} />
              <DataRow label="Phone" value={normalized.customer.phone || "-"} />
              <DataRow label="Email" value={normalized.customer.email || "-"} />
              <DataRow label="Address" value={normalized.customer.address || "-"} />
            </Section>

            <Section title="Vehicle Information" icon={<Wrench size={15} />}>
              <DataRow label="Vehicle" value={vehicleLine} />
              <DataRow label="VIN" value={normalized.vehicle.vin || "-"} />
              <DataRow label="Mileage In" value={normalized.vehicle.mileageIn || "-"} />
              <DataRow label="Plate" value={normalized.vehicle.plate || "-"} />
              <DataRow label="Color" value={normalized.vehicle.color || "-"} />
            </Section>
          </div>

          {/* CONCERN */}
          <Section title="Customer Concern / Requested Inspection">
            <ParagraphBox>
              {normalized.visit.concern || "No concern entered."}
            </ParagraphBox>
          </Section>

          {/* DIAGNOSTICS AUTH */}
          <Section title="Diagnostics Authorization">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: 18,
                alignItems: "start",
              }}
              className="print-grid-fee"
            >
              <div
                style={{
                  border: "1px solid #111111",
                  padding: 14,
                  minHeight: 78,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#444",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Diagnostics Fee
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {normalized.authorization.diagnosticsFee
                    ? `$${normalized.authorization.diagnosticsFee}`
                    : "$-"}
                </div>
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>
                  I authorize Auto Tune Pros to perform diagnostic inspection,
                  testing, and related evaluation on the vehicle listed above.
                  I understand that diagnostic charges apply whether or not I
                  approve additional repairs after diagnosis.
                </p>

                <p style={{ margin: "10px 0 0" }}>
                  I also understand that further teardown, test time, specialty
                  inspection, or additional labor may require separate approval
                  before repair work proceeds.
                </p>
              </div>
            </div>
          </Section>

          {/* AUTH STATUS */}
          <Section title="Authorization Record">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
              className="print-grid-2"
            >
              <div>
                <StatusLine
                  checked={normalized.authorization.authorizationStatus === "pending"}
                  label="Pending approval"
                />
                <StatusLine
                  checked={normalized.authorization.authorizationStatus === "signed_in_person"}
                  label="Signed in person"
                />
                <StatusLine
                  checked={normalized.authorization.authorizationStatus === "signed_remote"}
                  label="Signed remotely"
                />
              </div>

              <div
                style={{
                  border: "1px solid #cfcfcf",
                  padding: 14,
                  minHeight: 96,
                }}
              >
                <div style={metaLabel}>Signed By</div>
                <div style={metaValue}>
                  {normalized.authorization.signatureName || "-"}
                </div>

                <div style={{ height: 10 }} />

                <div style={metaLabel}>Method / Timestamp</div>
                <div style={metaValue}>
                  {normalized.authorization.signatureMethod || "-"}
                  {normalized.authorization.signatureTimestamp
                    ? ` • ${formatDateTime(normalized.authorization.signatureTimestamp)}`
                    : ""}
                </div>
              </div>
            </div>
          </Section>

          {/* TERMS */}
          <Section title="Customer Acknowledgment">
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <li>I am the owner or authorized agent for this vehicle.</li>
              <li>I authorize diagnostic evaluation of the concern described above.</li>
              <li>I understand diagnosis does not automatically include repair.</li>
              <li>I understand additional repairs require separate authorization.</li>
              <li>
                I understand storage, teardown, specialty testing, or additional
                labor may involve added charges if approved.
              </li>
            </ul>
          </Section>

          {/* SIGNATURE */}
          <div style={{ marginTop: 34 }}>
            {signedAlready ? (
              <div
                style={{
                  border: "2px solid #111111",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  <CheckCircle2 size={18} />
                  Authorization Already Recorded
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 16,
                  }}
                  className="print-grid-3"
                >
                  <SignatureField
                    label="Signed By"
                    value={normalized.authorization.signatureName || "-"}
                  />
                  <SignatureField
                    label="Method"
                    value={normalized.authorization.signatureMethod || "-"}
                  />
                  <SignatureField
                    label="Date / Time"
                    value={
                      normalized.authorization.signatureTimestamp
                        ? formatDateTime(normalized.authorization.signatureTimestamp)
                        : "-"
                    }
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 220px",
                  gap: 18,
                  alignItems: "end",
                }}
                className="print-grid-sign"
              >
                <div>
                  <div style={signatureLabel}>Customer Signature</div>
                  <div style={signatureLine} />
                </div>

                <div>
                  <div style={signatureLabel}>Date</div>
                  <div style={signatureLine} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          main {
            background: #ffffff !important;
            padding: 0 !important;
          }

          #print-sheet {
            max-width: none !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }

          @page {
            size: auto;
            margin: 0.5in;
          }
        }

        @media (max-width: 760px) {
          .print-grid-2,
          .print-grid-3,
          .print-grid-fee,
          .print-grid-sign {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "2px solid #111111",
          paddingBottom: 6,
          marginBottom: 12,
        }}
      >
        {icon ? <span style={{ display: "inline-flex" }}>{icon}</span> : null}
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </div>
      </div>

      {children}
    </section>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid #ececec",
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div style={{ wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function ParagraphBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: 84,
        border: "1px solid #cfcfcf",
        padding: 14,
        fontSize: 13,
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
}

function StatusLine({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
        fontSize: 13,
      }}
    >
      {checked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      <span>{label}</span>
    </div>
  );
}

function SignatureField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div style={metaLabel}>{label}</div>
      <div style={metaValue}>{value}</div>
    </div>
  );
}

function formatApprovalLabel(status: ApprovalStatus) {
  switch (status) {
    case "pending":
      return "Pending Approval";
    case "signed_in_person":
      return "Signed In Person";
    case "signed_remote":
      return "Signed Remote";
    default:
      return "Pending Approval";
  }
}

function formatDate(value: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const screenButton: React.CSSProperties = {
  border: "1px solid #cfd6de",
  background: "#ffffff",
  color: "#111111",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const primaryScreenButton: React.CSSProperties = {
  ...screenButton,
  background: "#111111",
  color: "#ffffff",
  border: "1px solid #111111",
};

const metaLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#555",
  fontWeight: 700,
};

const metaValue: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginTop: 4,
  wordBreak: "break-word",
};

const signatureLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 22,
};

const signatureLine: React.CSSProperties = {
  borderBottom: "1px solid #111111",
  height: 32,
};