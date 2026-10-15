export {};

const form = document.querySelector<HTMLFormElement>(".application-form");

if (form) {
  const status = form.querySelector<HTMLElement>(".form-status");
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const languageInputs = [...form.querySelectorAll<HTMLInputElement>('input[name="linguagens"]')];
  const track = (event: string) => window.dispatchEvent(
    new CustomEvent("karv:analytics", { detail: { event, form: "studio_application" } })
  );

  const setStatus = (message: string, state: "idle" | "error" | "success" | "pending") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "idle");

    const hasLanguage = languageInputs.some((input) => input.checked);
    if (!form.checkValidity() || !hasLanguage) {
      if (!hasLanguage) {
        languageInputs[0]?.setCustomValidity("Selecione ao menos uma linguagem.");
      }
      form.reportValidity();
      languageInputs[0]?.setCustomValidity("");
      setStatus("Revise os campos obrigatórios antes de continuar.", "error");
      track("form_validation_error");
      return;
    }

    const endpoint = form.dataset.endpoint?.trim();
    if (!endpoint) {
      setStatus(
        "PENDENTE DE DEFINIÇÃO KARV — destino oficial das inscrições ainda não configurado.",
        "pending"
      );
      track("form_blocked_configuration");
      return;
    }

    const data = new FormData(form);
    const payload: Record<string, FormDataEntryValue | string[]> = Object.fromEntries(data.entries());
    payload.linguagens = languageInputs.filter((input) => input.checked).map((input) => input.value);

    submit?.setAttribute("disabled", "true");
    setStatus("Enviando inscrição…", "idle");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Falha no envio");

      form.reset();
      setStatus("Inscrição recebida. Enviamos a confirmação para o e-mail informado.", "success");
      track("form_submit_success");
    } catch {
      setStatus("Não foi possível enviar agora. Tente novamente em alguns instantes.", "error");
      track("form_submit_error");
    } finally {
      submit?.removeAttribute("disabled");
    }
  });
}
