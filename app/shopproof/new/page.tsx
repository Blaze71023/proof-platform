"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CarFront,
  CheckCircle2,
  ChevronDown,
  FileText,
  LoaderCircle,
  Plus,
  Save,
  ScanLine,
  Shield,
  UserCircle2,
  Wrench,
} from "lucide-react";

type JobStatus =
  | "New Intake"
  | "Waiting on Approval"
  | "Approved"
  | "In Progress"
  | "Waiting on Parts"
  | "Ready for Pickup";

type ApprovalStatus = "Not Sent" | "Pending" | "Approved";
type Accent = "blue" | "orange" | "emerald";
type StatusTone = "red" | "yellow" | "green";

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

type FormState = {
  customerName: string;
  customerAddress: string;
  phone: string;
  email: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  plate: string;
  mileageIn: string;
  concern: string;
  requestedWork: string;
  notes: string;
  status: JobStatus;
  approvalStatus: ApprovalStatus;
  advisor: string;
  technician: string;
};

type FieldState = {
  tone: StatusTone;
  status: string;
  hint?: string;
};

type ReadinessItem = {
  key: string;
  label: string;
  tone: StatusTone;
  status: string;
};

type ShopRow = { id: string };
type CustomerRow = { id: string };
type TeamMemberRow = { id: string | null };
type VehicleDecode = { year: string; make: string; model: string };

type PendingVinCandidate = {
  vin: string;
  source: "scan";
  imageName?: string;
  confidenceLabel: string;
};

type OcrPassResult = {
  text: string;
};

type VinCandidate = {
  vin: string;
  substitutions: number;
  lineIndex: number;
  rawLine: string;
  compactSource: string;
  score: number;
  checksumValid: boolean;
};

const TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Thomas", role: "Service Advisor" },
  { id: "2", name: "Mike", role: "Lead Technician" },
  { id: "3", name: "Chris", role: "Technician" },
  { id: "4", name: "Front Desk", role: "Advisor" },
];

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
  customerAddress: "",
  phone: "",
  email: "",
  vin: "",
  year: "",
  make: "",
  model: "",
  plate: "",
  mileageIn: "",
  concern: "",
  requestedWork: "",
  notes: "",
  status: "New Intake",
  approvalStatus: "Not Sent",
  advisor: "Thomas",
  technician: "Unassigned",
};

const VIN_ALLOWED_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
const VIN_LINE_CLEAN_REGEX = /[^A-Z0-9]/g;
const VIN_SUBSTITUTION_MAP: Record<string, string> = {
  O: "0",
  Q: "0",
  I: "1",
};
const VIN_STOP_WORDS = [
  "VEHICLE",
  "THEFT",
  "WARNING",
  "MFD",
  "DATE",
  "GVWR",
  "GAWR",
  "TYPE",
  "PASSENGER",
  "CONFORMS",
  "SAFETY",
  "STANDARDS",
  "THIS",
  "AUTO",
  "MADE",
  "IN",
  "BY",
];

function getBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export default function ShopProofNewPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [width, setWidth] = useState(1440);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [scanMessage, setScanMessage] = useState(
    "Use Scan VIN on your phone to capture a VIN plate photo, detect a VIN candidate, confirm it, and then decode vehicle details.",
  );
  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [pendingVin, setPendingVin] = useState<PendingVinCandidate | null>(null);
  const [pendingVinInput, setPendingVinInput] = useState("");
  const [isDecodingVin, setIsDecodingVin] = useState(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    return () => {
      if (scanPreviewUrl) {
        URL.revokeObjectURL(scanPreviewUrl);
      }
    };
  }, [scanPreviewUrl]);

  const isMobile = width < 820;

  const customerNameState = useMemo(
    () => evaluateCustomerName(form.customerName),
    [form.customerName],
  );
  const addressState = useMemo(
    () => evaluateAddress(form.customerAddress),
    [form.customerAddress],
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

  const pendingVinValidation = useMemo(() => {
    if (!pendingVin) return null;
    const normalized = normalizeVinStrict(pendingVinInput);
    if (!normalized) return "VIN is empty.";
    if (!isValidVin(normalized)) return "VIN must be 17 valid characters.";
    return null;
  }, [pendingVin, pendingVinInput]);

  const readinessItems = useMemo<ReadinessItem[]>(
    () => [
      {
        key: "customer",
        label: "Customer name",
        tone: customerNameState.tone,
        status: customerNameState.status,
      },
      {
        key: "address",
        label: "Customer address",
        tone: addressState.tone,
        status: addressState.status,
      },
      {
        key: "phone",
        label: "Phone number",
        tone: phoneState.tone,
        status: phoneState.status,
      },
      {
        key: "vin",
        label: "VIN",
        tone: vinState.tone,
        status: vinState.status,
      },
      {
        key: "vehicle",
        label: "Year / Make / Model",
        tone: vehicleIdentityState.tone,
        status: vehicleIdentityState.status,
      },
      {
        key: "mileage",
        label: "Mileage in",
        tone: mileageState.tone,
        status: mileageState.status,
      },
      {
        key: "concern",
        label: "Concern",
        tone: concernState.tone,
        status: concernState.status,
      },
    ],
    [
      customerNameState.tone,
      customerNameState.status,
      addressState.tone,
      addressState.status,
      phoneState.tone,
      phoneState.status,
      vinState.tone,
      vinState.status,
      vehicleIdentityState.tone,
      vehicleIdentityState.status,
      mileageState.tone,
      mileageState.status,
      concernState.tone,
      concernState.status,
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

  const isReadyToCreate = useMemo(
    () => readinessItems.every((item) => item.tone === "green"),
    [readinessItems],
  );

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value: string) => {
    updateField("phone", formatPhone(value));
  };

  const handleMileageChange = (value: string) => {
    updateField("mileageIn", formatMileage(value));
  };

  const clearPendingVinState = () => {
    setPendingVin(null);
    setPendingVinInput("");
  };

  const handleVinScan = () => {
    if (isScanning || isDecodingVin) return;
    setSubmitError(null);
    fileInputRef.current?.click();
  };

  const handleDirectVinChange = (value: string) => {
    const normalized = normalizeVinStrict(value);
    clearPendingVinState();
    setIsDecodingVin(false);
    updateField("vin", normalized);
  };

  const handleScanFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (scanPreviewUrl) {
      URL.revokeObjectURL(scanPreviewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setScanPreviewUrl(nextPreview);

    setSubmitError(null);
    setIsScanning(true);
    setIsDecodingVin(false);
    setOcrProgress(0);
    clearPendingVinState();
    setScanMessage("Reading VIN plate photo...");

    try {
      const detected = await scanVinFromImage(file, setOcrProgress);

      setPendingVin({
        vin: detected.vin,
        source: "scan",
        imageName: file.name,
        confidenceLabel: buildVinConfidenceLabel(detected),
      });
      setPendingVinInput(detected.vin);

      setScanMessage(
        "VIN candidate detected. Review and confirm before it is accepted.",
      );
    } catch (error) {
      console.error("VIN scan failed:", error);
      clearPendingVinState();
      setScanMessage(
        error instanceof Error
          ? error.message
          : "VIN scan failed. Try a closer, sharper photo of the VIN plate.",
      );
    } finally {
      setIsScanning(false);
      setOcrProgress(0);
    }
  };

  const handleConfirmPendingVin = async () => {
    if (!pendingVin) return;

    const confirmedVin = normalizeVinStrict(pendingVinInput);

    if (!isValidVin(confirmedVin)) {
      setScanMessage("VIN must be 17 valid characters before it can be confirmed.");
      return;
    }

    setIsDecodingVin(true);
    setSubmitError(null);

    setForm((prev) => ({
      ...prev,
      vin: confirmedVin,
    }));

    setScanMessage(`VIN confirmed: ${confirmedVin}. Decoding vehicle details...`);

    try {
      const decoded = await decodeVinViaAppRoute(
        confirmedVin,
        form.year.trim() || undefined,
      );

      setForm((prev) => ({
        ...prev,
        vin: confirmedVin,
        year: decoded.year || prev.year,
        make: decoded.make || prev.make,
        model: decoded.model || prev.model,
      }));

      const identity = [decoded.year, decoded.make, decoded.model]
        .filter(Boolean)
        .join(" ");

      setScanMessage(
        identity
          ? `VIN confirmed and decoded. ${confirmedVin} → ${identity}`
          : `VIN confirmed: ${confirmedVin}. Decode unavailable right now. Fill any missing vehicle details if needed.`,
      );

      clearPendingVinState();
    } catch (error) {
      console.error("VIN decode failed:", error);

      setForm((prev) => ({
        ...prev,
        vin: confirmedVin,
      }));

      setScanMessage(
        "VIN confirmed. Decode unavailable right now. Enter year/make/model manually if needed.",
      );

      clearPendingVinState();
    } finally {
      setIsDecodingVin(false);
    }
  };

  const handleRescanVin = () => {
    clearPendingVinState();
    setScanMessage("Rescan the VIN plate photo when ready.");
    fileInputRef.current?.click();
  };

  const handleDismissPendingVin = () => {
    clearPendingVinState();
    setScanMessage("VIN detection cleared. You can rescan or enter the VIN manually.");
  };

  const handlePrefillDemo = async () => {
    const demoVin = "1FTFW1ET5JKD23466";

    clearPendingVinState();
    setIsDecodingVin(true);

    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || "Thomas Dickson",
      customerAddress:
        prev.customerAddress || "123 Main Street, Bossier City, LA 71111",
      phone: prev.phone || formatPhone("3182869339"),
      email: prev.email || "thomas@example.com",
      vin: demoVin,
      plate: "ATP-150",
      mileageIn: prev.mileageIn || "132,884",
      concern: prev.concern || "Hard to fill gas tank",
      requestedWork: prev.requestedWork || "Inspect EVAP / fuel fill concern",
      notes: prev.notes || "Customer states pump keeps clicking off early.",
      technician: prev.technician === "Unassigned" ? "Mike" : prev.technician,
    }));

    try {
      const decoded = await decodeVinViaAppRoute(demoVin);
      setForm((prev) => ({
        ...prev,
        year: decoded.year || prev.year,
        make: decoded.make || prev.make,
        model: decoded.model || prev.model,
      }));
      setScanMessage(
        `Demo VIN decoded through app route: ${[
          decoded.year,
          decoded.make,
          decoded.model,
        ]
          .filter(Boolean)
          .join(" ") || demoVin}`,
      );
    } catch {
      setForm((prev) => ({
        ...prev,
        year: prev.year || "2018",
        make: prev.make || "Ford",
        model: prev.model || "F-150",
      }));
      setScanMessage(
        "Demo vehicle filled. Decode was unavailable, so fallback values were used.",
      );
    } finally {
      setIsDecodingVin(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      sessionStorage.setItem("shopproof-new-job-draft", JSON.stringify(form));
      setScanMessage("Draft saved locally in this browser session.");
    } catch {
      setScanMessage("Draft could not be saved locally on this device.");
    }
  };

  async function handleCreateJob() {
    if (!isReadyToCreate) {
      setSubmitError("Finish all required intake items before creating the job.");
      return;
    }

    setIsCreating(true);
    setSubmitError(null);

    try {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase not available.");
      }

      const { data: shops, error: shopError } = await supabase
        .from("shops")
        .select("id")
        .limit(1);

      if (shopError) throw shopError;

      const shopId = (shops as ShopRow[] | null)?.[0]?.id;
      if (!shopId) throw new Error("No shop record found.");

      let assignedTo: string | null = null;

      if (form.technician && form.technician !== "Unassigned") {
        const { data: techRow, error: techError } = await supabase
          .from("team_members")
          .select("id")
          .eq("shop_id", shopId)
          .eq("name", form.technician)
          .eq("active", true)
          .maybeSingle();

        if (techError) throw techError;
        assignedTo = (techRow as TeamMemberRow | null)?.id ?? null;
      }

      const normalizedPhone = form.phone.trim();
      const normalizedEmail = form.email.trim().toLowerCase();
      const normalizedName = form.customerName.trim();
      const normalizedAddress = form.customerAddress.trim();

      let customerId: string | null = null;

      if (normalizedPhone) {
        const { data: phoneMatch, error: phoneLookupError } = await supabase
          .from("customers")
          .select("id")
          .eq("shop_id", shopId)
          .eq("phone", normalizedPhone)
          .limit(1)
          .maybeSingle();

        if (phoneLookupError) throw phoneLookupError;
        customerId = (phoneMatch as CustomerRow | null)?.id ?? null;
      }

      if (!customerId && normalizedEmail) {
        const { data: emailMatch, error: emailLookupError } = await supabase
          .from("customers")
          .select("id")
          .eq("shop_id", shopId)
          .eq("email", normalizedEmail)
          .limit(1)
          .maybeSingle();

        if (emailLookupError) throw emailLookupError;
        customerId = (emailMatch as CustomerRow | null)?.id ?? null;
      }

      if (!customerId && normalizedName && normalizedAddress) {
        const { data: identityMatch, error: identityLookupError } = await supabase
          .from("customers")
          .select("id")
          .eq("shop_id", shopId)
          .eq("name", normalizedName)
          .eq("address", normalizedAddress)
          .limit(1)
          .maybeSingle();

        if (identityLookupError) throw identityLookupError;
        customerId = (identityMatch as CustomerRow | null)?.id ?? null;
      }

      if (!customerId) {
        const { data: customerRow, error: customerError } = await supabase
          .from("customers")
          .insert({
            shop_id: shopId,
            name: normalizedName,
            phone: normalizedPhone,
            email: normalizedEmail || null,
            address: normalizedAddress,
          })
          .select("id")
          .single();

        if (customerError) throw customerError;
        customerId = customerRow?.id ?? null;
      }

      if (!customerId) throw new Error("Customer could not be created or found.");

      let vehicleId: string | null = null;

      if (form.vin.trim()) {
        const { data: existingVehicle, error: vehicleLookupError } = await supabase
          .from("vehicles")
          .select("id")
          .eq("shop_id", shopId)
          .eq("vin", form.vin.trim())
          .limit(1)
          .maybeSingle();

        if (vehicleLookupError) throw vehicleLookupError;
        vehicleId = existingVehicle?.id ?? null;
      }

      if (!vehicleId) {
        const { data: vehicleRow, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            shop_id: shopId,
            customer_id: customerId,
            year: form.year.trim(),
            make: form.make.trim(),
            model: form.model.trim(),
            vin: form.vin.trim(),
            plate: form.plate.trim() || null,
          })
          .select("id")
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = vehicleRow?.id ?? null;
      }

      if (!vehicleId) throw new Error("Vehicle was not created or found.");

      const jobNotes = [
        `Concern: ${form.concern.trim() || "N/A"}`,
        `Requested Work: ${form.requestedWork.trim() || "N/A"}`,
        `Internal Notes: ${form.notes.trim() || "N/A"}`,
        `Mileage In: ${form.mileageIn.trim() || "N/A"}`,
        `Advisor: ${form.advisor.trim() || "N/A"}`,
        `Technician: ${form.technician.trim() || "N/A"}`,
      ].join("\n");

      const { error: jobError } = await supabase.from("jobs").insert({
        shop_id: shopId,
        customer_id: customerId,
        vehicle_id: vehicleId,
        status: form.status,
        approval_status: form.approvalStatus,
        assigned_to: assignedTo,
        notes: jobNotes,
      });

      if (jobError) throw jobError;

      router.push("/shopproof/dashboard");
    } catch (error) {
      console.error("Create job error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create job.",
      );
    } finally {
      setIsCreating(false);
    }
  }

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleScanFileChange}
        style={{ display: "none" }}
      />

      <div
        style={{
          maxWidth: "1360px",
          margin: "0 auto",
          background: THEME.shell,
          border: THEME.border,
          borderRadius: "30px",
          boxShadow: THEME.shellShadow,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 22% 0%, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at 78% 0%, rgba(39,217,191,0.10), transparent 24%)",
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

        <div
          style={{
            minHeight: isMobile ? "auto" : 84,
            padding: isMobile ? "10px 10px 8px" : "15px 18px",
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
              <Shield
                size={isMobile ? 20 : 22}
                strokeWidth={2.1}
                color={THEME.blue}
              />
            </div>

            <div
              style={{
                fontSize: isMobile ? 18 : 28,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: THEME.text }}>Shop</span>
              <span style={{ color: "#78ABFF" }}>PROOF</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              minWidth: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <TopStatusBox title="New Job" value="Current Screen" />
            <TopStatusBox title={`${intakeProgress}%`} value="Intake Ready" />
            <TopStatusBox
              title={isReadyToCreate ? "Ready" : "Review"}
              value="Create Status"
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: isMobile ? "stretch" : "flex-end",
              position: "relative",
              zIndex: 1,
            }}
          >
            <button
              type="button"
              style={{
                ...primaryButton,
                width: isMobile ? "100%" : undefined,
                opacity: isCreating ? 0.7 : 1,
              }}
              onClick={handleCreateJob}
              disabled={isCreating}
            >
              <Plus size={15} />
              {isCreating ? "Creating..." : "Create Job"}
            </button>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            padding: isMobile ? "14px 10px 16px" : "16px",
          }}
        >
          <div
            style={{
              background: THEME.panel,
              border: THEME.borderSoft,
              borderRadius: "24px",
              boxShadow: THEME.panelShadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: isMobile ? "14px 14px" : "18px 20px",
                borderBottom: `1px solid ${THEME.lineSoft}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={16} color={THEME.textSoft} />
                <div
                  style={{
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    fontSize: "1.1rem",
                  }}
                >
                  New Job Intake
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button type="button" style={ghostButton} onClick={() => router.back()}>
                  <ArrowLeft size={15} />
                  Back
                </button>
                <button type="button" style={ghostButton} onClick={handleSaveDraft}>
                  <Save size={15} />
                  Save Draft
                </button>
                <button
                  type="button"
                  style={{ ...primaryButton, opacity: isCreating ? 0.7 : 1 }}
                  onClick={handleCreateJob}
                  disabled={isCreating}
                >
                  <Plus size={15} />
                  {isCreating ? "Creating..." : "Create Job"}
                </button>
              </div>
            </div>

            <div style={{ padding: isMobile ? "12px 10px 14px" : "12px" }}>
              <div style={{ display: "grid", gap: "12px" }}>
                <SectionCard
                  icon={<UserCircle2 size={17} />}
                  title="Customer Info"
                  subtitle="Who owns the vehicle and how to reach them"
                  accent="blue"
                >
                  <div style={twoColGrid(isMobile)}>
                    <InputBlock
                      label="Customer Name"
                      value={form.customerName}
                      onChange={(value) => updateField("customerName", value)}
                      placeholder="Full customer name"
                      validation={customerNameState.hint}
                    />
                    <InputBlock
                      label="Phone"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 555-5555"
                      validation={phoneState.hint}
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <InputBlock
                      label="Customer Address"
                      value={form.customerAddress}
                      onChange={(value) => updateField("customerAddress", value)}
                      placeholder="Full address"
                      validation={addressState.hint}
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <InputBlock
                      label="Email"
                      value={form.email}
                      onChange={(value) => updateField("email", value)}
                      placeholder="Optional"
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<CarFront size={17} />}
                  title="Vehicle Info"
                  subtitle="Vehicle identity and front desk intake details"
                  accent="emerald"
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "2fr 220px",
                      gap: "12px",
                      alignItems: "end",
                    }}
                  >
                    <InputBlock
                      label="VIN"
                      value={form.vin}
                      onChange={handleDirectVinChange}
                      placeholder="17-character VIN"
                      validation={vinState.hint}
                    />

                    <div>
                      <div style={miniLabel}>VIN Tools</div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          style={{
                            ...primaryButton,
                            opacity: isScanning || isDecodingVin ? 0.85 : 1,
                          }}
                          onClick={handleVinScan}
                          disabled={isScanning || isDecodingVin}
                        >
                          {isScanning ? (
                            <LoaderCircle size={15} className="spin" />
                          ) : (
                            <ScanLine size={15} />
                          )}
                          {isScanning ? "Scanning..." : "Scan VIN"}
                        </button>
                        <button
                          type="button"
                          style={ghostButton}
                          onClick={handlePrefillDemo}
                          disabled={isScanning || isDecodingVin}
                        >
                          <Camera size={15} />
                          Demo Fill
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      borderRadius: "12px",
                      border: `1px solid ${THEME.lineFaint}`,
                      background: "rgba(5,12,20,0.42)",
                      padding: "10px 12px",
                      color: THEME.textSoft,
                      fontSize: "0.84rem",
                      fontWeight: 600,
                    }}
                  >
                    {scanMessage}
                  </div>

                  {pendingVin && (
                    <div
                      style={{
                        marginTop: "10px",
                        borderRadius: "16px",
                        border: `1px solid ${THEME.blueLine}`,
                        background: "rgba(8,18,31,0.88)",
                        padding: "12px",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                          marginBottom: "10px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "0.92rem",
                              fontWeight: 800,
                              color: THEME.text,
                            }}
                          >
                            Confirm detected VIN
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: THEME.textMuted,
                              marginTop: "2px",
                            }}
                          >
                            Review before this VIN is accepted and decoded.
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              borderRadius: 999,
                              padding: "7px 10px",
                              fontSize: "0.76rem",
                              fontWeight: 800,
                              color: THEME.blue,
                              background: THEME.blueSoft,
                              border: `1px solid ${THEME.blueLine}`,
                            }}
                          >
                            Confirmation Required
                          </div>

                          <div
                            style={{
                              borderRadius: 999,
                              padding: "7px 10px",
                              fontSize: "0.76rem",
                              fontWeight: 800,
                              color: THEME.textSoft,
                              background: "rgba(255,255,255,0.05)",
                              border: `1px solid ${THEME.lineSoft}`,
                            }}
                          >
                            {pendingVin.confidenceLabel}
                          </div>
                        </div>
                      </div>

                      <InputBlock
                        label="Detected VIN"
                        value={pendingVinInput}
                        onChange={(value) =>
                          setPendingVinInput(normalizeVinStrict(value))
                        }
                        placeholder="Confirm or edit the VIN"
                        validation={pendingVinValidation ?? undefined}
                      />

                      <div
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            ...primaryButton,
                            opacity:
                              pendingVinValidation || isDecodingVin ? 0.82 : 1,
                            cursor:
                              pendingVinValidation || isDecodingVin
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={handleConfirmPendingVin}
                          disabled={Boolean(pendingVinValidation) || isDecodingVin}
                        >
                          {isDecodingVin ? (
                            <LoaderCircle size={15} className="spin" />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                          {isDecodingVin ? "Confirming..." : "Confirm VIN"}
                        </button>

                        <button
                          type="button"
                          style={ghostButton}
                          onClick={handleRescanVin}
                          disabled={isScanning || isDecodingVin}
                        >
                          <ScanLine size={15} />
                          Rescan
                        </button>

                        <button
                          type="button"
                          style={ghostButton}
                          onClick={handleDismissPendingVin}
                          disabled={isScanning || isDecodingVin}
                        >
                          <ArrowLeft size={15} />
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {(isScanning || scanPreviewUrl) && (
                    <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
                      {isScanning && (
                        <div
                          style={{
                            borderRadius: "12px",
                            border: `1px solid ${THEME.lineFaint}`,
                            background: "rgba(5,12,20,0.42)",
                            padding: "10px 12px",
                          }}
                        >
                          <div
                            style={{
                              height: 8,
                              borderRadius: 999,
                              overflow: "hidden",
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              marginBottom: 6,
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(4, ocrProgress)}%`,
                                height: "100%",
                                background:
                                  "linear-gradient(90deg, rgba(39,217,191,0.95) 0%, rgba(59,130,246,0.95) 100%)",
                                transition: "width 160ms ease",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: THEME.textMuted,
                              fontWeight: 700,
                            }}
                          >
                            OCR progress: {ocrProgress}%
                          </div>
                        </div>
                      )}

                      {scanPreviewUrl && (
                        <div
                          style={{
                            borderRadius: "12px",
                            border: `1px solid ${THEME.lineFaint}`,
                            background: "rgba(5,12,20,0.42)",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={scanPreviewUrl}
                            alt="VIN scan preview"
                            style={{
                              display: "block",
                              width: "100%",
                              maxHeight: 180,
                              objectFit: "contain",
                              background: "#07111B",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ ...twoColGrid(isMobile), marginTop: "12px" }}>
                    <InputBlock
                      label="Year"
                      value={form.year}
                      onChange={(value) =>
                        updateField("year", digitsOnly(value).slice(0, 4))
                      }
                      placeholder="2018"
                    />
                    <InputBlock
                      label="Make"
                      value={form.make}
                      onChange={(value) => updateField("make", value)}
                      placeholder="Ford"
                    />
                  </div>

                  <div style={{ ...twoColGrid(isMobile), marginTop: "12px" }}>
                    <InputBlock
                      label="Model"
                      value={form.model}
                      onChange={(value) => updateField("model", value)}
                      placeholder="F-150"
                      validation={vehicleIdentityState.hint}
                    />
                    <InputBlock
                      label="Plate"
                      value={form.plate}
                      onChange={(value) => updateField("plate", value.toUpperCase())}
                      placeholder="License plate"
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <InputBlock
                      label="Mileage In"
                      value={form.mileageIn}
                      onChange={handleMileageChange}
                      placeholder="Current mileage"
                      validation={mileageState.hint}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<Wrench size={17} />}
                  title="Visit Info"
                  subtitle="What brought the vehicle in and what the customer is asking for"
                  accent="orange"
                >
                  <TextAreaBlock
                    label="Primary Concern"
                    value={form.concern}
                    onChange={(value) => updateField("concern", value)}
                    placeholder="Customer states..."
                    validation={concernState.hint}
                  />

                  <div style={{ marginTop: "12px" }}>
                    <TextAreaBlock
                      label="Requested Work / Authorization Notes"
                      value={form.requestedWork}
                      onChange={(value) => updateField("requestedWork", value)}
                      placeholder="Requested repairs, diag request, tow-in notes, approvals, etc."
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <TextAreaBlock
                      label="Internal Notes"
                      value={form.notes}
                      onChange={(value) => updateField("notes", value)}
                      placeholder="Internal shop notes..."
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<CheckCircle2 size={17} />}
                  title="Assignment"
                  subtitle="Current intake state and internal shop assignment"
                  accent="blue"
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <SelectBlock
                      label="Job Status"
                      value={form.status}
                      onChange={(value) => updateField("status", value as JobStatus)}
                      options={[
                        "New Intake",
                        "Waiting on Approval",
                        "Approved",
                        "In Progress",
                        "Waiting on Parts",
                        "Ready for Pickup",
                      ]}
                    />
                    <SelectBlock
                      label="Approval Status"
                      value={form.approvalStatus}
                      onChange={(value) =>
                        updateField("approvalStatus", value as ApprovalStatus)
                      }
                      options={["Not Sent", "Pending", "Approved"]}
                    />
                    <SelectBlock
                      label="Service Advisor"
                      value={form.advisor}
                      onChange={(value) => updateField("advisor", value)}
                      options={TEAM_MEMBERS.map((member) => member.name)}
                    />
                    <SelectBlock
                      label="Assigned Technician"
                      value={form.technician}
                      onChange={(value) => updateField("technician", value)}
                      options={["Unassigned", ...TEAM_MEMBERS.map((member) => member.name)]}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={<Shield size={17} />}
                  title="Intake Readiness"
                  subtitle="Progress, summary, and missing items in one full-width review block"
                  accent="blue"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: THEME.textSoft,
                      }}
                    >
                      {intakeProgress}% Intake Ready
                    </div>

                    <div
                      style={{
                        borderRadius: "999px",
                        padding: "8px 12px",
                        border: `1px solid ${
                          isReadyToCreate ? THEME.emeraldLine : THEME.orangeLine
                        }`,
                        background: isReadyToCreate
                          ? THEME.emeraldSoft
                          : THEME.orangeSoft,
                        color: isReadyToCreate ? THEME.emerald : THEME.orange,
                        fontSize: "0.83rem",
                        fontWeight: 800,
                      }}
                    >
                      {isReadyToCreate ? "Ready to create job" : "Intake in progress"}
                    </div>
                  </div>

                  <div
                    style={{
                      height: "14px",
                      borderRadius: "999px",
                      background: "rgba(5,12,20,0.8)",
                      border: `1px solid ${THEME.lineFaint}`,
                      overflow: "hidden",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: `${intakeProgress}%`,
                        height: "100%",
                        background:
                          intakeProgress >= 100
                            ? "linear-gradient(90deg, #27D9BF 0%, #4EF0D8 100%)"
                            : "linear-gradient(90deg, #3B82F6 0%, #72A8FF 100%)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "repeat(3, minmax(0, 1fr))",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <SummaryTile label="Customer" value={form.customerName || "Not entered"} />
                    <SummaryTile label="Address" value={form.customerAddress || "Not entered"} />
                    <SummaryTile
                      label="Vehicle"
                      value={
                        [form.year, form.make, form.model].filter(Boolean).join(" ") ||
                        "Not entered"
                      }
                    />
                    <SummaryTile label="VIN" value={form.vin || "Not entered"} />
                    <SummaryTile label="Mileage" value={form.mileageIn || "Not entered"} />
                    <SummaryTile label="Advisor" value={form.advisor || "Not selected"} />
                    <SummaryTile
                      label="Technician"
                      value={form.technician || "Unassigned"}
                    />
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${THEME.lineSoft}`,
                      paddingTop: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 800,
                        color: THEME.textSoft,
                        marginBottom: "10px",
                      }}
                    >
                      Items still needed
                    </div>

                    <div style={{ display: "grid", gap: "8px" }}>
                      {readinessItems.map((item) => {
                        const colors = toneColor(item.tone);
                        return (
                          <div
                            key={item.key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              padding: "12px 14px",
                              borderRadius: "14px",
                              border: `1px solid ${colors.line}`,
                              background: colors.soft,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                minWidth: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "999px",
                                  background: colors.text,
                                  boxShadow: `0 0 12px ${colors.text}`,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  color: THEME.text,
                                  fontWeight: 700,
                                  fontSize: "0.92rem",
                                }}
                              >
                                {item.label}
                              </span>
                            </div>

                            <span
                              style={{
                                color: colors.text,
                                fontSize: "0.82rem",
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {submitError ? (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 12px",
                          borderRadius: "12px",
                          background: "rgba(255,107,122,0.12)",
                          border: "1px solid rgba(255,107,122,0.28)",
                          color: THEME.red,
                          fontSize: "0.82rem",
                          fontWeight: 800,
                        }}
                      >
                        {submitError}
                      </div>
                    ) : null}
                  </div>
                </SectionCard>

                <div
                  style={{
                    background: THEME.card,
                    border: THEME.borderSoft,
                    borderRadius: "20px",
                    padding: isMobile ? "14px 12px" : "16px 18px",
                    boxShadow: THEME.cardShadow,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      Action Bar
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        color: THEME.textMuted,
                        marginTop: "3px",
                      }}
                    >
                      Strict VIN extraction and server-side decode are now built into intake.
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button type="button" style={ghostButton} onClick={() => router.back()}>
                      <ArrowLeft size={15} />
                      Back
                    </button>
                    <button type="button" style={ghostButton} onClick={handleSaveDraft}>
                      <Save size={15} />
                      Save Draft
                    </button>
                    <button
                      type="button"
                      style={{
                        ...primaryButton,
                        opacity: isReadyToCreate && !isCreating ? 1 : 0.82,
                        cursor:
                          isReadyToCreate && !isCreating ? "pointer" : "not-allowed",
                      }}
                      onClick={handleCreateJob}
                      disabled={!isReadyToCreate || isCreating}
                    >
                      <Plus size={15} />
                      {isCreating ? "Creating..." : "Create Job"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

function TopStatusBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        minHeight: "56px",
        borderRadius: "14px",
        border: `1px solid ${THEME.lineSoft}`,
        background:
          "linear-gradient(180deg, rgba(14,27,44,0.72) 0%, rgba(8,16,27,0.62) 100%)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 14px",
      }}
    >
      <span
        style={{
          fontWeight: 900,
          color: THEME.text,
          fontSize: "0.96rem",
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </span>
      <span
        style={{
          color: THEME.textSoft,
          fontSize: "0.83rem",
          fontWeight: 700,
          opacity: 0.92,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  accent: Accent;
  children: ReactNode;
}) {
  const accentMap = {
    blue: THEME.blueLine,
    orange: THEME.orangeLine,
    emerald: THEME.emeraldLine,
  };

  return (
    <section
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: "3px",
          background: accentMap[accent],
        }}
      />

      <div style={{ padding: "14px 14px 12px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div
            style={{
              color: THEME.textSoft,
              marginTop: "2px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div>
            <div
              style={{
                fontSize: "1.02rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: THEME.text,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "0.86rem",
                color: THEME.textMuted,
                marginTop: "2px",
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>{children}</div>
      </div>
    </section>
  );
}

function InputBlock({
  label,
  value,
  onChange,
  placeholder,
  validation,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  validation?: string;
}) {
  const hasValidation = Boolean(validation);

  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputBase,
          border: hasValidation
            ? `1px solid ${THEME.redLine}`
            : `1px solid ${THEME.lineSoft}`,
        }}
      />
      {validation ? (
        <div style={validationRow}>
          <AlertCircle size={13} />
          {validation}
        </div>
      ) : null}
    </div>
  );
}

function TextAreaBlock({
  label,
  value,
  onChange,
  placeholder,
  validation,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  validation?: string;
}) {
  const hasValidation = Boolean(validation);

  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputBase,
          minHeight: "116px",
          resize: "vertical",
          paddingTop: 12,
          border: hasValidation
            ? `1px solid ${THEME.redLine}`
            : `1px solid ${THEME.lineSoft}`,
          fontFamily: "inherit",
        }}
      />
      {validation ? (
        <div style={validationRow}>
          <AlertCircle size={13} />
          {validation}
        </div>
      ) : null}
    </div>
  );
}

function SelectBlock({
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
    <div>
      <div style={fieldLabel}>{label}</div>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputBase,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            paddingRight: 40,
          }}
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              style={{ background: "#08111B", color: "#F5FAFF" }}
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

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        borderRadius: "14px",
        border: `1px solid ${THEME.lineSoft}`,
        background:
          "linear-gradient(180deg, rgba(8,16,27,0.78) 0%, rgba(5,12,20,0.7) 100%)",
        padding: "12px 12px",
      }}
    >
      <div
        style={{
          color: THEME.textMuted,
          fontSize: "0.78rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: THEME.text,
          fontSize: "0.94rem",
          fontWeight: 800,
          lineHeight: 1.35,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function twoColGrid(isMobile: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  };
}

function toneColor(tone: StatusTone) {
  if (tone === "green") {
    return {
      text: THEME.emerald,
      soft: THEME.emeraldSoft,
      line: THEME.emeraldLine,
    };
  }

  if (tone === "yellow") {
    return {
      text: THEME.yellow,
      soft: THEME.yellowSoft,
      line: THEME.yellowLine,
    };
  }

  return {
    text: THEME.red,
    soft: THEME.redSoft,
    line: THEME.redLine,
  };
}

function evaluateCustomerName(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Required for intake.",
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Enter first and last name.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function evaluateAddress(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Required for intake.",
    };
  }

  if (trimmed.length < 8) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Enter the customer's full address.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function evaluatePhone(value: string): FieldState {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Required for intake.",
    };
  }

  if (digits.length < 10) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Enter a 10-digit phone number.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function evaluateVin(value: string): FieldState {
  if (!value.trim()) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Required for intake.",
    };
  }

  if (!isValidVin(value.trim())) {
    return {
      tone: "yellow",
      status: "Review",
      hint: "Enter or confirm the 17-character VIN.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function evaluateVehicleIdentity(
  year: string,
  make: string,
  model: string,
): FieldState {
  const count = [year, make, model].filter((item) => item.trim()).length;

  if (count === 0) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Add year, make, and model.",
    };
  }

  if (count < 3) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Add year, make, and model.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function evaluateMileage(value: string): FieldState {
  if (!value.trim()) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Mileage in is required.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function evaluateConcern(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Missing",
      hint: "Required for intake.",
    };
  }

  if (trimmed.length < 8) {
    return {
      tone: "yellow",
      status: "Partial",
      hint: "Add enough detail for intake.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
  };
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatMileage(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeVinStrict(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/[IOQ]/g, "")
    .slice(0, 17);
}

function normalizeVinCandidateWithMeta(value: string) {
  let substitutions = 0;

  const normalized = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .split("")
    .map((char) => {
      if (VIN_SUBSTITUTION_MAP[char]) {
        substitutions += 1;
        return VIN_SUBSTITUTION_MAP[char];
      }
      return char;
    })
    .join("");

  return {
    value: normalized,
    substitutions,
  };
}

function isValidVin(value: string) {
  return VIN_ALLOWED_REGEX.test(value);
}

async function decodeVinViaAppRoute(
  vin: string,
  modelYear?: string,
): Promise<VehicleDecode> {
  const cleanVin = normalizeVinStrict(vin);

  if (!isValidVin(cleanVin)) {
    throw new Error("VIN decode could not run because the VIN is invalid.");
  }

  const response = await fetch("/api/vin-decode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vin: cleanVin,
      modelYear: modelYear?.trim() || "",
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "VIN decode failed.");
  }

  return {
    year: String(payload?.year ?? "").trim(),
    make: String(payload?.make ?? "").trim(),
    model: String(payload?.model ?? "").trim(),
  };
}

async function scanVinFromImage(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<VinCandidate> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", 1, {
    logger: (message: { progress?: number }) => {
      if (typeof message.progress === "number") {
        onProgress?.(Math.round(message.progress * 100));
      }
    },
  });

  try {
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHJKLMNPRSTUVWXYZ0123456789",
      preserve_interword_spaces: "0",
      user_defined_dpi: "300",
    });

    const processedCanvas = await preprocessVinImage(file);
    const processedPass = await worker.recognize(processedCanvas);
    const rawImage = await loadImage(file);
    const rawPass = await worker.recognize(rawImage);

    const processedResult: OcrPassResult = {
      text: processedPass.data.text || "",
    };
    const rawResult: OcrPassResult = {
      text: rawPass.data.text || "",
    };

    const bestVin = extractBestVinFromOcrPasses([processedResult, rawResult]);

    if (!bestVin) {
      throw new Error(
        "Could not read a reliable VIN from that photo. Try a closer, sharper image with the VIN plate filling most of the frame and as little extra text as possible.",
      );
    }

    return bestVin;
  } finally {
    await worker.terminate();
    onProgress?.(100);
  }
}

async function preprocessVinImage(file: File): Promise<HTMLCanvasElement> {
  const image = await loadImage(file);

  const maxWidth = 2200;
  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image for OCR.");

  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const contrasted = gray > 135 ? 255 : 0;
    data[i] = contrasted;
    data[i + 1] = contrasted;
    data[i + 2] = contrasted;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be loaded."));
    };

    image.src = url;
  });
}

function extractBestVinFromOcrPasses(passes: OcrPassResult[]): VinCandidate | null {
  const candidates = new Map<string, VinCandidate>();

  passes.forEach((pass, passIndex) => {
    const lines = splitOcrLines(pass.text);

    lines.forEach((line, lineIndex) => {
      const rawLine = line.trim().toUpperCase();
      if (!rawLine) return;

      const lineCandidates = extractCandidatesFromLine(
        rawLine,
        lineIndex + passIndex * 1000,
      );

      for (const candidate of lineCandidates) {
        const existing = candidates.get(candidate.vin);
        if (!existing || candidate.score > existing.score) {
          candidates.set(candidate.vin, candidate);
        }
      }
    });
  });

  const ranked = Array.from(candidates.values())
    .sort((a, b) => b.score - a.score)
    .filter((candidate) => candidate.score >= 8);

  return ranked[0] ?? null;
}

function splitOcrLines(text: string) {
  return text
    .toUpperCase()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractCandidatesFromLine(rawLine: string, lineIndex: number): VinCandidate[] {
  const candidates: VinCandidate[] = [];

  if (shouldRejectLineEarly(rawLine)) {
    return candidates;
  }

  const compactRaw = rawLine.replace(VIN_LINE_CLEAN_REGEX, "");

  if (compactRaw.length < 11 || compactRaw.length > 28) {
    return candidates;
  }

  const candidateWindows = buildCandidateWindowsFromLine(rawLine);

  for (const windowText of candidateWindows) {
    const normalized = normalizeVinCandidateWithMeta(windowText);
    const vin = normalized.value;

    if (!isValidVin(vin)) continue;
    if (normalized.substitutions > 2) continue;
    if (!looksLikeRealVin(vin)) continue;

    const checksumValid = isVinChecksumValid(vin);
    const score = scoreVinCandidate({
      vin,
      substitutions: normalized.substitutions,
      rawLine,
      checksumValid,
    });

    if (score < 8) continue;

    candidates.push({
      vin,
      substitutions: normalized.substitutions,
      lineIndex,
      rawLine,
      compactSource: compactRaw,
      score,
      checksumValid,
    });
  }

  return dedupeCandidateList(candidates);
}

function shouldRejectLineEarly(rawLine: string) {
  const tokenCount = rawLine
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;

  if (tokenCount > 6) return true;

  const lettersOnly = rawLine.replace(/[^A-Z]/g, "");
  const stopWordHits = VIN_STOP_WORDS.filter((word) => lettersOnly.includes(word)).length;

  if (stopWordHits >= 2) return true;

  const compact = rawLine.replace(VIN_LINE_CLEAN_REGEX, "");
  if (compact.length > 28) return true;

  return false;
}

function buildCandidateWindowsFromLine(rawLine: string) {
  const set = new Set<string>();

  const splitPieces = rawLine
    .split(/[\s|:/\\\-_,.;]+/)
    .map((piece) => piece.trim())
    .filter(Boolean);

  for (const piece of splitPieces) {
    const compactPiece = piece.replace(VIN_LINE_CLEAN_REGEX, "");
    if (compactPiece.length === 17) {
      set.add(compactPiece);
    }
  }

  const compactLine = rawLine.replace(VIN_LINE_CLEAN_REGEX, "");
  if (compactLine.length === 17) {
    set.add(compactLine);
  }

  if (compactLine.length > 17 && compactLine.length <= 22) {
    for (let i = 0; i <= compactLine.length - 17; i += 1) {
      set.add(compactLine.slice(i, i + 17));
    }
  }

  return Array.from(set);
}

function looksLikeRealVin(vin: string) {
  const digitCount = (vin.match(/\d/g) || []).length;
  const alphaCount = (vin.match(/[A-HJ-NPR-Z]/g) || []).length;

  if (digitCount < 5) return false;
  if (alphaCount < 5) return false;
  if (/([A-HJ-NPR-Z0-9])\1{3,}/.test(vin)) return false;
  if (/^[0-9]{17}$/.test(vin)) return false;
  if (/^[A-HJ-NPR-Z]{17}$/.test(vin)) return false;

  const firstThree = vin.slice(0, 3);
  if (!/^[A-HJ-NPR-Z0-9]{3}$/.test(firstThree)) return false;

  const lastSix = vin.slice(-6);
  if (!/\d{3,}/.test(lastSix)) return false;

  return true;
}

function scoreVinCandidate(input: {
  vin: string;
  substitutions: number;
  rawLine: string;
  checksumValid: boolean;
}) {
  const { vin, substitutions, rawLine, checksumValid } = input;
  let score = 0;

  if (vin.length === 17) score += 2;
  if (isValidVin(vin)) score += 2;
  if (looksLikeRealVin(vin)) score += 2;
  if (substitutions === 0) score += 2;
  else if (substitutions === 1) score += 1;
  if (checksumValid) score += 2;

  const compactLine = rawLine.replace(VIN_LINE_CLEAN_REGEX, "");
  if (compactLine === vin) score += 2;
  else if (compactLine.length <= 20) score += 1;

  const spaces = (rawLine.match(/\s/g) || []).length;
  if (spaces <= 2) score += 1;

  const stopWordHits = VIN_STOP_WORDS.filter((word) => rawLine.includes(word)).length;
  score -= stopWordHits * 2;

  return score;
}

function dedupeCandidateList(candidates: VinCandidate[]) {
  const bestByVin = new Map<string, VinCandidate>();

  for (const candidate of candidates) {
    const existing = bestByVin.get(candidate.vin);
    if (!existing || candidate.score > existing.score) {
      bestByVin.set(candidate.vin, candidate);
    }
  }

  return Array.from(bestByVin.values());
}

function buildVinConfidenceLabel(candidate: VinCandidate) {
  if (candidate.score >= 11) return "High confidence";
  if (candidate.score >= 9) return "Medium confidence";
  return "Review carefully";
}

function isVinChecksumValid(vin: string) {
  if (!isValidVin(vin)) return false;

  const transliteration: Record<string, number> = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    R: 9,
    S: 2,
    T: 3,
    U: 4,
    V: 5,
    W: 6,
    X: 7,
    Y: 8,
    Z: 9,
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let total = 0;

  for (let i = 0; i < vin.length; i += 1) {
    const char = vin[i];
    const value = transliteration[char];
    if (typeof value !== "number") return false;
    total += value * weights[i];
  }

  const remainder = total % 11;
  const expectedCheck = remainder === 10 ? "X" : String(remainder);

  return vin[8] === expectedCheck;
}

const fieldLabel: CSSProperties = {
  fontSize: "0.77rem",
  fontWeight: 800,
  color: THEME.text,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "6px",
};

const miniLabel: CSSProperties = {
  ...fieldLabel,
  marginBottom: "8px",
};

const inputBase: CSSProperties = {
  width: "100%",
  borderRadius: "14px",
  background:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(4,10,18,1) 100%)",
  color: THEME.text,
  padding: "13px 14px",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
};

const validationRow: CSSProperties = {
  marginTop: "7px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color: THEME.red,
  fontSize: "0.8rem",
  fontWeight: 700,
};

const ghostButton: CSSProperties = {
  border: `1px solid ${THEME.lineSoft}`,
  background:
    "linear-gradient(180deg, rgba(10,20,33,0.92) 0%, rgba(7,13,22,0.96) 100%)",
  color: THEME.text,
  borderRadius: "14px",
  padding: "11px 14px",
  fontSize: "0.9rem",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const primaryButton: CSSProperties = {
  border: "1px solid rgba(89,155,255,0.8)",
  background: THEME.buttonBlue,
  color: "#F7FBFF",
  borderRadius: "14px",
  padding: "11px 14px",
  fontSize: "0.9rem",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 10px 24px rgba(29,107,229,0.28)",
};