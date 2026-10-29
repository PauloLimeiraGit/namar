// NAMAR Fire Systems — landing page

// TROCAR: número de WhatsApp com DDI e DDD, só números (ex.: "5521999999999").
// Enquanto estiver vazio, os botões de WhatsApp levam ao formulário.
const WHATSAPP = "";

const wa = (text) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// botões de WhatsApp
document.querySelectorAll("[data-whatsapp]").forEach((a) => {
  if (!WHATSAPP) {
    a.setAttribute("href", "#contato");
    return;
  }
  a.href = wa("Olá! Vim pelo site e gostaria de falar com um especialista da NAMAR.");
  a.target = "_blank";
  a.rel = "noopener";
});

// formulário: envia os dados pelo WhatsApp já organizados
const form = document.getElementById("form-contato");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  if (!d.get("nome") || !d.get("telefone")) {
    form.querySelector(d.get("nome") ? "[name=telefone]" : "[name=nome]").focus();
    return;
  }
  const text =
    `Olá! Gostaria de solicitar uma avaliação.\n\n` +
    `*Nome:* ${d.get("nome")}\n` +
    `*Telefone:* ${d.get("telefone")}\n` +
    (d.get("email") ? `*E-mail:* ${d.get("email")}\n` : "") +
    `*Serviço:* ${d.get("servico")}\n` +
    (d.get("mensagem") ? `*Mensagem:* ${d.get("mensagem")}` : "");
  if (WHATSAPP) window.open(wa(text), "_blank", "noopener");
  const btn = form.querySelector("button[type=submit]");
  const label = btn.textContent;
  btn.textContent = "Recebido. Retornaremos em breve ✓";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = label;
    btn.disabled = false;
    form.reset();
  }, 4000);
});

// efeito leve: elementos surgem suavemente ao entrar na tela,
// em pequena cascata dentro de cada grupo
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  const i = siblings.indexOf(el);
  if (i > 0) el.style.setProperty("--d", `${Math.min(i, 6) * 0.07}s`);
  io.observe(el);
});

// cabeçalho ganha uma linha fina ao rolar; WhatsApp flutuante aparece após o topo
const header = document.querySelector(".header");
const waFloat = document.querySelector(".wa-float");
const onScroll = () => {
  header.classList.toggle("scrolled", scrollY > 8);
  waFloat.classList.toggle("show", scrollY > innerHeight * 0.6);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

document.getElementById("ano").textContent = new Date().getFullYear();

// cards da seção "A empresa": inclinação 3D discreta acompanhando o mouse
if (matchMedia("(hover: hover)").matches) {
  const MAX = 4; // graus
  document.querySelectorAll(".pillar").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", `${(x * MAX * 2).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * MAX * 2).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });
}

// rolagem suave e leve até as seções, ao tocar nos links do menu e nos
// botões internos (desconta a altura do cabeçalho fixo)
const HEADER_OFFSET = 84;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let scrolling = null;
function smoothScrollTo(y) {
  cancelAnimationFrame(scrolling);
  const from = scrollY;
  const dist = y - from;
  // duração proporcional à distância: curta e leve, sem passar de 1,1 s
  const dur = Math.min(1100, Math.max(550, Math.abs(dist) * 0.45));
  const t0 = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    scrollTo(0, from + dist * easeInOut(t));
    if (t < 1) scrolling = requestAnimationFrame(step);
  };
  scrolling = requestAnimationFrame(step);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  const target = id === "#topo" || id === "#" ? document.body : document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  const y = target === document.body ? 0 : target.getBoundingClientRect().top + scrollY - HEADER_OFFSET;
  smoothScrollTo(Math.max(0, y));
  history.replaceState(null, "", id === "#" ? location.pathname : id);
});

// menu: marca a seção que está na tela
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href")));
const markActive = () => {
  const y = scrollY + innerHeight * 0.35;
  let current = -1;
  sections.forEach((s, i) => {
    if (s && s.offsetTop <= y) current = i;
  });
  // depois da última seção do menu (certificação, contato), nenhum fica marcado
  const last = sections[sections.length - 1];
  if (last && y > last.offsetTop + last.offsetHeight) current = -1;
  navLinks.forEach((a, i) => a.classList.toggle("active", i === current));
};
addEventListener("scroll", markActive, { passive: true });
markActive();

// serviços em telas de toque: tocar no card mostra a descrição (mesmo efeito
// do "passar o mouse" no computador); tocar de novo ou em outro card fecha
if (matchMedia("(hover: none)").matches) {
  const cards = [...document.querySelectorAll(".service")];
  cards.forEach((card) =>
    card.addEventListener("click", () => {
      const open = !card.classList.contains("open");
      cards.forEach((c) => c.classList.remove("open"));
      card.classList.toggle("open", open);
    }),
  );
}

// menu hambúrguer: abre e fecha o painel; fecha ao escolher uma seção,
// ao tocar fora, com a tecla Esc ou ao voltar para a tela larga
const menuBtn = document.querySelector(".menu-btn");
const menuPanel = document.getElementById("menu-mobile");
const setMenu = (open) => {
  document.documentElement.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  menuPanel.setAttribute("aria-hidden", String(!open));
};
menuBtn.addEventListener("click", () =>
  setMenu(!document.documentElement.classList.contains("menu-open")),
);
menuPanel.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".header")) setMenu(false);
});
addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
matchMedia("(min-width: 821px)").addEventListener("change", (e) => e.matches && setMenu(false));
