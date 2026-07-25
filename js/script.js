"use strict";

/* ==========================================================
   WEDDING INVITATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    WeddingApp.init();
});

const WeddingApp = {
    init() {
        this.cache();
        this.smoothScroll();
        this.reveal();
        this.leaf();

        new WelcomeScene();
        new RSVPForm();
        new Countdown();
        new Gallery();
        new Navigation();
        new CopyAddress();
    },

    cache() {
        this.sections = document.querySelectorAll(
            "#story, #timeline, #day, #location, #gallery, #dress-code, #rsvp, #footer"
        );
        this.leafElement = document.querySelector("#hero .leaf");
    },

    smoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", event => {
                const selector = link.getAttribute("href");
                if (!selector || selector === "#") return;

                const target = document.querySelector(selector);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    },

    reveal() {
        this.sections.forEach(section => section.classList.add("reveal"));

        if (!("IntersectionObserver" in window)) {
            this.sections.forEach(section => {
                section.classList.add("active");
                section.querySelectorAll(".stagger").forEach(group => {
                    group.classList.add("active");
                });
            });
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("active");
                    entry.target.querySelectorAll(".stagger").forEach(group => {
                        group.classList.add("active");
                    });
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12 }
        );

        this.sections.forEach(section => observer.observe(section));
    },

    leaf() {
        if (!this.leafElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        let angle = 0;

        const animate = () => {
            angle += 0.02;
            const x = Math.cos(angle) * 12;
            const y = Math.sin(angle) * 8;
            this.leafElement.style.translate = `${x}px ${y}px`;
            requestAnimationFrame(animate);
        };

        animate();
    }
};

/* ==========================================================
   WELCOME / ATMOSPHERE
========================================================== */

class WelcomeScene {
    constructor() {
        this.welcome = document.getElementById("welcome");
        this.hero = document.getElementById("hero");
        this.startButton = document.getElementById("startJourney");
        this.cards = [...document.querySelectorAll(".atmosphere-card")];
        this.audio = document.getElementById("backgroundAudio");

        const saved = localStorage.getItem("weddingAtmosphere");
        this.selected = saved === "silence" ? "silent" : saved;

        if (!this.welcome || !this.hero || !this.startButton || !this.cards.length) {
            return;
        }

        this.bind();
        this.restoreSelection();
        this.updateButton();
    }

    bind() {
        this.cards.forEach(card => {
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-pressed", "false");

            const selectCard = () => this.select(card);
            card.addEventListener("click", selectCard);
            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectCard();
                }
            });
        });

        this.startButton.addEventListener("click", () => {
            if (!this.selected) return;

            this.startAtmosphere();
            this.welcome.classList.add("hide");

            setTimeout(() => {
                this.welcome.hidden = true;
                this.hero.classList.add("show", "hero-show");
                this.hero.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 700);
        });
    }

    select(card) {
        this.cards.forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
        });

        card.classList.add("active");
        card.setAttribute("aria-pressed", "true");
        this.selected = card.dataset.atmosphere || null;

        if (this.selected) {
            localStorage.setItem("weddingAtmosphere", this.selected);
        }

        this.updateButton();
    }

    restoreSelection() {
        if (!this.selected) return;

        const activeCard = this.cards.find(
            card => card.dataset.atmosphere === this.selected
        );

        if (!activeCard) {
            this.selected = null;
            localStorage.removeItem("weddingAtmosphere");
            return;
        }

        activeCard.classList.add("active");
        activeCard.setAttribute("aria-pressed", "true");
    }

    updateButton() {
        this.startButton.disabled = !this.selected;
    }

    startAtmosphere() {
        if (!this.audio) return;

        if (this.selected === "silent") {
            this.audio.pause();
            this.audio.removeAttribute("src");
            this.audio.load();
            return;
        }

        const tracks = {
            nature: "music/nature.mp3",
            music: "music/wedding.mp3"
        };

        const source = tracks[this.selected];
        if (!source) return;

        this.audio.pause();
        this.audio.src = source;
        this.audio.loop = true;
        this.audio.volume = 0;

        this.audio.play()
            .then(() => this.fadeIn())
            .catch(error => console.warn("Не удалось запустить аудио:", error));
    }

    fadeIn(targetVolume = 0.15) {
        if (!this.audio) return;

        const interval = window.setInterval(() => {
            if (this.audio.volume >= targetVolume) {
                this.audio.volume = targetVolume;
                window.clearInterval(interval);
                return;
            }

            this.audio.volume = Math.min(targetVolume, this.audio.volume + 0.01);
        }, 100);
    }
}

/* ==========================================================
   RSVP
========================================================== */

class RSVPForm {
    constructor() {
        this.form = document.getElementById("rsvpForm");
        this.message = document.getElementById("rsvpMessage");

        if (!this.form) return;

        this.button = this.form.querySelector('button[type="submit"]');
        this.form.addEventListener("submit", event => this.submit(event));
    }

    submit(event) {
        event.preventDefault();

        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        if (this.button) {
            this.button.disabled = true;
            this.button.textContent = "Отправляем...";
        }

        window.setTimeout(() => {
            if (this.message) {
                this.message.textContent = "Спасибо! Мы получили Ваш ответ 🤍";
            }

            if (this.button) {
                this.button.disabled = false;
                this.button.textContent = "Отправить";
            }

            this.form.reset();
        }, 700);
    }
}

/* ==========================================================
   COUNTDOWN
========================================================== */

class Countdown {
    constructor() {
        this.target = new Date("2026-09-05T15:30:00+03:00").getTime();
        this.days = document.getElementById("days");
        this.hours = document.getElementById("hours");
        this.minutes = document.getElementById("minutes");
        this.seconds = document.getElementById("seconds");

        if (!this.days || !this.hours || !this.minutes || !this.seconds) return;

        this.update();
        window.setInterval(() => this.update(), 1000);
    }

    update() {
        const difference = Math.max(0, this.target - Date.now());
        const days = Math.floor(difference / 86400000);
        const hours = Math.floor((difference % 86400000) / 3600000);
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);

        this.days.textContent = String(days).padStart(3, "0");
        this.hours.textContent = String(hours).padStart(2, "0");
        this.minutes.textContent = String(minutes).padStart(2, "0");
        this.seconds.textContent = String(seconds).padStart(2, "0");
    }
}

/* ==========================================================
   GALLERY / LIGHTBOX
========================================================== */

class Gallery {
    constructor() {
        this.images = [...document.querySelectorAll(".gallery-item img")];
        this.lightbox = document.getElementById("lightbox");
        this.preview = document.getElementById("lightboxImage");
        this.closeButton = document.getElementById("lightboxClose");

        if (!this.images.length || !this.lightbox || !this.preview || !this.closeButton) {
            return;
        }

        this.bind();
    }

    bind() {
        this.images.forEach(image => {
            image.addEventListener("click", () => this.open(image));
        });

        this.closeButton.addEventListener("click", () => this.close());
        this.closeButton.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.close();
            }
        });
        this.lightbox.addEventListener("click", event => {
            if (event.target === this.lightbox) this.close();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && this.lightbox.classList.contains("active")) {
                this.close();
            }
        });
    }

    open(image) {
        this.preview.src = image.currentSrc || image.src;
        this.preview.alt = image.alt || "Фотография Александра и Лианы";
        this.lightbox.classList.add("active");
        this.lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    close() {
        this.lightbox.classList.remove("active");
        this.lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

/* ==========================================================
   MOBILE NAVIGATION
========================================================== */

class Navigation {
    constructor() {
        this.header = document.getElementById("header");
        this.burger = document.getElementById("burger");
        this.menu = document.querySelector(".nav-menu");
        this.lastScroll = window.scrollY;

        if (!this.header || !this.burger || !this.menu) return;

        this.bind();
    }

    bind() {
        this.burger.addEventListener("click", () => {
            const opened = this.menu.classList.toggle("active");
            this.burger.classList.toggle("active", opened);
            this.burger.setAttribute("aria-expanded", String(opened));
        });

        this.menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => this.closeMenu());
        });

        window.addEventListener("scroll", () => this.onScroll(), { passive: true });
    }

    closeMenu() {
        this.burger.classList.remove("active");
        this.menu.classList.remove("active");
        this.burger.setAttribute("aria-expanded", "false");
    }

    onScroll() {
        const currentScroll = window.scrollY;

        if (currentScroll < 120 || currentScroll < this.lastScroll) {
            this.header.classList.remove("hide");
        } else {
            this.header.classList.add("hide");
        }

        this.lastScroll = currentScroll;
    }
}

/* ==========================================================
   COPY ADDRESS
========================================================== */

class CopyAddress {
    constructor() {
        this.button = document.getElementById("copyAddress");
        if (!this.button) return;

        this.originalText = this.button.textContent.trim();
        this.button.addEventListener("click", () => this.copy());
    }

    async copy() {
        const address = "г. Карачаевск, ул. Пушкина, 127 — гостевой дом «Домики»";

        try {
            await navigator.clipboard.writeText(address);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = address;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
        }

        this.button.textContent = "Адрес скопирован ✓";
        window.setTimeout(() => {
            this.button.textContent = this.originalText;
        }, 2000);
    }
}
