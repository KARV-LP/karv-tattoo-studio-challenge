type AnalyticsValue = string | number | boolean;

interface AnalyticsEvent {
  event: string;
  [key: string]: AnalyticsValue;
}

declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[];
  }
}

const emit = (event: string, properties: Record<string, AnalyticsValue> = {}) => {
  const detail: AnalyticsEvent = { event, ...properties };
  window.dispatchEvent(new CustomEvent("karv:analytics", { detail }));
  window.dataLayer?.push(detail);
};

emit("page_view", { page: "tattoo_studio_challenge" });

document.querySelectorAll<HTMLAnchorElement>('a[href="#inscricao"]').forEach((link) => {
  link.addEventListener("click", () => {
    emit("cta_click", {
      label: link.textContent?.trim().replace(/\s+/g, " ") ?? "inscricao",
      location: link.closest("header") ? "header" : link.closest(".hero") ? "hero" : "content"
    });
  });
});

const form = document.querySelector<HTMLFormElement>(".application-form");
if (form) {
  let started = false;

  form.addEventListener("input", () => {
    if (started) return;
    started = true;
    emit("form_start", { form: "studio_application" });
  }, { once: true });

  form.addEventListener("submit", () => {
    emit("form_submit_attempt", { form: "studio_application" });
  });
}

document.querySelectorAll<HTMLDetailsElement>(".faq details").forEach((item, index) => {
  item.addEventListener("toggle", () => {
    if (item.open) emit("faq_open", { item: index + 1 });
  });
});

const milestones = [25, 50, 75, 90];
const reached = new Set<number>();

const trackScroll = () => {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  if (available <= 0) return;
  const percent = Math.round((window.scrollY / available) * 100);

  milestones.forEach((milestone) => {
    if (percent >= milestone && !reached.has(milestone)) {
      reached.add(milestone);
      emit("scroll_depth", { percent: milestone });
    }
  });
};

window.addEventListener("scroll", trackScroll, { passive: true });
