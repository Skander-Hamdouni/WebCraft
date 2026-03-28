// Supabase Edge Function — deploy-to-vercel
// Reçoit HTML + CSS depuis le client WebCraft, crée un déploiement Vercel, retourne l'URL live.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const VERCEL_TOKEN = Deno.env.get("VERCEL_TOKEN");
    if (!VERCEL_TOKEN) throw new Error("VERCEL_TOKEN secret non configuré");

    const { htmlContent, cssContent, siteName } = await req.json();
    if (!htmlContent || !siteName) throw new Error("Paramètres manquants");

    const slug = siteName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50);

    const projectName = "webcraft-" + slug;

    // Créer le déploiement Vercel (static, no build)
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          {
            file: "index.html",
            data: htmlContent,
            encoding: "utf-8",
          },
          {
            file: "style.css",
            data: cssContent,
            encoding: "utf-8",
          },
        ],
        projectSettings: {
          framework: null,
          buildCommand: null,
          installCommand: null,
          outputDirectory: null,
        },
        target: "production",
      }),
    });

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
      const msg = deployData?.error?.message || JSON.stringify(deployData);
      throw new Error("Vercel API: " + msg);
    }

    // Attendre que le déploiement soit prêt (polling jusqu'à READY ou erreur)
    const deployId = deployData.id;
    let liveUrl = "https://" + deployData.url;
    let attempts = 0;

    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(
        `https://api.vercel.com/v13/deployments/${deployId}`,
        { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
      );
      const statusData = await statusRes.json();

      if (statusData.readyState === "READY") {
        liveUrl = "https://" + statusData.url;
        break;
      }
      if (statusData.readyState === "ERROR") {
        throw new Error("Déploiement Vercel en erreur");
      }
      attempts++;
    }

    return new Response(JSON.stringify({ url: liveUrl }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
