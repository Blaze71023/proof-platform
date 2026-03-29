"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestPage() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from("shops").select("*");

      console.log("SHOPS:", data);
      console.log("ERROR:", error);
    };

    test();
  }, []);

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Supabase Test</h1>
      <p>Check console...</p>
    </div>
  );
}