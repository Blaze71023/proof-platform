"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, LoaderCircle, Shield, User } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

const THEME = {
  page: "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell: "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  panel: "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card: "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  topbar: "linear-gradient(180deg, rgba(234,240,247,0.92) 0%, rgba(223,232,242,0.88) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  textDim: "#8099b0",
  line: "rgba(28,47,67,0.11)",
  shellBorder: "1px solid rgba(69,94,118,0.20)",
  panelBorder: "1px solid rgba(84,108,131,0.17)",
  cardBorder: "1px solid rgba(92,116,140,0.14)",
  shellShadow: "0 30px 80px rgba(27,39,54,0.16)",
  panelShadow: "0 16px 34px rgba(28,42,59,0.09)",
  cardShadow: "0 12px 24px rgba(27,40,56,0.06)",
  blue: "#2563eb",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.10)",
  blueLine: "rgba(37,99,235,0.28)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.10)",
  emeraldLine: "rgba(5,150,105,0.22)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.10)",
  redLine: "rgba(220,38,38,0.22)",
  buttonBlue: "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
};

type FormData = {
  // Customer
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  // Vehicle
  vin: string;
  year: string;
  make: string;
  model: string;
  plate: string;
  color: string;
  mileageIn: string;
  // Visit
  concern: string;
  requestedWork: string;
  notes: string;
  diagnosticFee: string;
  writtenBy: string;
};

const EMPTY_FORM: FormData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  vin: "",
  year: "",
  make: "",
  model: "",
  plate: "",
  color: "",
  mileageIn: "",
  concern: "",
  requestedWork: "",
  notes: "",
  diagnosticFee: "",
  writtenBy: "",
};

export default function NewIntakePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [width, setWidth] = useState(1440);
  const vinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 820;

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Get or create shop for this user
      const { data: existingShop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (existingShop) {
        setShopId(existingShop.id);
      } else {
        // Auto-create a shop for first-time users
        const { data: newShop } = await supabase
          .from("shops")
          .insert({ owner_id: user.id, name: "My Shop" })
          .select("id")
          .maybeSingle();
        if (newShop) setShopId(newShop.id);
      }
    }
    checkAuth();
  }, []);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!form.vin.trim() && !form.make.trim()) {
      setError("Vehicle VIN or Make is required to identify the vehicle.");
      return;
    }
    if (!form.concern.trim()) {
      setError("Customer concern is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Fallback: save to localStorage and navigate
      saveLocally();
      return;
    }

    if (!userId || !shopId) {
      setError("Authentication required. Please sign in and try again.");
      setSubmitting(false);
      return;
    }

    try {
      // 1. Create customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          shop_id: shopId,
          name: form.customerName.trim(),
          phone: form.customerPhone.trim(),
          email: form.customerEmail.trim(),
        })
        .select("id")
        .maybeSingle();

      if (customerError) throw customerError;

      // 2. Create vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          shop_id: shopId,
          customer_id: customer?.id ?? null,
          vin: form.vin.trim(),
          year: form.year.trim(),
          make: form.make.trim(),
          model: form.model.trim(),
          plate: form.plate.trim(),
          color: form.color.trim(),
          mileage_in: form.mileageIn.trim(),
        })
        .select("id")
        .maybeSingle();

      if (vehicleError) throw vehicleError;

      // 3. Create job
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          shop_id: shopId,
          user_id: userId,
          customer_id: customer?.id ?? null,
          vehicle_id: vehicle?.id ?? null,
          status: "New Intake",
          concern: form.concern.trim(),
          requested_work: form.requestedWork.trim(),
          notes: form.notes.trim(),
          diagnostic_fee: form.diagnosticFee.trim(),
          written_by: form.writtenBy.trim(),
          approval_state: "not_requested",
        })
        .select("id")
        .maybeSingle();

      if (jobError) throw jobError;

      router.push(`/shopproof/jobs/${job?.id}`);
    } catch (err: any) {
      console.warn("Supabase save failed, using local fallback:", err);
      saveLocally();
    }
  }

  function saveLocally() {
    const now = new Date().toISOString();
    const id = Math.random().toString(36).substring(2, 10);
    const job = {
      id,
      status: "New Intake",
      approval_state: "not_requested",
      created_at: now,
      updated_at: now,
      user_id: userId,
      customer_name: form.customerName.trim(),
      customer_phone: form.customerPhone.trim(),
      customer_email: form.customerEmail.trim(),
      vin: form.vin.trim(),
      vehicle_year: form.year.trim(),
      vehicle_make: form.make.trim(),
      vehicle_model: form.model.trim(),
      vehicle_plate: form.plate.trim(),
      vehicle_color: form.color.trim(),
      mileage_in: form.mileageIn.trim(),
      concern: form.concern.trim(),
      requested_work: form.requestedWork.trim(),
      notes: form.notes.trim(),
      diagnostic_fee: form.diagnosticFee.trim(),
      written_by: form.writtenBy.trim(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("shopproof_jobs") || "[]");
      existing.unshift(job);
      localStorage.setItem("shopproof_jobs", JSON.stringify(existing));
    } catch {
      // ignore
    }
    router.push(`/shopproof/jobs/${id}`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: THEME.page,
        color: THEME.text,
        padding: isMobile ? 12 : 18,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: THEME.shell,
          border: THEME.shellBorder,
          borderRadius: 30,
          boxShadow: THEME.shellShadow,
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: THEME.topbar,
            borderBottom: `1px solid ${THEME.line}`,
            padding: isMobile ? "14px 14px" : "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/shopproof/dashboard")}
            style={backButtonStyle}
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={eyebrowStyle}>ShopPROOF</div>
            <h1 style={titleStyle}>New Vehicle Intake</h1>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: `1px solid ${THEME.blueLine}`,
              background: THEME.blueSoft,
              color: THEME.blueStrong,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            <Shield size={14} />
            Evidence Record
          </div>
        </header>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: isMobile ? "14px 10px" : "18px",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
              gap: 16,
              alignItems: "start",
            }}
          >
            {/* Main column */}
            <div style={{ display: "grid", gap: 14 }}>
              {/* Customer Section */}
              <Panel
                icon={<User size={16} />}
                title="Customer Information"
                subtitle="Who is bringing this vehicle in?"
                accent="blue"
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <InputField
                    label="Full Name *"
                    value={form.customerName}
                    onChange={(v) => set("customerName", v)}
                    placeholder="Customer full name"
                    required
                  />
                  <InputField
                    label="Phone Number"
                    value={form.customerPhone}
                    onChange={(v) => set("customerPhone", v)}
                    placeholder="(555) 555-5555"
                    type="tel"
                  />
                  <div style={{ gridColumn: isMobile ? undefined : "1 / -1" }}>
                    <InputField
                      label="Email Address"
                      value={form.customerEmail}
                      onChange={(v) => set("customerEmail", v)}
                      placeholder="customer@email.com"
                      type="email"
                    />
                  </div>
                </div>
              </Panel>

              {/* Vehicle Section */}
              <Panel
                icon={<Car size={16} />}
                title="Vehicle Details"
                subtitle="Identity anchor — this record is permanently tied to this vehicle."
                accent="blue"
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ gridColumn: isMobile ? undefined : "1 / -1" }}>
                    <InputField
                      label="VIN"
                      value={form.vin}
                      onChange={(v) => set("vin", v.toUpperCase())}
                      placeholder="17-character VIN"
                      mono
                      inputRef={vinRef}
                    />
                  </div>
                  <InputField
                    label="Year"
                    value={form.year}
                    onChange={(v) => set("year", v)}
                    placeholder="2022"
                  />
                  <InputField
                    label="Make *"
                    value={form.make}
                    onChange={(v) => set("make", v)}
                    placeholder="Toyota"
                  />
                  <InputField
                    label="Model"
                    value={form.model}
                    onChange={(v) => set("model", v)}
                    placeholder="Camry"
                  />
                  <InputField
                    label="Color"
                    value={form.color}
                    onChange={(v) => set("color", v)}
                    placeholder="Silver"
                  />
                  <InputField
                    label="License Plate"
                    value={form.plate}
                    onChange={(v) => set("plate", v.toUpperCase())}
                    placeholder="ABC-1234"
                  />
                  <InputField
                    label="Mileage In"
                    value={form.mileageIn}
                    onChange={(v) => set("mileageIn", v)}
                    placeholder="87,432"
                  />
                </div>
              </Panel>

              {/* Visit / Concern */}
              <Panel
                icon={<Shield size={16} />}
                title="Visit Record"
                subtitle="The customer concern and intake context become the permanent record basis."
                accent="blue"
              >
                <div style={{ display: "grid", gap: 12 }}>
                  <TextareaField
                    label="Customer Concern *"
                    value={form.concern}
                    onChange={(v) => set("concern", v)}
                    placeholder="What does the customer say is wrong? What did they notice?"
                    rows={3}
                    required
                  />
                  <TextareaField
                    label="Requested Work"
                    value={form.requestedWork}
                    onChange={(v) => set("requestedWork", v)}
                    placeholder="What specific work is the customer requesting, if any?"
                    rows={2}
                  />
                  <TextareaField
                    label="Intake Notes"
                    value={form.notes}
                    onChange={(v) => set("notes", v)}
                    placeholder="Internal shop notes captured at intake..."
                    rows={3}
                  />
                </div>
              </Panel>
            </div>

            {/* Sidebar */}
            <aside style={{ display: "grid", gap: 14, position: isMobile ? undefined : "sticky", top: 18 }}>
              <Panel
                title="Attribution"
                subtitle="Diagnostic fee authorization and intake attribution."
                accent="blue"
              >
                <div style={{ display: "grid", gap: 12 }}>
                  <InputField
                    label="Diagnostic Fee"
                    value={form.diagnosticFee}
                    onChange={(v) => set("diagnosticFee", v)}
                    placeholder="0.00"
                    type="text"
                  />
                  <InputField
                    label="Written By"
                    value={form.writtenBy}
                    onChange={(v) => set("writtenBy", v)}
                    placeholder="Service writer name"
                  />
                </div>
              </Panel>

              <Panel
                title="Create Intake Record"
                subtitle="Review the form and create the job record. All fields marked * are required."
                accent="blue"
              >
                <div style={{ display: "grid", gap: 10 }}>
                  {error ? (
                    <div style={errorBoxStyle}>{error}</div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      ...submitButtonStyle,
                      opacity: submitting ? 0.72 : 1,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? (
                      <><LoaderCircle size={16} className="spin" /> Creating Record...</>
                    ) : (
                      "Create Intake Record →"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/shopproof/dashboard")}
                    style={cancelButtonStyle}
                  >
                    Cancel
                  </button>

                  <p style={helpTextStyle}>
                    This creates a permanent intake record. Vehicle identity and customer concern
                    are locked at intake and form the chain-of-custody anchor.
                  </p>
                </div>
              </Panel>
            </aside>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder, textarea::placeholder {
          color: ${THEME.textDim};
          font-weight: 600;
        }
        input, textarea {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>
    </main>
  );
}

function Panel({
  icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  accent?: "blue" | "emerald";
  children: React.ReactNode;
}) {
  const accentLine = accent === "emerald" ? THEME.emeraldLine : THEME.blueLine;
  return (
    <section
      style={{
        borderRadius: 24,
        border: THEME.panelBorder,
        background: THEME.panel,
        boxShadow: THEME.panelShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accentLine,
        }}
      />
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${THEME.line}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {icon ? (
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: THEME.blue,
              background: THEME.blueSoft,
              border: `1px solid ${THEME.blueLine}`,
            }}
          >
            {icon}
          </span>
        ) : null}
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 950,
              letterSpacing: "-0.03em",
              color: THEME.text,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: THEME.textMuted,
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
  required,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        ref={inputRef as any}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          ...inputFieldStyle,
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : "Inter, ui-sans-serif, system-ui, sans-serif",
          letterSpacing: mono ? "0.06em" : undefined,
        }}
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        style={textareaFieldStyle}
      />
    </label>
  );
}

const fieldLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: THEME.textDim,
};

const inputFieldStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 12,
  border: "1px solid rgba(84,108,131,0.22)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,249,253,0.98) 100%)",
  color: THEME.text,
  fontSize: 14,
  fontWeight: 700,
  padding: "0 13px",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
  outline: "none",
};

const textareaFieldStyle: CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(84,108,131,0.22)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,249,253,0.98) 100%)",
  color: THEME.text,
  fontSize: 14,
  fontWeight: 700,
  padding: "11px 13px",
  lineHeight: 1.55,
  resize: "vertical",
  boxSizing: "border-box",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const backButtonStyle: CSSProperties = {
  height: 40,
  borderRadius: 12,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.78)",
  color: THEME.text,
  padding: "0 14px",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  boxShadow: THEME.cardShadow,
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: THEME.blueStrong,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  margin: "5px 0 0",
  fontSize: 26,
  lineHeight: 1.1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: THEME.text,
};

const errorBoxStyle: CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${THEME.redLine}`,
  background: THEME.redSoft,
  color: THEME.red,
  fontSize: 13,
  fontWeight: 800,
  padding: "10px 12px",
  lineHeight: 1.45,
};

const submitButtonStyle: CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.36)",
  background: THEME.buttonBlue,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
};

const cancelButtonStyle: CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.72)",
  color: THEME.textSoft,
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};

const helpTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  lineHeight: 1.55,
  color: THEME.textMuted,
  fontWeight: 700,
};
