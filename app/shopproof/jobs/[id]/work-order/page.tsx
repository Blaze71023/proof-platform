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
      <main style={pageStyle}>
        <div style={screenBarStyle} className="no-print">
          <button
            type="button"
            onClick={() => router.back()}
            style={secondaryButtonStyle}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div style={pageInnerStyle}>
          <div style={statusCardStyle}>
            <div style={miniBrandStyle}>ShopPROOF Work Order</div>
            <h1 style={statusTitleStyle}>Work order not found</h1>
            <p style={statusTextStyle}>
              This job record could not be loaded. Please return to the job page
              and reopen the work order from a real ShopPROOF record.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const vehicleLine =
    [normalized.vehicle.year, normalized.vehicle.make, normalized.vehicle.model]
      .filter(Boolean)
      .join(" ") || "-";

  const printDate =
    formatDate(normalized.createdAt) || formatDate(new Date().toISOString());

  const authLabel = formatApprovalLabel(
    normalized.authorization.authorizationStatus
  );

  const signedAlready =
    normalized.authorization.authorizationStatus === "signed_in_person" ||
    normalized.authorization.authorizationStatus === "signed_remote";

  const handlePrint = () => {
    window.print();
  };

  return (
    <main style={pageStyle}>
      <div style={screenBarStyle} className="no-print">
        <button type="button" onClick={() => router.back()} style={secondaryButtonStyle}>
          <ArrowLeft size={16} />
          Back
        </button>

        <button type="button" onClick={handlePrint} style={primaryButtonStyle}>
          <Printer size={16} />
          Print
        </button>
      </div>

      <div style={pageInnerStyle}>
        <div id="print-sheet" style={sheetStyle}>
          <div style={sheetShellStyle}>
            <div style={headerStyle}>
              <div>
                <div style={miniBrandStyle}>ShopPROOF Work Order</div>
                <h1 style={pageTitleStyle}>Diagnostics Authorization / Work Order</h1>
                <p style={pageIntroStyle}>
                  This document records the customer vehicle information,
                  reported concern, diagnostics authorization, and current
                  approval record for this ShopPROOF job.
                </p>
              </div>

              <div style={headerBadgeStyle}>Customer authorization</div>
            </div>

            <div style={metaGridStyle}>
              <MetaCard label="Record Date" value={printDate} />
              <MetaCard label="Job ID" value={normalized.id || "-"} />
              <MetaCard label="Status" value={normalized.status || "-"} />
              <MetaCard label="Authorization" value={authLabel} />
            </div>

            <div style={grid2Style} className="print-grid-2">
              <SectionCard
                title="Customer Information"
                icon={<Shield size={15} />}
              >
                <DataRow label="Name" value={normalized.customer.name || "-"} />
                <DataRow label="Phone" value={normalized.customer.phone || "-"} />
                <DataRow label="Email" value={normalized.customer.email || "-"} />
                <DataRow label="Address" value={normalized.customer.address || "-"} />
              </SectionCard>

              <SectionCard
                title="Vehicle Information"
                icon={<Wrench size={15} />}
              >
                <DataRow label="Vehicle" value={vehicleLine} />
                <DataRow label="VIN" value={normalized.vehicle.vin || "-"} />
                <DataRow label="Mileage In" value={normalized.vehicle.mileageIn || "-"} />
                <DataRow label="Plate" value={normalized.vehicle.plate || "-"} />
                <DataRow label="Color" value={normalized.vehicle.color || "-"} />
              </SectionCard>
            </div>

            <SectionCard title="Customer Concern / Requested Inspection">
              <ParagraphPanel>
                {normalized.visit.concern || "No concern entered."}
              </ParagraphPanel>
            </SectionCard>

            <SectionCard title="Diagnostics Authorization">
              <div style={feeGridStyle} className="print-grid-fee">
                <div style={feeCardStyle}>
                  <div style={feeLabelStyle}>Diagnostics Fee</div>
                  <div style={feeValueStyle}>
                    {normalized.authorization.diagnosticsFee
                      ? `$${normalized.authorization.diagnosticsFee}`
                      : "$-"}
                  </div>
                </div>

                <div style={legalPanelStyle}>
                  <p style={legalTextStyle}>
                    I authorize Auto Tune Pros to perform diagnostic inspection,
                    testing, and related evaluation on the vehicle listed above.
                    I understand that diagnostic charges apply whether or not I
                    approve additional repairs after diagnosis.
                  </p>

                  <p style={{ ...legalTextStyle, marginTop: 10 }}>
                    I also understand that further teardown, test time,
                    specialty inspection, or additional labor may require
                    separate approval before repair work proceeds.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Authorization Record">
              <div style={grid2Style} className="print-grid-2">
                <div style={statusPanelStyle}>
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

                <div style={signatureMetaPanelStyle}>
                  <div style={metaLabelStyle}>Signed By</div>
                  <div style={metaValueStyle}>
                    {normalized.authorization.signatureName || "-"}
                  </div>

                  <div style={{ height: 12 }} />

                  <div style={metaLabelStyle}>Method / Timestamp</div>
                  <div style={metaValueStyle}>
                    {normalized.authorization.signatureMethod || "-"}
                    {normalized.authorization.signatureTimestamp
                      ? ` • ${formatDateTime(normalized.authorization.signatureTimestamp)}`
                      : ""}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Customer Acknowledgment">
              <div style={listPanelStyle}>
                <ul style={listStyle}>
                  <li>I am the owner or authorized agent for this vehicle.</li>
                  <li>I authorize diagnostic evaluation of the concern described above.</li>
                  <li>I understand diagnosis does not automatically include repair.</li>
                  <li>I understand additional repairs require separate authorization.</li>
                  <li>
                    I understand storage, teardown, specialty testing, or
                    additional labor may involve added charges if approved.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <div style={{ marginTop: 34 }}>
              {signedAlready ? (
                <div style={signedPanelStyle}>
                  <div style={signedHeaderStyle}>
                    <CheckCircle2 size={18} />
                    Authorization Already Recorded
                  </div>

                  <div style={grid3Style} className="print-grid-3">
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
                <div style={signatureGridStyle} className="print-grid-sign">
                  <div>
                    <div style={signatureLabelStyle}>Customer Signature</div>
                    <div style={signatureLineStyle} />
                  </div>

                  <div>
                    <div style={signatureLabelStyle}>Date</div>
                    <div style={signatureLineStyle} />
                  </div>
                </div>
              )}
            </div>

            <div style={footerStyle}>
              <div>Auto Tune Pros</div>
              <div>Digitally documented and timestamped via ShopPROOF</div>
            </div>
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
            background: #ffffff !important;
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

function SectionCard({
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
      <div style={sectionHeaderStyle}>
        {icon ? <span style={{ display: "inline-flex" }}>{icon}</span> : null}
        <div style={sectionTitleStyle}>{title}</div>
      </div>

      {children}
    </section>
  );
}

function MetaCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={metaCardStyle}>
      <div style={metaCardLabelStyle}>{label}</div>
      <div style={metaCardValueStyle}>{value}</div>
    </div>
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
    <div style={dataRowStyle}>
      <div style={dataRowLabelStyle}>{label}</div>
      <div style={dataRowValueStyle}>{value}</div>
    </div>
  );
}

function ParagraphPanel({ children }: { children: React.ReactNode }) {
  return <div style={paragraphPanelStyle}>{children}</div>;
}

function StatusLine({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div style={statusLineStyle}>
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
    <div style={signatureFieldStyle}>
      <div style={metaLabelStyle}>{label}</div>
      <div style={metaValueStyle}>{value}</div>
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

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #e8eef5 0%, #dfe7f0 42%, #d8e1eb 100%)",
  padding: "18px 12px 40px",
  fontFamily:
    'Inter, Arial, Helvetica, sans-serif',
  color: "#0f172a",
};

const screenBarStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto 14px",
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const pageInnerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
};

const sheetStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)",
  color: "#111111",
  boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  border: "1px solid rgba(71,85,105,0.12)",
  borderRadius: 24,
  overflow: "hidden",
};

const sheetShellStyle: React.CSSProperties = {
  padding: 28,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 18,
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: 22,
};

const miniBrandStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#2563eb",
};

const pageTitleStyle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: 30,
  fontWeight: 900,
  letterSpacing: "-0.03em",
  lineHeight: 1.02,
  color: "#0f172a",
};

const pageIntroStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.65,
  color: "#334155",
  maxWidth: 620,
};

const headerBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(37,99,235,0.14)",
  background: "rgba(219,234,254,0.86)",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 24,
};

const metaCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.96)",
  padding: 14,
};

const metaCardLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 8,
};

const metaCardValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
  wordBreak: "break-word",
};

const grid2Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 18,
};

const grid3Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 16,
};

const feeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "220px 1fr",
  gap: 18,
  alignItems: "start",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  borderBottom: "2px solid #0f172a",
  paddingBottom: 8,
  marginBottom: 12,
};

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 15,
  letterSpacing: "0.02em",
  color: "#0f172a",
};

const dataRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 10,
  padding: "8px 0",
  borderBottom: "1px solid rgba(71,85,105,0.10)",
  fontSize: 13,
};

const dataRowLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#0f172a",
};

const dataRowValueStyle: React.CSSProperties = {
  wordBreak: "break-word",
  color: "#334155",
};

const paragraphPanelStyle: React.CSSProperties = {
  minHeight: 84,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.98)",
  padding: 14,
  fontSize: 13,
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  borderRadius: 14,
  color: "#334155",
};

const feeCardStyle: React.CSSProperties = {
  border: "1px solid rgba(71,85,105,0.12)",
  borderRadius: 16,
  background: "linear-gradient(180deg, rgba(239,246,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  padding: 14,
  minHeight: 88,
};

const feeLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
  fontWeight: 800,
  marginBottom: 8,
};

const feeValueStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  lineHeight: 1,
  color: "#0f172a",
};

const legalPanelStyle: React.CSSProperties = {
  border: "1px solid rgba(71,85,105,0.10)",
  borderRadius: 16,
  background: "rgba(248,250,252,0.98)",
  padding: 14,
};

const legalTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.7,
  color: "#334155",
};

const statusPanelStyle: React.CSSProperties = {
  border: "1px solid rgba(71,85,105,0.10)",
  borderRadius: 16,
  background: "rgba(248,250,252,0.98)",
  padding: 14,
};

const signatureMetaPanelStyle: React.CSSProperties = {
  border: "1px solid rgba(71,85,105,0.10)",
  borderRadius: 16,
  background: "rgba(248,250,252,0.98)",
  padding: 14,
  minHeight: 96,
};

const listPanelStyle: React.CSSProperties = {
  border: "1px solid rgba(71,85,105,0.10)",
  borderRadius: 16,
  background: "rgba(248,250,252,0.98)",
  padding: 14,
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  fontSize: 13,
  lineHeight: 1.7,
  color: "#334155",
};

const statusLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  fontSize: 13,
  color: "#334155",
};

const signedPanelStyle: React.CSSProperties = {
  border: "1px solid rgba(5,150,105,0.14)",
  borderRadius: 18,
  background: "linear-gradient(180deg, rgba(236,253,245,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  padding: 18,
};

const signedHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
  fontWeight: 800,
  fontSize: 16,
  color: "#0f172a",
};

const signatureFieldStyle: React.CSSProperties = {
  border: "1px solid rgba(71,85,105,0.10)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.72)",
  padding: 12,
};

const signatureGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 220px",
  gap: 18,
  alignItems: "end",
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
  fontWeight: 800,
};

const metaValueStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginTop: 4,
  wordBreak: "break-word",
  color: "#0f172a",
};

const signatureLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 22,
  color: "#0f172a",
};

const signatureLineStyle: React.CSSProperties = {
  borderBottom: "1px solid #0f172a",
  height: 32,
};

const footerStyle: React.CSSProperties = {
  marginTop: 30,
  paddingTop: 16,
  borderTop: "1px solid rgba(71,85,105,0.10)",
  fontSize: 12,
  color: "#64748b",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const statusCardStyle: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  borderRadius: 24,
  border: "1px solid rgba(71,85,105,0.12)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  padding: 28,
};

const statusTitleStyle: React.CSSProperties = {
  margin: "8px 0 12px",
  fontSize: 30,
  fontWeight: 900,
  letterSpacing: "-0.03em",
  color: "#0f172a",
};

const statusTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: "#334155",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "1px solid #111111",
  background: "#111111",
  color: "#ffffff",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const secondaryButtonStyle: React.CSSProperties = {
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