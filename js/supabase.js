(function () {
  const SUPABASE_URL = window.UNOMOTORS_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = window.UNOMOTORS_SUPABASE_ANON_KEY || "";

  let client = null;
  let configured = false;

  if (!window.supabase?.createClient) {
    console.warn("Supabase JS no está disponible en window.supabase.");
  } else if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    configured = true;
  } else {
    console.warn(
      "Supabase no está configurado. Definí window.UNOMOTORS_SUPABASE_URL y window.UNOMOTORS_SUPABASE_ANON_KEY.",
    );
  }

  window.UNOMOTORS_SUPABASE = {
    client,
    configured,
  };
})();
