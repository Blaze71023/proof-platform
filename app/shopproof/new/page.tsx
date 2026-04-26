"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowLeft,
  CarFront,
  CheckCircle2,
  ChevronDown,
  FileText,
  LoaderCircle,
  Save,
  Search,
  Shield,
  UserCircle2,
  Wrench,
} from "lucide-react";

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
  diagnosticFee: string;
  writtenBy: string;
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
  detail?: string;
};

type VehicleDecode = {
  year: string;
  make: string;
  model: string;
};

type ShopRow = { id: string };
type CustomerRow = { id: string; phone?: string | null };
type VehicleRow = { id: string };
type JobRow = { id: string };

type LocalJobRecord = {
  id: string;
  shop_id: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  status: "New Intake";
  approval_state: "Not Requested";
  concern: string;
  notes: string;
  findings: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  vehicles: {
    year: string;
    make: string;
    model: string;
    vin: string;
    plate: string | null;
    color: string | null;
    customer_name: string;
    customer_phone: string;
    mileage_in: string | null;
  };
};

const TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Thomas", role: "Writer" },
  { id: "2", name: "Mike", role: "Writer" },
  { id: "3", name: "Chris", role: "Writer" },
  { id: "4", name: "Front Desk", role: "Writer" },
];

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
  diagnosticFee: "135.00",
  writtenBy: "Thomas",
};

const DRAFT_STORAGE_KEY = "shopproof-new-job-draft";
const JOB_STORAGE_KEY = "shopproof_jobs";

const THEME = {
  page:
    "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell:
    "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  shellOverlay:
    "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 48%)",
  panel:
    "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  input:
    "linear-gradient(180deg, rgba(253,254,255,0.98) 0%, rgba(245,249,253,1) 100%)",
  topbar:
    "linear-gradient(180deg, rgba(234,240,247,0.92) 0%, rgba(223,232,242,0.88) 100%)",
  statusBar:
    "linear-gradient(180deg, rgba(21,34,51,0.98) 0%, rgba(16,26,41,0.995) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  line: "rgba(28,47,67,0.11)",
  lineStrong: "rgba(28,47,67,0.18)",
  lineFaint: "rgba(28,47,67,0.07)",
  shellBorder: "1px solid rgba(69, 94, 118, 0.20)",
  panelBorder: "1px solid rgba(84, 108, 131, 0.17)",
  cardBorder: "1px solid rgba(92, 116, 140, 0.14)",
  inputBorder: "1px solid rgba(101, 126, 151, 0.18)",
  shellShadow: "0 30px 80px rgba(27, 39, 54, 0.16)",
  panelShadow: "0 16px 34px rgba(28, 42, 59, 0.09)",
  cardShadow: "0 12px 24px rgba(27, 40, 56, 0.06)",
  inputInset:
    "inset 0 1px 0 rgba(255,255,255,0.78), inset 0 -1px 0 rgba(215,226,237,0.32)",
  blue: "#2563eb",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.10)",
  blueLine: "rgba(37,99,235,0.28)",
  blueGlow: "rgba(37,99,235,0.18)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.10)",
  emeraldLine: "rgba(5,150,105,0.22)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.10)",
  redLine: "rgba(220,38,38,0.22)",
  yellow: "#ca8a04",
  yellowSoft: "rgba(202,138,4,0.12)",
  yellowLine: "rgba(202,138,4,0.22)",
  buttonBlue:
    "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
};

export default function ShopProofNewPage() {
  const router = useRouter();

  const [width, setWidth] = useState(1440);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [scanMessage, setScanMessage] = useState(
    "Enter the VIN manually, then use Decode VIN to confirm the vehicle."
  );
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [lastDecodedVin, setLastDecodedVin] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();

    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as Partial<FormState>;
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore invalid saved drafts
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 820;

  const customerNameState = useMemo(
    () => evaluateCustomerName(form.customerName),
    [form.customerName]
  );
  const addressState = useMemo(
    () => evaluateAddress(form.customerAddress),
    [form.customerAddress]
  );
  const phoneState = useMemo(() => evaluatePhone(form.phone), [form.phone]);
  const vinState = useMemo(() => evaluateVin(form.vin), [form.vin]);
  const vehicleIdentityState = useMemo(
    () => evaluateVehicleIdentity(form.year, form.make, form.model),
    [form.year, form.make, form.model]
  );
  const mileageState = useMemo(
    () => evaluateMileage(form.mileageIn),
    [form.mileageIn]
  );
  const concernState = useMemo(
    () => evaluateConcern(form.concern),
    [form.concern]
  );
  const diagnosticFeeState = useMemo(
    () => evaluateDiagnosticFee(form.diagnosticFee),
    [form.diagnosticFee]
  );
  const writtenByState = useMemo(
    () => evaluateWrittenBy(form.writtenBy),
    [form.writtenBy]
  );

  const photoSetupState = useMemo<FieldState>(() => {
    if (!form.vin.trim() || !form.customerName.trim()) {
      return {
        tone: "red",
        status: "Condition-photo setup locked",
        hint: "Finish the customer and vehicle identity first so intake photos are tied to the right record.",
      };
    }

    if (!form.mileageIn.trim()) {
      return {
        tone: "yellow",
        status: "Photo setup nearly ready",
        hint: "Add mileage in before moving to the condition photo step.",
      };
    }

    return {
      tone: "green",
      status: "Condition-photo step ready",
      hint: "After saving intake, the next stage is the required drop-off photo set.",
    };
  }, [form.customerName, form.vin, form.mileageIn]);

  const canDecodeVin = useMemo(() => isValidVin(form.vin), [form.vin]);

  const readinessItems = useMemo<ReadinessItem[]>(
    () => [
      {
        key: "customer",
        label: "Customer name",
        tone: customerNameState.tone,
        status: customerNameState.status,
        detail: customerNameState.hint,
      },
      {
        key: "address",
        label: "Customer address",
        tone: addressState.tone,
        status: addressState.status,
        detail: addressState.hint,
      },
      {
        key: "phone",
        label: "Phone number",
        tone: phoneState.tone,
        status: phoneState.status,
        detail: phoneState.hint,
      },
      {
        key: "vin",
        label: "VIN",
        tone: vinState.tone,
        status: vinState.status,
        detail: vinState.hint,
      },
      {
        key: "vehicle",
        label: "Year / Make / Model",
        tone: vehicleIdentityState.tone,
        status: vehicleIdentityState.status,
        detail: vehicleIdentityState.hint,
      },
      {
        key: "mileage",
        label: "Mileage in",
        tone: mileageState.tone,
        status: mileageState.status,
        detail: mileageState.hint,
      },
      {
        key: "concern",
        label: "Concern",
        tone: concernState.tone,
        status: concernState.status,
        detail: concernState.hint,
      },
      {
        key: "fee",
        label: "Diagnostic fee",
        tone: diagnosticFeeState.tone,
        status: diagnosticFeeState.status,
        detail: diagnosticFeeState.hint,
      },
      {
        key: "writtenBy",
        label: "Written by",
        tone: writtenByState.tone,
        status: writtenByState.status,
        detail: writtenByState.hint,
      },
      {
        key: "photoSetup",
        label: "Condition photo step",
        tone: photoSetupState.tone,
        status: photoSetupState.status,
        detail: photoSetupState.hint,
      },
    ],
    [
      customerNameState,
      addressState,
      phoneState,
      vinState,
      vehicleIdentityState,
      mileageState,
      concernState,
      diagnosticFeeState,
      writtenByState,
      photoSetupState,
    ]
  );

  const readinessPercent = useMemo(() => {
    const scoreMap: Record<StatusTone, number> = {
      red: 0,
      yellow: 0.5,
      green: 1,
    };

    const total = readinessItems.reduce((sum, item) => sum + scoreMap[item.tone], 0);
    return Math.round((total / readinessItems.length) * 100);
  }, [readinessItems]);

  const readyCount = useMemo(
    () => readinessItems.filter((item) => item.tone === "green").length,
    [readinessItems]
  );

  const isReadyToCreate = useMemo(() => {
    const requiredChecks = [
      customerNameState,
      addressState,
      phoneState,
      vinState,
      vehicleIdentityState,
      mileageState,
      concernState,
      diagnosticFeeState,
      writtenByState,
    ];

    return requiredChecks.every((item) => item.tone === "green");
  }, [
    customerNameState,
    addressState,
    phoneState,
    vinState,
    vehicleIdentityState,
    mileageState,
    concernState,
    diagnosticFeeState,
    writtenByState,
  ]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value: string) => {
    updateField("phone", formatPhone(value));
  };

  const handleVinChange = (value: string) => {
    const normalized = normalizeVinStrict(value);
    updateField("vin", normalized);

    if (!normalized) {
      setLastDecodedVin("");
      setScanMessage("Enter the VIN manually, then use Decode VIN to confirm the vehicle.");
      return;
    }

    if (normalized !== lastDecodedVin) {
      setScanMessage("VIN entered. Use Decode VIN to pull year, make, and model.");
    }
  };

  const handleMileageChange = (value: string) => {
    updateField("mileageIn", formatMileage(value));
  };

  const handleDiagnosticFeeChange = (value: string) => {
    updateField("diagnosticFee", formatMoneyInput(value));
  };

  const handleSaveDraft = () => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
      setSubmitError(null);
      setScanMessage("Draft saved locally in this browser session.");
    } catch {
      setScanMessage("Draft could not be saved locally on this device.");
    }
  };

  const handleDecodeVin = async () => {
    const cleanVin = normalizeVinStrict(form.vin);

    if (!isValidVin(cleanVin)) {
      setScanMessage("Enter a valid 17-character VIN before decoding.");
      return;
    }

    setIsDecodingVin(true);
    setSubmitError(null);
    setScanMessage(`Decoding VIN ${cleanVin}...`);

    try {
      const decoded = await decodeVinViaAppRoute(cleanVin, form.year.trim() || undefined);

      setForm((prev) => ({
        ...prev,
        vin: cleanVin,
        year: decoded.year || prev.year,
        make: decoded.make || prev.make,
        model: decoded.model || prev.model,
      }));

      setLastDecodedVin(cleanVin);

      const identity = [decoded.year, decoded.make, decoded.model].filter(Boolean).join(" ");

      setScanMessage(
        identity
          ? `VIN decoded successfully. ${cleanVin} → ${identity}`
          : "VIN confirmed. Decode returned limited data, so fill any missing vehicle details manually."
      );
    } catch (error) {
      console.error("VIN decode failed:", error);
      setLastDecodedVin("");
      setScanMessage(
        "VIN is valid, but decode is unavailable right now. Enter year, make, and model manually if needed."
      );
    } finally {
      setIsDecodingVin(false);
    }
  };

  const handleCreateIntake = async () => {
    if (!isReadyToCreate) {
      setSubmitError("Finish the required intake items before creating the intake record.");
      return;
    }

    setIsCreating(true);
    setSubmitError(null);

    const supabase = getSupabaseClient();

    const fallbackToLocal = (message?: string) => {
      try {
        const localJob = createLocalFallbackJob(form);
        saveLocalJob(localJob);
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        setScanMessage("Supabase create failed. Local fallback intake record created.");
        if (message) {
          setSubmitError(message);
        }
        router.push(`/shopproof/jobs/${localJob.id}`);
      } catch {
        setSubmitError(message || "Failed to create intake record.");
      }
    };

    if (!supabase) {
      fallbackToLocal("Supabase not configured.");
      setIsCreating(false);
      return;
    }

    try {
      let shopId: string | null = null;

      const { data: shops, error: shopLookupError } = await supabase
        .from("shops")
        .select("id")
        .limit(1);

      if (shopLookupError) throw shopLookupError;
      shopId = (shops as ShopRow[] | null)?.[0]?.id ?? null;

      if (!shopId) {
        const { data: newShop, error: createShopError } = await supabase
          .from("shops")
          .insert({ name: "Default Shop" })
          .select("id")
          .single();

        if (createShopError) throw createShopError;
        shopId = (newShop as ShopRow | null)?.id ?? null;
      }

      if (!shopId) {
        throw new Error("Shop could not be created.");
      }

      const normalizedName = form.customerName.trim();
      const normalizedAddress = form.customerAddress.trim();
      const normalizedPhone = form.phone.trim();
      const normalizedPhoneDigits = normalizedPhone.replace(/\D/g, "");
      const normalizedEmail = form.email.trim().toLowerCase();
      const normalizedVin = form.vin.trim().toUpperCase();
      const normalizedYear = form.year.trim();
      const normalizedMake = form.make.trim();
      const normalizedModel = form.model.trim();
      const normalizedPlate = form.plate.trim().toUpperCase();
      const normalizedConcern = form.concern.trim();
      const normalizedRequestedWork = form.requestedWork.trim();
      const normalizedMileage = form.mileageIn.trim();
      const normalizedFee = form.diagnosticFee.trim();
      const normalizedWrittenBy = form.writtenBy.trim();
      const normalizedNotes = form.notes.trim();

      let customerId: string | null = null;

      if (normalizedPhone) {
        const { data: phoneMatch, error: phoneLookupError } = await supabase
          .from("customers")
          .select("id, phone")
          .eq("shop_id", shopId)
          .eq("phone", normalizedPhone)
          .limit(1)
          .maybeSingle();

        if (phoneLookupError) throw phoneLookupError;
        customerId = (phoneMatch as CustomerRow | null)?.id ?? null;
      }

      if (!customerId && normalizedPhoneDigits.length === 10) {
        const phoneFormats = Array.from(
          new Set([normalizedPhoneDigits, formatPhone(normalizedPhoneDigits), normalizedPhone])
        );

        const { data: phoneMatches, error: phoneMatchesError } = await supabase
          .from("customers")
          .select("id, phone")
          .eq("shop_id", shopId)
          .in("phone", phoneFormats);

        if (phoneMatchesError) throw phoneMatchesError;
        customerId = (phoneMatches as CustomerRow[] | null)?.[0]?.id ?? null;
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
        const { data: customerRow, error: customerCreateError } = await supabase
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

        if (customerCreateError) throw customerCreateError;
        customerId = (customerRow as CustomerRow | null)?.id ?? null;
      } else {
        const { error: customerUpdateError } = await supabase
          .from("customers")
          .update({
            name: normalizedName,
            phone: normalizedPhone,
            email: normalizedEmail || null,
            address: normalizedAddress,
          })
          .eq("id", customerId);

        if (customerUpdateError) throw customerUpdateError;
      }

      if (!customerId) {
        throw new Error("Customer could not be created or found.");
      }

      let vehicleId: string | null = null;

      if (normalizedVin) {
        const { data: existingVehicle, error: vehicleLookupError } = await supabase
          .from("vehicles")
          .select("id")
          .eq("shop_id", shopId)
          .eq("vin", normalizedVin)
          .limit(1)
          .maybeSingle();

        if (vehicleLookupError) throw vehicleLookupError;
        vehicleId = (existingVehicle as VehicleRow | null)?.id ?? null;
      }

      if (!vehicleId) {
        const { data: vehicleRow, error: vehicleCreateError } = await supabase
          .from("vehicles")
          .insert({
            shop_id: shopId,
            customer_id: customerId,
            year: normalizedYear,
            make: normalizedMake,
            model: normalizedModel,
            vin: normalizedVin,
            plate: normalizedPlate || null,
          })
          .select("id")
          .single();

        if (vehicleCreateError) throw vehicleCreateError;
        vehicleId = (vehicleRow as VehicleRow | null)?.id ?? null;
      } else {
        const { error: vehicleUpdateError } = await supabase
          .from("vehicles")
          .update({
            customer_id: customerId,
            year: normalizedYear,
            make: normalizedMake,
            model: normalizedModel,
            vin: normalizedVin,
            plate: normalizedPlate || null,
          })
          .eq("id", vehicleId);

        if (vehicleUpdateError) throw vehicleUpdateError;
      }

      if (!vehicleId) {
        throw new Error("Vehicle was not created or found.");
      }

      const intakeNotes = [
        "SHOPPROOF INTAKE SNAPSHOT",
        `Customer Address: ${normalizedAddress || "N/A"}`,
        `Customer Email: ${normalizedEmail || "N/A"}`,
        `Mileage In: ${normalizedMileage || "N/A"}`,
        `Requested Work: ${normalizedRequestedWork || "N/A"}`,
        `Internal Notes: ${normalizedNotes || "N/A"}`,
        `Diagnostic Fee: ${normalizedFee || "N/A"}`,
        `Written By: ${normalizedWrittenBy || "N/A"}`,
        "Required Drop-Off Photos:",
        "- Exterior x4",
        "- Wheels x4",
        "- Interior x3 (seat/console, door panel, dash/odometer)",
      ].join("\n");

      const { data: insertedJob, error: jobError } = await supabase
        .from("jobs")
        .insert({
          shop_id: shopId,
          customer_id: customerId,
          vehicle_id: vehicleId,
          status: "New Intake",
          approval_state: "Not Requested",
          concern: normalizedConcern,
          notes: intakeNotes,
          findings: "",
          assigned_to: null,
        })
        .select("id")
        .single();

      if (jobError) throw jobError;

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);

      if ((insertedJob as JobRow | null)?.id) {
        router.push(`/shopproof/jobs/${insertedJob.id}`);
        return;
      }

      throw new Error("Intake record was inserted but no id was returned.");
    } catch (error) {
      console.error("Create intake error:", error);
      fallbackToLocal(getReadableErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 12% 0%, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 24%, rgba(37,99,235,0) 44%),
          radial-gradient(circle at 100% 0%, rgba(5,150,105,0.05) 0%, rgba(5,150,105,0.02) 18%, rgba(5,150,105,0) 34%),
          linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 22%, rgba(255,255,255,0) 42%),
          repeating-linear-gradient(
            0deg,
            rgba(19,32,49,0.026) 0px,
            rgba(19,32,49,0.026) 1px,
            transparent 1px,
            transparent 56px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(19,32,49,0.016) 0px,
            rgba(19,32,49,0.016) 1px,
            transparent 1px,
            transparent 88px
          ),
          ${THEME.page}
        `,
        color: THEME.text,
        padding: isMobile ? 8 : 18,
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          background: THEME.shell,
          border: THEME.shellBorder,
          borderRadius: 30,
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
            background: `
              ${THEME.shellOverlay},
              radial-gradient(circle at 14% 0%, rgba(37,99,235,0.08), transparent 28%),
              radial-gradient(circle at 86% 0%, rgba(5,150,105,0.05), transparent 24%)
            `,
          }}
        />

        <header
          style={{
            position: "relative",
            padding: isMobile ? "12px 12px 10px" : "16px 18px 14px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
            gap: isMobile ? 10 : 14,
            alignItems: "center",
            borderBottom: `1px solid ${THEME.line}`,
            background: THEME.topbar,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/shopproof")}
            style={iconButtonStyle()}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
                flexWrap: "wrap",
              }}
            >
              <div style={logoShieldStyle()}>
                <Shield size={20} color={THEME.blueStrong} strokeWidth={2.2} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: isMobile ? 20 : 28,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    color: THEME.text,
                  }}
                >
                  ShopPROOF Intake
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 13,
                    color: THEME.textMuted,
                  }}
                >
                  Vehicle drop-off documentation and intake authorization setup.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: isMobile ? "flex-start" : "flex-end",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button type="button" onClick={handleSaveDraft} style={ghostButtonStyle()}>
              <Save size={16} />
              Save Draft
            </button>
          </div>
        </header>

        <section
          style={{
            position: "relative",
            background: THEME.statusBar,
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
            padding: isMobile ? "12px" : "14px 18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.8fr 0.8fr 1fr",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(218,230,243,0.72)",
                  marginBottom: 8,
                  fontWeight: 800,
                }}
              >
                Intake readiness
              </div>
              <div
                style={{
                  height: 11,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div
                  style={{
                    width: `${readinessPercent}%`,
                    height: "100%",
                    background:
                      readinessPercent >= 100
                        ? "linear-gradient(90deg, #059669 0%, #10b981 100%)"
                        : readinessPercent >= 60
                        ? "linear-gradient(90deg, #ca8a04 0%, #eab308 100%)"
                        : "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                    transition: "width 180ms ease",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "rgba(218,230,243,0.76)",
                }}
              >
                {readyCount} of {readinessItems.length} checkpoints cleared
              </div>
            </div>

            <StatusPill
              label="Current state"
              value={isReadyToCreate ? "Ready to create intake" : "In progress"}
              tone={isReadyToCreate ? "green" : readinessPercent >= 60 ? "yellow" : "red"}
              dark
            />

            <StatusPill
              label="Next record step"
              value="Drop-off photo set"
              tone={photoSetupState.tone}
              dark
            />

            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(218,230,243,0.66)",
                  fontWeight: 800,
                  marginBottom: 5,
                }}
              >
                Intake guidance
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "rgba(240,246,252,0.92)",
                }}
              >
                Create the intake first. Findings, approvals, and release stay downstream.
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            padding: isMobile ? 10 : 18,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.45fr 0.95fr",
            gap: isMobile ? 10 : 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: isMobile ? 10 : 14 }}>
            <Panel
              title="Customer"
              subtitle="Who dropped the vehicle off and how the shop can reach them."
              icon={<UserCircle2 size={18} color={THEME.blueStrong} />}
            >
              <div style={fieldGridStyle(isMobile)}>
                <FieldShell
                  label="Customer name"
                  state={customerNameState}
                  required
                  input={
                    <TextInput
                      value={form.customerName}
                      onChange={(value) => updateField("customerName", value)}
                      placeholder="Full name"
                    />
                  }
                />

                <FieldShell
                  label="Phone"
                  state={phoneState}
                  required
                  input={
                    <TextInput
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="(318) 555-1212"
                      inputMode="tel"
                    />
                  }
                />

                <FieldShell
                  label="Customer address"
                  state={addressState}
                  required
                  input={
                    <TextInput
                      value={form.customerAddress}
                      onChange={(value) => updateField("customerAddress", value)}
                      placeholder="Street, city, state, ZIP"
                    />
                  }
                  wide
                />

                <FieldShell
                  label="Email"
                  state={{
                    tone: form.email.trim() ? "green" : "yellow",
                    status: form.email.trim() ? "Email recorded" : "Optional",
                    hint: "Helpful for sending documents and signatures later.",
                  }}
                  input={
                    <TextInput
                      value={form.email}
                      onChange={(value) => updateField("email", value)}
                      placeholder="name@email.com"
                      inputMode="email"
                    />
                  }
                  wide
                />
              </div>
            </Panel>

            <Panel
              title="Vehicle"
              subtitle="Identity of the vehicle being documented at drop-off."
              icon={<CarFront size={18} color={THEME.blueStrong} />}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1.2fr auto",
                    gap: 10,
                    alignItems: "end",
                  }}
                >
                  <FieldShell
                    label="VIN"
                    state={vinState}
                    required
                    input={
                      <TextInput
                        value={form.vin}
                        onChange={handleVinChange}
                        placeholder="17-character VIN"
                        autoCapitalize="characters"
                        spellCheck={false}
                      />
                    }
                  />

                  <button
                    type="button"
                    onClick={handleDecodeVin}
                    disabled={!canDecodeVin || isDecodingVin}
                    style={primaryGhostButtonStyle(!canDecodeVin || isDecodingVin)}
                  >
                    {isDecodingVin ? <LoaderCircle size={16} className="spin" /> : <Search size={16} />}
                    {isDecodingVin ? "Decoding..." : "Decode VIN"}
                  </button>
                </div>

                <InfoStrip tone={canDecodeVin ? "blue" : "yellow"} icon={<FileText size={15} />}>
                  {scanMessage}
                </InfoStrip>

                <div style={fieldGridStyle(isMobile)}>
                  <FieldShell
                    label="Year"
                    state={{
                      tone: form.year.trim() ? "green" : "yellow",
                      status: form.year.trim() ? "Year recorded" : "Needed for identity",
                    }}
                    input={
                      <TextInput
                        value={form.year}
                        onChange={(value) => updateField("year", value.replace(/[^\d]/g, "").slice(0, 4))}
                        placeholder="YYYY"
                        inputMode="numeric"
                      />
                    }
                  />

                  <FieldShell
                    label="Make"
                    state={{
                      tone: form.make.trim() ? "green" : "yellow",
                      status: form.make.trim() ? "Make recorded" : "Needed for identity",
                    }}
                    input={
                      <TextInput
                        value={form.make}
                        onChange={(value) => updateField("make", value)}
                        placeholder="Ford"
                      />
                    }
                  />

                  <FieldShell
                    label="Model"
                    state={vehicleIdentityState}
                    required
                    input={
                      <TextInput
                        value={form.model}
                        onChange={(value) => updateField("model", value)}
                        placeholder="F-150"
                      />
                    }
                  />

                  <FieldShell
                    label="Plate"
                    state={{
                      tone: form.plate.trim() ? "green" : "yellow",
                      status: form.plate.trim() ? "Plate recorded" : "Optional but recommended",
                    }}
                    input={
                      <TextInput
                        value={form.plate}
                        onChange={(value) => updateField("plate", value.toUpperCase())}
                        placeholder="ABC-123"
                        autoCapitalize="characters"
                      />
                    }
                  />

                  <FieldShell
                    label="Mileage in"
                    state={mileageState}
                    required
                    input={
                      <TextInput
                        value={form.mileageIn}
                        onChange={handleMileageChange}
                        placeholder="132,884"
                        inputMode="numeric"
                      />
                    }
                  />
                </div>
              </div>
            </Panel>

            <Panel
              title="Intake details"
              subtitle="What the customer is authorizing the shop to inspect at drop-off."
              icon={<Wrench size={18} color={THEME.blueStrong} />}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <FieldShell
                  label="Primary concern"
                  state={concernState}
                  required
                  input={
                    <TextArea
                      value={form.concern}
                      onChange={(value) => updateField("concern", value)}
                      placeholder="Customer concern / complaint"
                      rows={3}
                    />
                  }
                />

                <FieldShell
                  label="Requested work"
                  state={{
                    tone: form.requestedWork.trim() ? "green" : "yellow",
                    status: form.requestedWork.trim() ? "Request noted" : "Optional",
                    hint: "Use this when the customer asks for a specific inspection or repair direction.",
                  }}
                  input={
                    <TextArea
                      value={form.requestedWork}
                      onChange={(value) => updateField("requestedWork", value)}
                      placeholder="Specific requested inspection or service"
                      rows={3}
                    />
                  }
                />

                <FieldShell
                  label="Internal notes"
                  state={{
                    tone: form.notes.trim() ? "green" : "yellow",
                    status: form.notes.trim() ? "Notes recorded" : "Optional",
                    hint: "Use for intake-only context. Findings belong later.",
                  }}
                  input={
                    <TextArea
                      value={form.notes}
                      onChange={(value) => updateField("notes", value)}
                      placeholder="Observed at drop-off, customer statements, intake context"
                      rows={4}
                    />
                  }
                />

                <div style={fieldGridStyle(isMobile)}>
                  <FieldShell
                    label="Diagnostic fee"
                    state={diagnosticFeeState}
                    required
                    input={
                      <TextInput
                        value={form.diagnosticFee}
                        onChange={handleDiagnosticFeeChange}
                        placeholder="135.00"
                        inputMode="decimal"
                      />
                    }
                  />

                  <FieldShell
                    label="Written by"
                    state={writtenByState}
                    required
                    input={
                      <SelectInput
                        value={form.writtenBy}
                        onChange={(value) => updateField("writtenBy", value)}
                        options={TEAM_MEMBERS.map((member) => ({
                          value: member.name,
                          label: `${member.name} · ${member.role}`,
                        }))}
                      />
                    }
                  />
                </div>
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gap: isMobile ? 10 : 14 }}>
            <Panel
              title="Condition photo requirements"
              subtitle="This intake creates the record that the required drop-off photos attach to next."
              icon={<Shield size={18} color={THEME.emerald} />}
              accent="emerald"
            >
              <div style={{ display: "grid", gap: 12 }}>
                <ChecklistCard
                  title="Exterior"
                  countLabel="4 required"
                  items={["Front", "Rear", "Driver side", "Passenger side"]}
                />
                <ChecklistCard
                  title="Wheels"
                  countLabel="4 required"
                  items={[
                    "Driver front wheel",
                    "Passenger front wheel",
                    "Driver rear wheel",
                    "Passenger rear wheel",
                  ]}
                />
                <ChecklistCard
                  title="Interior"
                  countLabel="3 required"
                  items={[
                    "Seat and center console",
                    "Door panel",
                    "Dash / odometer with state noted",
                  ]}
                />

                <InfoStrip tone={photoSetupState.tone} icon={<CameraGlyph />}>
                  {photoSetupState.hint || "Save intake first, then continue into the required photo set."}
                </InfoStrip>
              </div>
            </Panel>

            <Panel
              title="Readiness board"
              subtitle="Minimum identity and authorization fields before the intake record is created."
              icon={<CheckCircle2 size={18} color={THEME.blueStrong} />}
              accent="blue"
            >
              <div style={{ display: "grid", gap: 10 }}>
                {readinessItems.map((item) => (
                  <ReadinessRow key={item.key} item={item} />
                ))}
              </div>
            </Panel>

            <Panel
              title="Create intake"
              subtitle="This creates the starting record. It does not add findings, approvals, or release yet."
              icon={<FileText size={18} color={THEME.blueStrong} />}
              accent="blue"
            >
              <div style={{ display: "grid", gap: 12 }}>
                {submitError ? (
                  <div style={errorBoxStyle()}>
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                ) : null}

                <div
                  style={{
                    borderRadius: 18,
                    border: THEME.cardBorder,
                    background: `
                      linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%),
                      linear-gradient(90deg, rgba(37,99,235,0.03) 0%, rgba(37,99,235,0) 36%)
                    `,
                    boxShadow: THEME.cardShadow,
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <SummaryLine label="Customer" value={form.customerName || "—"} />
                  <SummaryLine
                    label="Vehicle"
                    value={[form.year, form.make, form.model].filter(Boolean).join(" ") || "—"}
                  />
                  <SummaryLine label="VIN" value={form.vin || "—"} mono />
                  <SummaryLine label="Mileage in" value={form.mileageIn || "—"} />
                  <SummaryLine label="Concern" value={form.concern || "—"} />
                  <SummaryLine
                    label="Diagnostic fee"
                    value={form.diagnosticFee ? `$${form.diagnosticFee}` : "—"}
                  />
                  <SummaryLine label="Written by" value={form.writtenBy || "—"} />
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleCreateIntake}
                    disabled={isCreating}
                    style={primaryButtonStyle()}
                  >
                    {isCreating ? <LoaderCircle size={18} className="spin" /> : <FileText size={18} />}
                    {isCreating ? "Creating intake..." : "Create Intake Record"}
                  </button>

                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: THEME.textMuted,
                    }}
                  >
                    After this record is created, the next steps are the condition photos and intake authorization.
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 0.9s linear infinite;
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

function Panel({
  title,
  subtitle,
  icon,
  children,
  accent = "blue",
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  accent?: "blue" | "emerald";
}) {
  const accentColor = accent === "emerald" ? THEME.emeraldLine : THEME.blueLine;
  const accentGlow = accent === "emerald" ? "rgba(5,150,105,0.08)" : "rgba(37,99,235,0.08)";

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
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accentColor,
          opacity: 0.9,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          pointerEvents: "none",
          background: `linear-gradient(180deg, ${accentGlow} 0%, rgba(255,255,255,0) 100%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "15px 16px 13px",
          borderBottom: `1px solid ${THEME.lineFaint}`,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: THEME.cardBorder,
            background: "rgba(255,255,255,0.82)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.76)",
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize: 18,
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: THEME.text,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 1.45,
              color: THEME.textMuted,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", padding: 16 }}>{children}</div>
    </section>
  );
}

function FieldShell({
  label,
  state,
  input,
  required,
  wide,
}: {
  label: string;
  state: FieldState;
  input: ReactNode;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 8, gridColumn: wide ? "1 / -1" : undefined }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: THEME.textSoft,
          }}
        >
          {label}
        </div>
        {required ? <RequiredPill /> : null}
        <TinyStatus tone={state.tone} text={state.status} />
      </div>

      {input}

      {state.hint ? (
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.45,
            color: THEME.textMuted,
          }}
        >
          {state.hint}
        </div>
      ) : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
  autoCapitalize,
  spellCheck,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoCapitalize?: string;
  spellCheck?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      autoCapitalize={autoCapitalize}
      spellCheck={spellCheck}
      style={inputStyle()}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle(),
        resize: "vertical",
        minHeight: rows ? rows * 24 + 16 : 96,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle(true)}>
        {options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
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
  );
}

function ChecklistCard({
  title,
  countLabel,
  items,
}: {
  title: string;
  countLabel: string;
  items: string[];
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: THEME.cardBorder,
        background: `
          linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%),
          linear-gradient(90deg, rgba(5,150,105,0.025) 0%, rgba(5,150,105,0) 38%)
        `,
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          borderBottom: `1px solid ${THEME.lineFaint}`,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: THEME.text,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: THEME.emerald,
          }}
        >
          {countLabel}
        </div>
      </div>

      <div style={{ padding: 14, display: "grid", gap: 8 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 10,
              alignItems: "start",
              fontSize: 13,
              color: THEME.textSoft,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: THEME.emeraldSoft,
                border: `1px solid ${THEME.emeraldLine}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              <CheckCircle2 size={12} color={THEME.emerald} />
            </div>
            <div>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessRow({ item }: { item: ReadinessItem }) {
  const tone = getToneTokens(item.tone);

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${tone.line}`,
        background: tone.soft,
        padding: "11px 12px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          background: "rgba(255,255,255,0.86)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${tone.line}`,
        }}
      >
        {item.tone === "green" ? (
          <CheckCircle2 size={13} color={tone.text} />
        ) : (
          <AlertCircle size={13} color={tone.text} />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: THEME.textSoft,
          }}
        >
          {item.label}
        </div>
        {item.detail ? (
          <div
            style={{
              marginTop: 3,
              fontSize: 12,
              color: THEME.textMuted,
            }}
          >
            {item.detail}
          </div>
        ) : null}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: tone.text,
          textAlign: "right",
        }}
      >
        {item.status}
      </div>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
  dark,
}: {
  label: string;
  value: string;
  tone: StatusTone;
  dark?: boolean;
}) {
  const tokens = getToneTokens(tone);

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "10px 12px",
        border: dark ? "1px solid rgba(255,255,255,0.10)" : `1px solid ${tokens.line}`,
        background: dark ? "rgba(255,255,255,0.04)" : tokens.soft,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: dark ? "rgba(218,230,243,0.66)" : THEME.textMuted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 5,
          fontSize: 13,
          fontWeight: 800,
          color: dark ? "#f7fbff" : tokens.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: THEME.textMuted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.45,
          color: THEME.textSoft,
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoStrip({
  tone,
  icon,
  children,
}: {
  tone: "blue" | StatusTone;
  icon: ReactNode;
  children: ReactNode;
}) {
  const tokens =
    tone === "blue"
      ? { soft: THEME.blueSoft, line: THEME.blueLine, text: THEME.blueStrong }
      : getToneTokens(tone);

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${tokens.line}`,
        background: tokens.soft,
        padding: "10px 12px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 10,
        alignItems: "start",
        fontSize: 13,
        lineHeight: 1.45,
        color: THEME.textSoft,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.text,
          marginTop: 1,
        }}
      >
        {icon}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TinyStatus({ tone, text }: { tone: StatusTone; text: string }) {
  const tokens = getToneTokens(tone);

  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        lineHeight: 1,
        color: tokens.text,
        padding: "5px 8px",
        borderRadius: 999,
        background: tokens.soft,
        border: `1px solid ${tokens.line}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

function RequiredPill() {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        fontWeight: 900,
        color: THEME.blueStrong,
        background: THEME.blueSoft,
        border: `1px solid ${THEME.blueLine}`,
        padding: "4px 7px",
        borderRadius: 999,
        lineHeight: 1,
      }}
    >
      Required
    </div>
  );
}

function CameraGlyph() {
  return (
    <div
      style={{
        width: 15,
        height: 15,
        borderRadius: 4,
        border: `1.5px solid ${THEME.emerald}`,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 5,
          height: 5,
          borderRadius: 999,
          border: `1.5px solid ${THEME.emerald}`,
          top: 3,
          left: 4,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function fieldGridStyle(isMobile: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 12,
    alignItems: "start",
  };
}

function logoShieldStyle(): CSSProperties {
  return {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: THEME.cardBorder,
    background: "rgba(255,255,255,0.80)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.76)",
    flexShrink: 0,
  };
}

function iconButtonStyle(): CSSProperties {
  return {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: THEME.cardBorder,
    background: "rgba(255,255,255,0.78)",
    color: THEME.text,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: THEME.cardShadow,
  };
}

function ghostButtonStyle(): CSSProperties {
  return {
    height: 40,
    borderRadius: 12,
    border: THEME.cardBorder,
    background: "rgba(255,255,255,0.78)",
    color: THEME.text,
    padding: "0 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: THEME.cardShadow,
  };
}

function primaryGhostButtonStyle(disabled: boolean): CSSProperties {
  return {
    height: 46,
    borderRadius: 14,
    border: `1px solid ${THEME.blueLine}`,
    background: disabled
      ? "linear-gradient(180deg, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0.02) 100%)"
      : "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.06) 100%)",
    color: disabled ? "#7c90a5" : THEME.blueStrong,
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : `0 8px 18px ${THEME.blueGlow}`,
  };
}

function primaryButtonStyle(): CSSProperties {
  return {
    minHeight: 50,
    borderRadius: 14,
    border: "1px solid rgba(29,78,216,0.36)",
    background: THEME.buttonBlue,
    color: "#ffffff",
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    fontSize: 14,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
  };
}

function inputStyle(hasSelectArrow?: boolean): CSSProperties {
  return {
    width: "100%",
    minHeight: 46,
    borderRadius: 14,
    border: THEME.inputBorder,
    background: THEME.input,
    color: THEME.text,
    padding: hasSelectArrow ? "0 38px 0 14px" : "0 14px",
    fontSize: 14,
    outline: "none",
    boxShadow: THEME.inputInset,
    appearance: hasSelectArrow ? "none" : undefined,
    WebkitAppearance: hasSelectArrow ? "none" : undefined,
  };
}

function errorBoxStyle(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 10,
    alignItems: "start",
    borderRadius: 16,
    border: `1px solid ${THEME.redLine}`,
    background: THEME.redSoft,
    padding: "11px 12px",
    color: "#8c1d1d",
    fontSize: 13,
    lineHeight: 1.45,
  };
}

function getToneTokens(tone: StatusTone) {
  if (tone === "green") {
    return {
      soft: THEME.emeraldSoft,
      line: THEME.emeraldLine,
      text: THEME.emerald,
    };
  }

  if (tone === "yellow") {
    return {
      soft: THEME.yellowSoft,
      line: THEME.yellowLine,
      text: THEME.yellow,
    };
  }

  return {
    soft: THEME.redSoft,
    line: THEME.redLine,
    text: THEME.red,
  };
}

function normalizeVinStrict(value: string) {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);
}

function isValidVin(value: string) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(normalizeVinStrict(value));
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
  return Number(digits).toLocaleString();
}

function formatMoneyInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");

  if (parts.length === 1) {
    return parts[0];
  }

  const dollars = parts[0];
  const cents = parts.slice(1).join("").slice(0, 2);

  return `${dollars}.${cents}`;
}

function evaluateCustomerName(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Required",
      hint: "The intake record needs the customer’s name attached to it.",
    };
  }

  if (trimmed.length < 4) {
    return {
      tone: "yellow",
      status: "Looks short",
      hint: "Use the customer’s full name when possible.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Customer identity is attached to this intake.",
  };
}

function evaluateAddress(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Required",
      hint: "Address strengthens customer identity for the record.",
    };
  }

  if (trimmed.length < 8) {
    return {
      tone: "yellow",
      status: "Looks incomplete",
      hint: "Street, city, state, and ZIP is preferred.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Customer address is documented.",
  };
}

function evaluatePhone(value: string): FieldState {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return {
      tone: "red",
      status: "Required",
      hint: "A phone number is needed for contact and later authorization steps.",
    };
  }

  if (digits.length < 10) {
    return {
      tone: "yellow",
      status: "Incomplete",
      hint: "Use a full 10-digit phone number.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Phone number is ready for contact and signature flow later.",
  };
}

function evaluateVin(value: string): FieldState {
  const cleanVin = normalizeVinStrict(value);

  if (!cleanVin) {
    return {
      tone: "red",
      status: "Required",
      hint: "The intake record should be tied to a specific vehicle identity.",
    };
  }

  if (cleanVin.length < 17) {
    return {
      tone: "yellow",
      status: "Incomplete",
      hint: "VIN must be 17 valid characters.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "VIN is complete and can be decoded or saved.",
  };
}

function evaluateVehicleIdentity(year: string, make: string, model: string): FieldState {
  const y = year.trim();
  const mk = make.trim();
  const md = model.trim();

  if (!y || !mk || !md) {
    return {
      tone: "yellow",
      status: "Fill missing identity fields",
      hint: "Year, make, and model should all be confirmed at intake.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Vehicle identity is confirmed for this intake.",
  };
}

function evaluateMileage(value: string): FieldState {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return {
      tone: "red",
      status: "Required",
      hint: "Mileage in should be documented at drop-off.",
    };
  }

  if (digits.length < 2) {
    return {
      tone: "yellow",
      status: "Looks incomplete",
      hint: "Confirm the actual odometer reading.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Mileage in is documented for the intake record.",
  };
}

function evaluateConcern(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Required",
      hint: "Document the customer’s concern before intake is created.",
    };
  }

  if (trimmed.length < 8) {
    return {
      tone: "yellow",
      status: "Needs more detail",
      hint: "Add enough detail to identify what the shop is evaluating.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "The customer’s concern is documented for this intake.",
  };
}

function evaluateDiagnosticFee(value: string): FieldState {
  const amount = Number.parseFloat(value);

  if (!value.trim()) {
    return {
      tone: "red",
      status: "Required",
      hint: "Diagnostic fee should be recorded at intake.",
    };
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return {
      tone: "yellow",
      status: "Check amount",
      hint: "Enter a valid dollar amount.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Diagnostic fee is documented.",
  };
}

function evaluateWrittenBy(value: string): FieldState {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      tone: "red",
      status: "Required",
      hint: "The intake record must show who created it.",
    };
  }

  return {
    tone: "green",
    status: "Ready",
    hint: "Writer attribution is recorded.",
  };
}

async function decodeVinViaAppRoute(vin: string, year?: string): Promise<VehicleDecode> {
  const params = new URLSearchParams({ vin });
  if (year) {
    params.set("year", year);
  }

  const response = await fetch(`/api/vin-decode?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`VIN decode failed with status ${response.status}`);
  }

  const data = (await response.json()) as Partial<VehicleDecode> & {
    vehicle?: Partial<VehicleDecode>;
  };

  return {
    year: String(data.year || data.vehicle?.year || "").trim(),
    make: String(data.make || data.vehicle?.make || "").trim(),
    model: String(data.model || data.vehicle?.model || "").trim(),
  };
}

function createLocalFallbackJob(form: FormState): LocalJobRecord {
  const now = new Date().toISOString();
  const id = `local-${Date.now()}`;

  const notes = [
    "SHOPPROOF INTAKE SNAPSHOT",
    `Customer Address: ${form.customerAddress.trim() || "N/A"}`,
    `Customer Email: ${form.email.trim() || "N/A"}`,
    `Mileage In: ${form.mileageIn.trim() || "N/A"}`,
    `Requested Work: ${form.requestedWork.trim() || "N/A"}`,
    `Internal Notes: ${form.notes.trim() || "N/A"}`,
    `Diagnostic Fee: ${form.diagnosticFee.trim() || "N/A"}`,
    `Written By: ${form.writtenBy.trim() || "N/A"}`,
    "Required Drop-Off Photos:",
    "- Exterior x4",
    "- Wheels x4",
    "- Interior x3 (seat/console, door panel, dash/odometer)",
  ].join("\n");

  return {
    id,
    shop_id: null,
    customer_id: null,
    vehicle_id: null,
    status: "New Intake",
    approval_state: "Not Requested",
    concern: form.concern.trim(),
    notes,
    findings: "",
    assigned_to: null,
    created_at: now,
    updated_at: now,
    customer_name: form.customerName.trim(),
    customer_phone: form.phone.trim(),
    customer_email: form.email.trim() || null,
    customer_address: form.customerAddress.trim(),
    vehicles: {
      year: form.year.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      vin: normalizeVinStrict(form.vin),
      plate: form.plate.trim().toUpperCase() || null,
      color: null,
      customer_name: form.customerName.trim(),
      customer_phone: form.phone.trim(),
      mileage_in: form.mileageIn.trim() || null,
    },
  };
}

function saveLocalJob(job: LocalJobRecord) {
  const existing = readLocalJobs();
  const next = [job, ...existing];
  localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(next));
}

function readLocalJobs(): LocalJobRecord[] {
  try {
    const raw = localStorage.getItem(JOB_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalJobRecord[]) : [];
  } catch {
    return [];
  }
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Create failed due to an unexpected error.";
}