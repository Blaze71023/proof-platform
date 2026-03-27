"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CarFront,
  CheckCircle2,
  ChevronDown,
  FileText,
  Phone,
  Plus,
  Save,
  ScanLine,
  Shield,
  UserCircle2,
  UserRound,
  Wrench,
} from "lucide-react";

type Accent = "blue" | "orange" | "emerald";
type StatusTone = "red" | "yellow" | "green";

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  plate: string;
  color: string;
  mileageIn: string;
  concern: string;
  notes: string;
  advisor: string;
  technician: string;
};

type FieldState = {
  tone: StatusTone;
  status: string;
  hint?: string;
};

type ReadinessItem = {
  label: string;
  tone: StatusTone;
  status: string;
};

const THEME = {
  pageBase:
    "linear-gradient(180deg, #02060B 0%, #030912 18%, #03101B 46%, #020912 76%, #02060B 100%)",
  shell:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
  panel:
    "linear-gradient(180deg, rgba(13,24,37,0.98) 0%, rgba(8,16,27,0.99) 48%, rgba(7,13,22,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  textDim: "#73889A",
  lineSoft: "rgba(255,255,255,0.055)",
  lineFaint: "rgba(255,255,255,0.032)",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.16)",
  blueLine: "rgba(59,130,246,0.84)",
  orange: "#F59E42",
  orangeSoft: "rgba(245,158,66,0.18)",
  orangeLine: "rgba(245,158,66,0.84)",
  emerald: "#27D9BF",
  emeraldSoft: "rgba(39,217,191,0.18)",
  emeraldLine: "rgba(39,217,191,0.84)",
  red: "#FF6B7A",
  redSoft: "rgba(255,107,122,0.18)",
  redLine: "rgba(255,107,122,0.84)",
  yellow: "#F5C451",
  yellowSoft: "rgba(245,196,81,0.18)",
  yellowLine: "rgba(245,196,81,0.84)",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

const INITIAL_FORM: FormState = {
  customerName: "",
  phone: "",
  email: "",
  vin: "",
  year: "",
  make: "",
  model: "",
  plate: "",
  color: "",
  mileageIn: "",
  concern: "",
  notes: "",
  advisor: "Steve R.",
  technician: "John D.",
};

const ADVISORS = ["Steve R.", "Ashley M.", "Chris T.", "Front Desk"];
const TECHS = ["John D.", "Mark T.", "Sarah L.", "Unassigned"];

export default function ShopProofNewPage() {
  const [width, setWidth] = useState(1440);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [scanMessage, setScanMessage] = useState(
    "VIN scan hooks here later. V1 keeps manual entry first.",
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 820;
  const isTablet = width >= 820 && width < 1180;

  const customerNameState = useMemo(
    () => evaluateCustomerName(form.customerName),
    [form.customerName],
  );
  const phoneState = useMemo(() => evaluatePhone(form.phone), [form.phone]);
  const vinState = useMemo(() => evaluateVin(form.vin), [form.vin]);
  const vehicleIdentityState = useMemo(
    () => evaluateVehicleIdentity(form.year, form.make, form.model),
    [form.year, form.make, form.model],
  );
  const mileageState = useMemo(
    () => evaluateMileage(form.mileageIn),
    [form.mileageIn],
  );
  const concernState = useMemo(
    () => evaluateConcern(form.concern),
    [form.concern],
  );

  const readinessItems = useMemo<ReadinessItem[]>(
    () => [
      {
        label: "Customer name",
        tone: customerNameState.tone,
        status: customerNameState.status,
      },
      {
        label: "Phone number",
        tone: phoneState.tone,
        status: phoneState.status,
      },
      {
        label: "VIN",
        tone: vinState.tone,
        status: vinState.status,
      },
      {
        label: "Year / Make / Model",
        tone: vehicleIdentityState.tone,
        status: vehicleIdentityState.status,
      },
      {
        label: "Mileage in",
        tone: mileageState.tone,
        status: mileageState.status,
      },
      {
        label: "Concern",
        tone: concernState.tone,
        status: concernState.status,
      },
    ],
    [
      concernState.status,
      concernState.tone,
      customerNameState.status,
      customerNameState.tone,
      mileageState.status,
      mileageState.tone,
      phoneState.status,
      phoneState.tone,
      vehicleIdentityState.status,
      vehicleIdentityState.tone,
      vinState.status,
      vinState.tone,
    ],
  );

  const intakeProgress = useMemo(() => {
    const toneScore = { red: 0, yellow: 0.5, green: 1 } as const;
    const total = readinessItems.reduce(
      (sum, item) => sum + toneScore[item.tone],
      0,
    );
    return Math.round((total / readinessItems.length) * 100);
  }, [readinessItems]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value: string) => {
    updateField("phone", formatPhoneNumber(value));
  };

  const handleVinChange = (value: string) => {
    updateField("vin", normalizeVin(value));
  };

  const handleMileageChange = (value: string) => {
    updateField("mileageIn", formatMileage(value));
  };

  const handleVinScan = () => {
    setScanMessage("Scan VIN clicked. Later this will open Scan → Confirm → Auto-Fill.");
  };

  const handlePrefillDemo = () => {
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || "Thomas Dickson",
      phone: prev.phone || formatPhoneNumber("3182869339"),
      email: prev.email || "Thomas41619@outlook.com",
      vin: "1FTFW1ET5JK023466",
      year: "2018",
      make: "Ford",
      model: "F-150",
      color: "Black",
      mileageIn: prev.mileageIn || "132,884",
      concern: prev.concern || "Hard to fill gas tank",
      technician: "Mark T.",
    }));
    setScanMessage("Demo vehicle filled. Later this will come from VIN scan confirm.");
  };

  const handleSaveDraft = () => {
    console.log("Save draft", form);
  };

  const handleCreateJob = () => {
    console.log("Create job", form);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(57,122,255,0.18) 0%, rgba(57,122,255,0.06) 18%, rgba(57,122,255,0) 40%),
          radial-gradient(circle at 0% 100%, rgba(39,217,191,0.06) 0%, rgba(39,217,191,0.02) 18%, rgba(39,217,191,0) 36%),
          radial-gradient(circle at 100% 12%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 12%, rgba(255,255,255,0) 30%),
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.012) 0px,
            rgba(255,255,255,0.012) 1px,
            transparent 1px,
            transparent 46px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.006) 0px,
            rgba(255,255,255,0.006) 1px,
            transparent 1px,
            transparent 74px
          ),
          ${THEME.pageBase}
        `,
        color: THEME.text,
        padding: isMobile ? "8px" : "18px",
      }}
    >
      <div
        style={{
          maxWidth: 1410,
          margin: "0 auto",
          borderRadius: isMobile ? 18 : 24,
          overflow: "hidden",
          background: THEME.shell,
          border: THEME.border,
          boxShadow: THEME.shellShadow,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 16%, rgba(255,255,255,0) 36%),
              radial-gradient(circle at 50% 0%, rgba(71,123,255,0.14) 0%, rgba(71,123,255,0.05) 20%, rgba(71,123,255,0) 44%)
            `,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: isMobile ? 12 : 22,
            right: isMobile ? 12 : 22,
            top: isMobile ? 56 : 64,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.38) 22%, rgba(59,130,246,0.72) 50%, rgba(59,130,246,0.38) 78%, rgba(59,130,246,0) 100%)",
            boxShadow: "0 0 22px rgba(59,130,246,0.28)",
            pointerEvents: "none",
          }}
        />

        <TopBar isMobile={isMobile} isTablet={isTablet} progress={intakeProgress} />

        <div
          style={{
            padding: isMobile ? "10px" : isTablet ? "14px" : "18px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Panel
            title="New Job Intake"
            icon={<FileText size={15} strokeWidth={2.2} />}
            isMobile={isMobile}
            headerRight={
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <SecondaryButton full={isMobile}>
                  <ArrowLeft size={14} strokeWidth={2.4} />
                  Back
                </SecondaryButton>
                <SecondaryButton onClick={handleSaveDraft} full={isMobile}>
                  <Save size={14} strokeWidth={2.4} />
                  Save Draft
                </SecondaryButton>
                <PrimaryButton onClick={handleCreateJob} full={isMobile}>
                  <Plus size={14} strokeWidth={2.8} />
                  Create Job
                </PrimaryButton>
              </div>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isTablet
                    ? "1fr"
                    : "1.55fr 0.85fr",
                gap: isMobile ? 10 : 14,
                alignItems: "start",
              }}
            >
              <div style={{ display: "grid", gap: isMobile ? 10 : 14 }}>
                <SectionCard
                  title="Customer Info"
                  subtitle="Who owns the vehicle and how to reach them"
                  icon={<UserRound size={15} strokeWidth={2.2} />}
                  accent="blue"
                  isMobile={isMobile}
                >
                  <FieldGrid columns={isMobile ? 1 : 2} isMobile={isMobile}>
                    <InputField
                      label="Customer Name"
                      value={form.customerName}
                      onChange={(value) => updateField("customerName", value)}
                      placeholder="Full customer name"
                      hint={customerNameState.hint}
                      tone={customerNameState.tone}
                    />
                    <InputField
                      label="Phone"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 555-5555"
                      hint={phoneState.hint}
                      tone={phoneState.tone}
                    />
                    <InputField
                      label="Email"
                      value={form.email}
                      onChange={(value) => updateField("email", value)}
                      placeholder="Optional"
                    />
                  </FieldGrid>
                </SectionCard>

                <SectionCard
                  title="Vehicle Info"
                  subtitle="Vehicle identity and front desk intake details"
                  icon={<CarFront size={15} strokeWidth={2.2} />}
                  accent="emerald"
                  isMobile={isMobile}
                >
                  <div style={{ display: "grid", gap: isMobile ? 10 : 12 }}>
                    <FieldGrid columns={isMobile ? 1 : 2} isMobile={isMobile}>
                      <InputField
                        label="VIN"
                        value={form.vin}
                        onChange={handleVinChange}
                        placeholder="17-character VIN"
                        hint={vinState.hint}
                        tone={vinState.tone}
                      />
                      <div style={{ display: "grid", gap: 8 }}>
                        <FieldLabel>VIN Tools</FieldLabel>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <PrimaryButton onClick={handleVinScan} full={isMobile}>
                            <ScanLine size={14} strokeWidth={2.4} />
                            Scan VIN
                          </PrimaryButton>
                          <SecondaryButton onClick={handlePrefillDemo} full={isMobile}>
                            <Camera size={14} strokeWidth={2.4} />
                            Demo Fill
                          </SecondaryButton>
                        </div>
                      </div>
                    </FieldGrid>

                    <InfoStrip>{scanMessage}</InfoStrip>

                    <FieldGrid columns={isMobile ? 1 : 3} isMobile={isMobile}>
                      <InputField
                        label="Year"
                        value={form.year}
                        onChange={(value) => updateField("year", digitsOnly(value).slice(0, 4))}
                        placeholder="2018"
                        tone={vehicleIdentityState.tone}
                      />
                      <InputField
                        label="Make"
                        value={form.make}
                        onChange={(value) => updateField("make", value)}
                        placeholder="Ford"
                        tone={vehicleIdentityState.tone}
                      />
                      <InputField
                        label="Model"
                        value={form.model}
                        onChange={(value) => updateField("model", value)}
                        placeholder="F-150"
                        tone={vehicleIdentityState.tone}
                        hint={vehicleIdentityState.hint}
                      />
                    </FieldGrid>

                    <FieldGrid columns={isMobile ? 1 : 3} isMobile={isMobile}>
                      <InputField
                        label="Plate"
                        value={form.plate}
                        onChange={(value) => updateField("plate", value.toUpperCase())}
                        placeholder="Optional"
                      />
                      <InputField
                        label="Color"
                        value={form.color}
                        onChange={(value) => updateField("color", value)}
                        placeholder="Optional"
                      />
                      <InputField
                        label="Mileage In"
                        value={form.mileageIn}
                        onChange={handleMileageChange}
                        placeholder="Current mileage"
                        hint={mileageState.hint}
                        tone={mileageState.tone}
                      />
                    </FieldGrid>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Visit Info"
                  subtitle="Why the vehicle is here and what needs attention"
                  icon={<Wrench size={15} strokeWidth={2.2} />}
                  accent="orange"
                  isMobile={isMobile}
                >
                  <div style={{ display: "grid", gap: isMobile ? 10 : 12 }}>
                    <TextAreaField
                      label="Customer Concern / Reason for Visit"
                      value={form.concern}
                      onChange={(value) => updateField("concern", value)}
                      placeholder="Describe complaint, symptoms, or requested work"
                      minHeight={isMobile ? 112 : 120}
                      hint={concernState.hint}
                      tone={concernState.tone}
                    />
                    <TextAreaField
                      label="Internal Notes"
                      value={form.notes}
                      onChange={(value) => updateField("notes", value)}
                      placeholder="Advisor notes, quick observations, or shop comments"
                      minHeight={isMobile ? 92 : 100}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Assignment"
                  subtitle="Who is handling the front desk and who is assigned"
                  icon={<UserCircle2 size={15} strokeWidth={2.2} />}
                  accent="blue"
                  isMobile={isMobile}
                >
                  <FieldGrid columns={isMobile ? 1 : 2} isMobile={isMobile}>
                    <SelectField
                      label="Service Advisor"
                      value={form.advisor}
                      onChange={(value) => updateField("advisor", value)}
                      options={ADVISORS}
                    />
                    <SelectField
                      label="Technician"
                      value={form.technician}
                      onChange={(value) => updateField("technician", value)}
                      options={TECHS}
                    />
                  </FieldGrid>
                </SectionCard>
              </div>

              <div style={{ display: "grid", gap: isMobile ? 10 : 14 }}>
                <SectionCard
                  title="Intake Readiness"
                  subtitle="V1 quick summary before creating the job"
                  icon={<Shield size={15} strokeWidth={2.2} />}
                  accent="emerald"
                  isMobile={isMobile}
                >
                  <div style={{ display: "grid", gap: isMobile ? 10 : 12 }}>
                    <ProgressCard progress={intakeProgress} isMobile={isMobile} />

                    <SummaryStack>
                      <SummaryRow label="Customer" value={form.customerName || "Not entered"} />
                      <SummaryRow
                        label="Vehicle"
                        value={
                          [form.year, form.make, form.model].filter(Boolean).join(" ") ||
                          "Not entered"
                        }
                      />
                      <SummaryRow label="VIN" value={form.vin || "Not entered"} mono />
                      <SummaryRow label="Mileage In" value={form.mileageIn || "Not entered"} />
                      <SummaryRow label="Advisor" value={form.advisor || "Not assigned"} />
                      <SummaryRow
                        label="Technician"
                        value={form.technician || "Not assigned"}
                        isLast
                      />
                    </SummaryStack>

                    <ReadinessCard items={readinessItems} />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Next Steps"
                  subtitle="What comes after this screen"
                  icon={<Phone size={15} strokeWidth={2.2} />}
                  accent="orange"
                  isMobile={isMobile}
                >
                  <div style={{ display: "grid", gap: isMobile ? 8 : 10 }}>
                    <StepCard
                      step="1"
                      title="Create job"
                      body="Save the customer, vehicle, and complaint as the record entry point."
                      isMobile={isMobile}
                    />
                    <StepCard
                      step="2"
                      title="Check-in capture"
                      body="Move straight into intake photos, dash photo, mileage, and overall condition."
                      isMobile={isMobile}
                    />
                    <StepCard
                      step="3"
                      title="Diagnostics and approvals"
                      body="Document findings, request authorization, and keep the full timeline."
                      isMobile={isMobile}
                    />
                    <StepCard
                      step="4"
                      title="Final condition"
                      body="Require final walkaround before marking the job complete."
                      isMobile={isMobile}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Quick Actions"
                  subtitle="V1 helper buttons"
                  icon={<Plus size={15} strokeWidth={2.2} />}
                  accent="blue"
                  isMobile={isMobile}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <SecondaryButton onClick={handleSaveDraft} full>
                      <Save size={14} strokeWidth={2.4} />
                      Save Intake Draft
                    </SecondaryButton>
                    <SecondaryButton onClick={handlePrefillDemo} full>
                      <Camera size={14} strokeWidth={2.4} />
                      Fill Demo Vehicle
                    </SecondaryButton>
                    <PrimaryButton onClick={handleCreateJob} full>
                      <Plus size={14} strokeWidth={2.8} />
                      Create Job & Continue
                    </PrimaryButton>
                  </div>
                </SectionCard>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

function TopBar({
  isMobile,
  isTablet,
  progress,
}: {
  isMobile: boolean;
  isTablet: boolean;
  progress: number;
}) {
  return (
    <div
      style={{
        minHeight: isMobile ? "auto" : 84,
        padding: isMobile ? "10px 10px 8px" : isTablet ? "12px 14px" : "15px 18px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
        gap: isMobile ? 10 : 14,
        alignItems: "center",
        borderBottom: `1px solid ${THEME.lineFaint}`,
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(10,20,31,0.86) 0%, rgba(6,13,22,0.5) 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 22%, rgba(255,255,255,0) 54%)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 10 : 12,
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: isMobile ? 38 : 42,
            height: isMobile ? 38 : 42,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: THEME.borderSoft,
            background:
              "linear-gradient(180deg, rgba(17,32,48,0.98) 0%, rgba(10,19,29,0.98) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 20px rgba(0,0,0,0.18)",
            flexShrink: 0,
          }}
        >
          <Shield size={isMobile ? 20 : 22} strokeWidth={2.1} color={THEME.blue} />
        </div>

        <div
          style={{
            fontSize: isMobile ? 18 : isTablet ? 24 : 28,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
            textShadow: "0 2px 18px rgba(0,0,0,0.28)",
          }}
        >
          <span style={{ color: THEME.text }}>Shop</span>
          <span style={{ color: "#78ABFF" }}>PROOF</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
          gap: isMobile ? 8 : 10,
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <TopMetric value="New Job" label="Current Screen" />
        <TopMetric value={`${progress}%`} label="Intake Ready" />
        <TopMetric value="V1" label="Flow Mode" hideOnMobile={isMobile} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "stretch" : "flex-end",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <PrimaryButton full={isMobile}>
          <Plus size={13} strokeWidth={2.7} />
          Create Job
        </PrimaryButton>
      </div>
    </div>
  );
}

function TopMetric({
  value,
  label,
  hideOnMobile = false,
}: {
  value: string;
  label: string;
  hideOnMobile?: boolean;
}) {
  if (hideOnMobile) return null;

  return (
    <div
      style={{
        minHeight: 42,
        borderRadius: 10,
        background:
          "linear-gradient(180deg, rgba(21,31,44,0.98) 0%, rgba(13,23,35,0.98) 100%)",
        border: THEME.borderSoft,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 8,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 18px rgba(0,0,0,0.12)",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: 16,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {value}
      </span>

      <span
        style={{
          fontSize: 11,
          color: THEME.textSoft,
          fontWeight: 800,
          lineHeight: 1.05,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  headerRight,
  isMobile,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  headerRight?: ReactNode;
  isMobile: boolean;
}) {
  return (
    <section
      style={{
        borderRadius: isMobile ? 16 : 18,
        overflow: "hidden",
        background: THEME.panel,
        border: THEME.border,
        boxShadow: THEME.panelShadow,
      }}
    >
      <div
        style={{
          minHeight: isMobile ? 48 : 54,
          padding: isMobile ? "10px 12px" : "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: `1px solid ${THEME.lineSoft}`,
          flexWrap: "wrap",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: THEME.textSoft,
              display: "inline-flex",
              flexShrink: 0,
              opacity: 0.95,
            }}
          >
            {icon}
          </span>

          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : 15,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: THEME.text,
            }}
          >
            {title}
          </h2>
        </div>

        {headerRight}
      </div>

      <div style={{ padding: isMobile ? 10 : 12 }}>{children}</div>
    </section>
  );
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  accent,
  isMobile,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  accent: Accent;
  isMobile: boolean;
}) {
  const tone = getAccent(accent);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: isMobile ? 14 : 16,
        overflow: "hidden",
        background: THEME.card,
        border: THEME.borderSoft,
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.014) 26%, rgba(255,255,255,0) 58%)",
        }}
      />

      <AccentLine color={tone.line} />

      <div
        style={{
          padding: isMobile ? "12px 12px 0 16px" : "14px 14px 0 18px",
          display: "grid",
          gap: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              color: THEME.textSoft,
            }}
          >
            {icon}
          </span>

          <div
            style={{
              fontSize: isMobile ? 14 : 15,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            fontSize: isMobile ? 11 : 12,
            color: THEME.textMuted,
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          padding: isMobile ? 12 : 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FieldGrid({
  columns,
  children,
  isMobile,
}: {
  columns: 1 | 2 | 3;
  children: ReactNode;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          columns === 1
            ? "1fr"
            : columns === 2
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(3, minmax(0, 1fr))",
        gap: isMobile ? 10 : 12,
      }}
    >
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  tone,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  tone?: StatusTone;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          ...inputStyle,
          ...(tone ? getInputToneStyle(tone) : {}),
        }}
      />
      {hint ? <FieldHint tone={tone ?? "yellow"}>{hint}</FieldHint> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputStyle,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            paddingRight: 38,
          }}
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              style={{
                background: "#08111B",
                color: "#F5FAFF",
              }}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          strokeWidth={2.4}
          color={THEME.textMuted}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  minHeight,
  hint,
  tone,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight: number;
  hint?: string;
  tone?: StatusTone;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          ...inputStyle,
          ...(tone ? getInputToneStyle(tone) : {}),
          minHeight,
          resize: "vertical",
          paddingTop: 12,
          fontFamily: "inherit",
        }}
      />
      {hint ? <FieldHint tone={tone ?? "yellow"}>{hint}</FieldHint> : null}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label
      style={{
        fontSize: 11,
        color: THEME.textSoft,
        fontWeight: 900,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </label>
  );
}

function FieldHint({
  children,
  tone,
}: {
  children: ReactNode;
  tone: StatusTone;
}) {
  const colors = getStatusColors(tone);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        fontSize: 11,
        color: colors.text,
        lineHeight: 1.35,
        fontWeight: 700,
      }}
    >
      <AlertCircle size={12} strokeWidth={2.2} style={{ marginTop: 1, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

function InfoStrip({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: 40,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderRadius: 12,
        background:
          "linear-gradient(180deg, rgba(20,31,45,0.98) 0%, rgba(10,20,30,0.98) 100%)",
        border: THEME.borderSoft,
        color: THEME.textSoft,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.4,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </div>
  );
}

function ProgressCard({
  progress,
  isMobile,
}: {
  progress: number;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(20,31,45,0.98) 0%, rgba(10,20,30,0.98) 100%)",
        padding: isMobile ? 12 : 14,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 14 : 15,
              fontWeight: 900,
              marginBottom: 3,
            }}
          >
            Intake Progress
          </div>
          <div
            style={{
              fontSize: 12,
              color: THEME.textMuted,
              lineHeight: 1.35,
            }}
          >
            Readiness is based on quality, not just filled boxes
          </div>
        </div>

        <div
          style={{
            fontSize: isMobile ? 18 : 20,
            fontWeight: 900,
            color: THEME.text,
            letterSpacing: "-0.03em",
            flexShrink: 0,
          }}
        >
          {progress}%
        </div>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(39,217,191,0.95) 0%, rgba(59,130,246,0.95) 100%)",
            boxShadow: "0 0 18px rgba(59,130,246,0.28)",
          }}
        />
      </div>
    </div>
  );
}

function SummaryStack({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(20,31,45,0.98) 0%, rgba(10,20,30,0.98) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
  isLast = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: 46,
        display: "grid",
        gridTemplateColumns: "92px 1fr",
        gap: 10,
        alignItems: "center",
        padding: "0 12px",
        borderBottom: isLast ? "none" : `1px solid ${THEME.lineSoft}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: THEME.textMuted,
          fontWeight: 900,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: THEME.textSoft,
          fontWeight: 800,
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ReadinessCard({ items }: { items: ReadinessItem[] }) {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(20,31,45,0.98) 0%, rgba(10,20,30,0.98) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      {items.map((item, index) => (
        <ReadinessRow
          key={item.label}
          item={item}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}

function ReadinessRow({
  item,
  isLast,
}: {
  item: ReadinessItem;
  isLast: boolean;
}) {
  const colors = getStatusColors(item.tone);

  return (
    <div
      style={{
        minHeight: 50,
        display: "grid",
        gridTemplateColumns: "14px 1fr auto",
        gap: 10,
        alignItems: "center",
        padding: "0 12px",
        borderBottom: isLast ? "none" : `1px solid ${THEME.lineSoft}`,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: colors.dot,
          boxShadow: `0 0 12px ${colors.glow}`,
          display: "inline-block",
        }}
      />

      <div
        style={{
          fontSize: 13,
          color: THEME.text,
          fontWeight: 800,
          minWidth: 0,
        }}
      >
        {item.label}
      </div>

      <div
        style={{
          fontSize: 12,
          color: colors.text,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {item.tone === "green" ? (
          <CheckCircle2 size={14} strokeWidth={2.4} />
        ) : (
          <AlertCircle size={14} strokeWidth={2.4} />
        )}
        <span>{item.status}</span>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
  isMobile,
}: {
  step: string;
  title: string;
  body: string;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        gap: 10,
        alignItems: "start",
        padding: isMobile ? "10px" : "12px",
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(20,31,45,0.98) 0%, rgba(10,20,30,0.98) 100%)",
        border: THEME.borderSoft,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: THEME.blueSoft,
          color: THEME.blue,
          border: "1px solid rgba(59,130,246,0.34)",
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {step}
      </div>

      <div>
        <div
          style={{
            fontSize: isMobile ? 13 : 14,
            fontWeight: 900,
            marginBottom: 3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: THEME.textMuted,
            lineHeight: 1.45,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function AccentLine({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: color,
        boxShadow: `0 0 12px ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

function getAccent(accent: Accent) {
  if (accent === "orange") {
    return { line: THEME.orangeLine };
  }

  if (accent === "emerald") {
    return { line: THEME.emeraldLine };
  }

  return { line: THEME.blueLine };
}

function getStatusColors(tone: StatusTone) {
  if (tone === "green") {
    return {
      dot: THEME.emerald,
      glow: "rgba(39,217,191,0.24)",
      text: THEME.emerald,
      border: "rgba(39,217,191,0.34)",
      soft: THEME.emeraldSoft,
    };
  }

  if (tone === "yellow") {
    return {
      dot: THEME.yellow,
      glow: "rgba(245,196,81,0.24)",
      text: THEME.yellow,
      border: "rgba(245,196,81,0.34)",
      soft: THEME.yellowSoft,
    };
  }

  return {
    dot: THEME.red,
    glow: "rgba(255,107,122,0.24)",
    text: THEME.red,
    border: "rgba(255,107,122,0.34)",
    soft: THEME.redSoft,
  };
}

function getInputToneStyle(tone: StatusTone): CSSProperties {
  const colors = getStatusColors(tone);
  return {
    border: `1px solid ${colors.border}`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px ${colors.soft}`,
  };
}

function PrimaryButton({
  children,
  onClick,
  full = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...primaryButtonStyle,
        width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  full = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...secondaryButtonStyle,
        width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhoneNumber(value: string) {
  const digits = digitsOnly(value).slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function normalizeVin(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 17);
}

function formatMileage(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function evaluateCustomerName(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Enter first and last name.",
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Use full customer name, not just one name.",
    };
  }

  return {
    tone: "green",
    status: "Complete",
  };
}

function evaluatePhone(value: string): FieldState {
  const digits = digitsOnly(value);

  if (!digits.length) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Enter a 10-digit phone number.",
    };
  }

  if (digits.length < 10) {
    return {
      tone: "yellow",
      status: "Incomplete",
      hint: "Phone number needs all 10 digits.",
    };
  }

  return {
    tone: "green",
    status: "Complete",
  };
}

function evaluateVin(value: string): FieldState {
  const vin = normalizeVin(value);

  if (!vin.length) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Enter the 17-character VIN.",
    };
  }

  if (/[IOQ]/.test(vin)) {
    return {
      tone: "red",
      status: "Invalid",
      hint: "VIN cannot contain I, O, or Q.",
    };
  }

  if (vin.length < 17) {
    return {
      tone: "yellow",
      status: "Incomplete",
      hint: "VIN must be 17 characters.",
    };
  }

  return {
    tone: "green",
    status: "Valid",
  };
}

function evaluateVehicleIdentity(
  year: string,
  make: string,
  model: string,
): FieldState {
  const values = [year.trim(), make.trim(), model.trim()];
  const count = values.filter(Boolean).length;

  if (count === 0) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Fill year, make, and model.",
    };
  }

  if (count < 3) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Year, make, and model should all be filled.",
    };
  }

  return {
    tone: "green",
    status: "Complete",
  };
}

function evaluateMileage(value: string): FieldState {
  const digits = digitsOnly(value);

  if (!digits.length) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Enter current vehicle mileage.",
    };
  }

  if (digits.length < 2) {
    return {
      tone: "yellow",
      status: "Too short",
      hint: "Mileage looks too short to trust.",
    };
  }

  return {
    tone: "green",
    status: "Complete",
  };
}

function evaluateConcern(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed.length) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Describe why the vehicle is here.",
    };
  }

  if (trimmed.length < 12) {
    return {
      tone: "yellow",
      status: "Too short",
      hint: "Add a little more detail for a useful intake record.",
    };
  }

  return {
    tone: "green",
    status: "Complete",
  };
}

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.09)",
  background:
    "linear-gradient(180deg, rgba(15,26,38,0.98) 0%, rgba(9,18,28,0.98) 100%)",
  color: "#F5FAFF",
  padding: "0 12px",
  fontSize: 14,
  fontWeight: 700,
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  position: "relative",
  zIndex: 2,
  pointerEvents: "auto",
};

const primaryButtonStyle: CSSProperties = {
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 10,
  background: THEME.buttonBlue,
  border: "1px solid rgba(59,130,246,0.34)",
  color: "#F7FBFF",
  fontSize: 13,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px rgba(59,130,246,0.22), 0 10px 20px rgba(0,0,0,0.16)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const secondaryButtonStyle: CSSProperties = {
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 10,
  background:
    "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
  border: THEME.borderSoft,
  color: THEME.textSoft,
  fontSize: 13,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 18px rgba(0,0,0,0.14)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};