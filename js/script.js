"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const app = new WeddingApp();
  app.init();
});

class WeddingApp {
  init() {
    this.cache();
    this.bindGlobalReveal();
    this.bindSmoothScroll();
    this.bindHeader();
    this.animateLeaf();

    new WelcomeScene();
    new Countdown("2026-09-05T15:30:00");
    new LocationActions();
    new GalleryCarousel();
    new GalleryLightbox();
    new RSVPForm();
    new MobileMenu();
  }

  cache() {
    this.header = document.getElementById("header");
    this.hero = document.getElementById("hero");
    this.revealItems = document.querySelectorAll(".reveal");
    this.leaf = document.getElementById("leafMascotFloating");
    this.lastScrollY = window.scrollY;
  }

  bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const targetSelector = link.getAttribute("href");
        if (!targetSelector || targetSelector === "#") return;
        const target = document.querySelector(targetSelector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  bindHeader() {
    if (!this.header) return;

    const updateHeaderLabel = () => {
      const heroBottom = this.hero?.getBoundingClientRect().bottom ?? 0;
      const heroMode = heroBottom > window.innerHeight * 0.58;
      this.header.classList.toggle("hero-mode", heroMode);
    };

    const onScroll = () => {
      const currentScroll = window.scrollY;
      updateHeaderLabel();
      this.header.classList.toggle("scrolled", currentScroll > 10);

      if (document.body.classList.contains("menu-open") || document.body.classList.contains("prelaunch")) {
        this.lastScrollY = currentScroll;
        return;
      }

      if (currentScroll > this.lastScrollY && currentScroll > 120) {
        this.header.classList.add("is-hidden");
      } else {
        this.header.classList.remove("is-hidden");
      }

      this.lastScrollY = currentScroll;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateHeaderLabel);
    onScroll();
  }

  bindGlobalReveal() {
    if (!("IntersectionObserver" in window)) {
      this.revealItems.forEach(item => item.classList.add("active"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    this.revealItems.forEach(item => observer.observe(item));
  }

  animateLeaf() {
    if (!this.leaf || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    const move = () => {
      if (this.leaf.hidden) {
        requestAnimationFrame(move);
        return;
      }
      angle += 0.012;
      const x = Math.cos(angle) * 12;
      const y = Math.sin(angle * 1.4) * 8;
      this.leaf.style.transform = `translate(${x}px, ${y}px) rotate(${Math.sin(angle) * 7}deg)`;
      requestAnimationFrame(move);
    };
    move();
  }
}

class MobileMenu {
  constructor() {
    this.button = document.getElementById("burger");
    this.menu = document.getElementById("navMenu");
    if (!this.button || !this.menu) return;
    this.links = this.menu.querySelectorAll("a");
    this.bind();
  }
  bind() {
    this.button.addEventListener("click", () => {
      const expanded = this.button.getAttribute("aria-expanded") === "true";
      this.button.setAttribute("aria-expanded", String(!expanded));
      this.button.classList.toggle("active", !expanded);
      this.menu.classList.toggle("active", !expanded);
      document.body.classList.toggle("menu-open", !expanded);
    });
    this.links.forEach(link => link.addEventListener("click", () => this.close()));
    window.addEventListener("resize", () => { if (window.innerWidth > 920) this.close(); });
  }
  close() {
    this.button.setAttribute("aria-expanded", "false");
    this.button.classList.remove("active");
    this.menu.classList.remove("active");
    document.body.classList.remove("menu-open");
  }
}

class WelcomeScene {
  constructor() {
    this.section = document.getElementById("welcome");
    this.cards = Array.from(document.querySelectorAll(".atmosphere-card"));
    this.startButton = document.getElementById("startJourney");
    this.audio = document.getElementById("backgroundAudio");
    this.audioToggle = document.getElementById("audioToggle");
    this.audioToggleLabel = document.getElementById("audioToggleLabel");
    this.selected = localStorage.getItem("weddingAtmosphere") || "";
    this.floatingLeaf = document.getElementById("leafMascotFloating");
    this.audioCompact = false;
    if (!this.section || !this.cards.length || !this.startButton) return;
    this.bind();
    this.restore();
  }

  bind() {
    this.cards.forEach(card => card.addEventListener("click", () => this.select(card)));
    this.startButton.addEventListener("click", () => {
      if (!this.selected) return;
      document.body.classList.remove("prelaunch");
      document.body.classList.add("site-ready");
      this.section.classList.add("hide");
      this.startAudio();
      if (this.floatingLeaf) this.floatingLeaf.hidden = false;
      setTimeout(() => { this.section.hidden = true; }, 800);
    });
    this.audioToggle?.addEventListener("click", () => {

  this.audioToggle.classList.remove("is-compact");

  this.toggleAudio();

});
    this.audio?.addEventListener("play", () => this.updateAudioUi());
    this.audio?.addEventListener("pause", () => this.updateAudioUi());
    window.addEventListener("scroll", () => {

  if (!this.audioToggle || !this.audio) return;

  if (window.scrollY > 120 && !this.audio.paused) {

    this.audioToggle.classList.add("is-compact");
    this.audioCompact = true;

  }

});
  }

  restore() {
    if (!this.selected) return this.updateButton();
    const match = this.cards.find(card => card.dataset.atmosphere === this.selected);
    if (match) match.classList.add("active");
    this.updateButton();
  }

  select(card) {
    this.cards.forEach(item => item.classList.remove("active"));
    card.classList.add("active");
    this.selected = card.dataset.atmosphere || "";
    localStorage.setItem("weddingAtmosphere", this.selected);
    this.updateButton();
  }

  updateButton() { this.startButton.disabled = !this.selected; }

  startAudio() {
    if (!this.audio) return;
    if (this.selected === "silent") {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
      this.audioToggle.hidden = true;
      return;
    }
    const tracks = { nature: "music/nature.mp3", music: "music/wedding.mp3" };
    const src = tracks[this.selected];
    if (!src) return;
    this.audio.src = src;
    this.audio.loop = true;
    this.audio.volume = 0.15;
    this.audio.play().catch(() => {});
    this.audioToggle.hidden = false;
    this.updateAudioUi();
  }

  toggleAudio() {

  if (!this.audio || this.selected === "silent") return;


  if (this.audio.paused) {

    this.audio.play().catch(() => {});

  } else {

    this.audio.pause();

  }

}

  updateAudioUi() {
    if (!this.audioToggle || !this.audioToggleLabel || !this.audio) return;
    const isPaused = this.audio.paused;
    this.audioToggle.classList.toggle("is-paused", isPaused);
    this.audioToggleLabel.textContent = isPaused ? "Продолжить" : "Атмосфера";
  }
}

class Countdown {
  constructor(targetDate) {
    this.targetTime = new Date(targetDate).getTime();
    this.days = document.getElementById("days");
    this.hours = document.getElementById("hours");
    this.minutes = document.getElementById("minutes");
    this.seconds = document.getElementById("seconds");
    this.daysLabel = document.getElementById("daysLabel");
    this.hoursLabel = document.getElementById("hoursLabel");
    this.minutesLabel = document.getElementById("minutesLabel");
    this.secondsLabel = document.getElementById("secondsLabel");
    if (!this.days || Number.isNaN(this.targetTime)) return;
    this.update();
    setInterval(() => this.update(), 1000);
  }
  plural(number, one, few, many) {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
  }
  update() {
    const now = Date.now();
    const distance = Math.max(this.targetTime - now, 0);
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);
    this.days.textContent = String(days);
    this.hours.textContent = String(hours).padStart(2, "0");
    this.minutes.textContent = String(minutes).padStart(2, "0");
    this.seconds.textContent = String(seconds).padStart(2, "0");
    if (this.daysLabel) this.daysLabel.textContent = this.plural(days, "день", "дня", "дней");
    if (this.hoursLabel) this.hoursLabel.textContent = this.plural(hours, "час", "часа", "часов");
    if (this.minutesLabel) this.minutesLabel.textContent = this.plural(minutes, "минута", "минуты", "минут");
    if (this.secondsLabel) this.secondsLabel.textContent = this.plural(seconds, "секунда", "секунды", "секунд");
  }
}

class LocationActions {
  constructor() {
    this.toggle = document.getElementById("locationAddressToggle");
    this.actions = document.getElementById("locationActions");
    this.copyButton = document.getElementById("copyAddress");
    this.copyStatus = document.getElementById("copyStatus");
    this.address = "г. Карачаевск, ул. Пушкина, д. 127 (Гостевой дом «Домики»)";
    if (!this.toggle || !this.actions || !this.copyButton) return;
    this.actions.hidden = true;
    this.actions.style.display = "none";
    this.toggle.setAttribute("aria-expanded", "false");
    this.bind();
  }
  bind() {
    this.toggle.addEventListener("click", () => {
      const expanded = this.toggle.getAttribute("aria-expanded") === "true";
      this.toggle.setAttribute("aria-expanded", String(!expanded));
      this.actions.hidden = expanded;
      this.actions.style.display = expanded ? "none" : "grid";
    });
    this.copyButton.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(this.address); }
      catch { this.fallbackCopy(); }
      this.showStatus("Адрес скопирован");
    });
  }
  fallbackCopy() {
    const input = document.createElement("textarea");
    input.value = this.address;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.focus(); input.select(); document.execCommand("copy"); input.remove();
  }
  showStatus(text) {
    if (!this.copyStatus) return;
    this.copyStatus.textContent = text;
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => { this.copyStatus.textContent = ""; }, 2200);
  }
}

class GalleryCarousel {

  constructor() {

    this.track = document.getElementById("galleryTrack");
    this.prev = document.querySelector(".gallery-prev");
    this.next = document.querySelector(".gallery-next");

    if (!this.track || !this.prev || !this.next) return;


    this.items = Array.from(
      this.track.querySelectorAll(".gallery-item")
    );


    if (this.items.length < 2) return;


    this.bind();


    setTimeout(() => {
      this.updateActiveState();
    },80);

  }


  getItemWidth(){

    const item = this.track.querySelector(".gallery-item");

    const style = window.getComputedStyle(this.track);

    const gap = parseFloat(
      style.columnGap || style.gap || 18
    );


    return item.getBoundingClientRect().width + gap;

  }


  bind(){

    this.prev.addEventListener("click",()=>{

      this.track.scrollBy({
        left:-this.getItemWidth(),
        behavior:"smooth"
      });

    });


    this.next.addEventListener("click",()=>{

      this.track.scrollBy({
        left:this.getItemWidth(),
        behavior:"smooth"
      });

    });


    this.track.addEventListener(
      "scroll",
      ()=>{
        this.updateActiveState();
      },
      {passive:true}
    );


    window.addEventListener(
      "resize",
      ()=>{
        this.updateActiveState();
      }
    );

  }


  updateActiveState(){

    const trackRect =
      this.track.getBoundingClientRect();


    const center =
      trackRect.left + trackRect.width / 2;


    let closest = null;

    let closestDistance = Infinity;


    this.items.forEach(item=>{

      const rect =
        item.getBoundingClientRect();


      const itemCenter =
        rect.left + rect.width / 2;


      const distance =
        Math.abs(center-itemCenter);


      item.classList.remove("is-active");


      if(distance < closestDistance){

        closestDistance = distance;
        closest = item;

      }

    });


    if(closest){

      closest.classList.add("is-active");

    }

  }

}
class GalleryLightbox {
  constructor() {
    this.lightbox = document.getElementById("lightbox");
    this.lightboxImage = document.getElementById("lightboxImage");
    this.closeButton = document.getElementById("lightboxClose");
    if (!this.lightbox || !this.lightboxImage || !this.closeButton) return;
    this.bind();
  }
  bind() {
    document.addEventListener("click", event => {
      const item = event.target.closest(".gallery-item");
      if (!item) return;
      const image = item.querySelector("img");
      if (!image) return;
      this.lightboxImage.src = image.src;
      this.lightboxImage.alt = image.alt;
      this.lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
    this.closeButton.addEventListener("click", () => this.close());
    this.lightbox.addEventListener("click", event => { if (event.target === this.lightbox) this.close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !this.lightbox.hidden) this.close(); });
  }
  close() {
    this.lightbox.hidden = true;
    this.lightboxImage.src = "";
    document.body.style.overflow = "";
  }
}

class RSVPForm {

  constructor() {

    this.form = document.getElementById("rsvpForm");
    this.message = document.getElementById("rsvpMessage");

    if (!this.form) return;


    this.submitButton = this.form.querySelector(
      "button[type='submit']"
    );


    this.storageKey = "wedding_rsvp_sent";


    this.bind();

    this.checkAlreadySent();

  }



  bind() {


    this.form.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();


        if (!this.form.reportValidity()) return;


        this.sendToTelegram();

      }
    );


  }



  checkAlreadySent() {


    const sentTime = localStorage.getItem(
      this.storageKey
    );


    if (!sentTime) return;



    const hoursPassed =
      (Date.now() - Number(sentTime))
      / 1000
      / 60
      / 60;



    if (hoursPassed < 24) {


      if (this.submitButton) {

        this.submitButton.disabled = true;

        this.submitButton.textContent =
          "Ответ уже отправлен 🤍";

      }

      if (this.message) {

        this.message.textContent =
          "Спасибо! Мы уже получили ваш ответ.";

      }

    } else {

      localStorage.removeItem(
        this.storageKey
      );

    }

  }


  async sendToTelegram() {


    if (
      localStorage.getItem(
        this.storageKey
      )
    ) {

      return;

    }

    const TELEGRAM_BOT_TOKEN =
      "8837294046:AAHYmb72BCE2ZhwDmhNxQDgFCVWEX50N3oI";

    const TELEGRAM_CHAT_ID =
      "8837294046";


    const formData =
      new FormData(this.form);

    const data =
      Object.fromEntries(
        formData.entries()
      );

    const attendance =
      data.attendance === "yes"

        ? "✅ С радостью приду"

        : "❌ К сожалению, не смогу";


    const message = `

💍 Новая анкета гостя


👤 Имя:
${data.name}


📞 Телефон:
${data.phone}


💒 Присутствие:
${attendance}


💌 Комментарий:
${data.message || "Нет комментария"}



────────────


🤍 Александр & Лиана

📅 05 сентября 2026

⏰ ${new Date().toLocaleString("ru-RU")}

`;

    if (this.submitButton) {

      this.submitButton.disabled = true;

      this.submitButton.textContent =
        "Отправляем...";

    }

    try {
      const response =
        await fetch(

          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,

          {

            method: "POST",


            headers: {

              "Content-Type":
              "application/json"
            },


            body:
            JSON.stringify({

              chat_id:
              TELEGRAM_CHAT_ID,


              text:
              message

            })

          }

        );


      if (!response.ok) {

        throw new Error(
          "Telegram error"
        );

      }

      localStorage.setItem(

        this.storageKey,

        Date.now()

      );

      if (this.message) {

        this.message.textContent =
          "Спасибо! Ваш ответ получен 🤍";

      }

      this.form.reset();

      if (this.submitButton) {

        this.submitButton.disabled = true;

        this.submitButton.textContent =
          "Ответ уже отправлен 🤍";

      }

    } catch(error) {


      console.error(
        error
      );

      if (this.message) {

        this.message.textContent =
          "Не удалось отправить анкету. Попробуйте ещё раз.";
      }

      if (this.submitButton) {

        this.submitButton.disabled = false;

        this.submitButton.textContent =
          "Отправить анкету";

      }

    }
  }
}