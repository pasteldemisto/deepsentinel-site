/* DeepSentinel: 100 olhos que seguem o dedo/mouse, olho do logo que pisca, e transição entre páginas. */
(() => {
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- transição de saída: íris verde seguida de fundo sólido ---------- */
  function sair(url, x, y, cor) {
    if (reduz) { location.href = url; return; }
    const mk = (c) => { const d = document.createElement("div"); d.className = "onda"; d.style.background = c; d.style.clipPath = `circle(0px at ${x}px ${y}px)`; document.body.appendChild(d); return d; };
    const verde = mk("#02C39A"), fundo = mk(cor);
    void verde.offsetWidth;
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    verde.style.clipPath = `circle(${raio}px at ${x}px ${y}px)`;
    setTimeout(() => { fundo.style.clipPath = `circle(${raio}px at ${x}px ${y}px)`; }, 130);
    setTimeout(() => { location.href = url; }, 950);
  }
  addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll(".onda").forEach((n) => n.remove()); });

  const ir = document.querySelector("[data-ir]");
  if (ir) {
    ir.addEventListener("click", (ev) => {
      ev.preventDefault();
      const olho = document.getElementById("esclera");
      let x = innerWidth / 2, y = innerHeight / 2;
      if (olho) { const r = olho.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      else { const r = ir.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      sair(ir.dataset.ir, x, y, ir.dataset.cor || "#023436");
    });
  }

  /* ---------- cem olhos ---------- */
  const camada = document.querySelector(".olhos");
  const olhos = [];
  let centros = [];
  const pequenos = [];
  if (camada) {
    const paisagem = innerWidth > innerHeight * 1.2;
    const [cols, rows] = paisagem ? [20, 5] : [10, 10];
    camada.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    camada.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    for (let i = 0; i < 100; i++) {
      const o = document.createElement("div");
      o.className = "olhinho";
      o.style.animationDelay = (Math.random() * 1.6).toFixed(2) + "s";
      const ir = document.createElement("i");
      o.appendChild(ir);
      camada.appendChild(o);
      pequenos.push({ o, ir });
    }
  }
  function medir() {
    centros = pequenos.map(({ o }) => { const r = o.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.width }; });
  }

  /* ---------- olho do logo ---------- */
  const esclera = document.getElementById("esclera");
  const iris = document.getElementById("iris");
  const pupila = document.getElementById("pupila");
  const olho = document.getElementById("olho");

  function olhar(gx, gy) {
    pequenos.forEach(({ ir }, i) => {
      const c = centros[i]; if (!c) return;
      const dx = gx - c.x, dy = gy - c.y, d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 120), m = c.t * 0.22 * k;
      ir.style.transform = `translate(${(dx / d * m).toFixed(1)}px, ${(dy / d * m).toFixed(1)}px)`;
    });
    if (esclera) {
      const r = esclera.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy) || 1;
      const m = 38 * Math.min(1, d / 160);
      const x = dx / d * m, y = dy / d * m;
      iris.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      pupila.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.18).toFixed(1)}px)`;
    }
  }

  if (camada || esclera) {
    medir();
    addEventListener("resize", medir);
    let ultimoToque = 0, pend = null;
    const mover = (x, y) => { ultimoToque = performance.now(); pend = [x, y]; if (!mover.f) mover.f = requestAnimationFrame(() => { mover.f = 0; olhar(...pend); }); };
    addEventListener("pointermove", (e) => mover(e.clientX, e.clientY), { passive: true });
    addEventListener("pointerdown", (e) => mover(e.clientX, e.clientY), { passive: true });

    /* olhar sozinho quando ninguém mexe: varre a tela, às vezes encara quem está vendo */
    const vagar = () => {
      if (performance.now() - ultimoToque > 2500) {
        if (Math.random() < 0.25 && esclera) {
          const r = esclera.getBoundingClientRect();
          olhar(r.left + r.width / 2, r.top + r.height / 2);
        } else olhar(rand(0, innerWidth), rand(0, innerHeight));
      }
      setTimeout(vagar, rand(900, 2000));
    };
    setTimeout(vagar, 1600);

    if (olho) {
      const piscar = () => {
        olho.classList.add("pisca");
        setTimeout(() => olho.classList.remove("pisca"), 240);
        setTimeout(piscar, rand(2500, 5500));
      };
      setTimeout(piscar, 3000);
    }
  }
})();
