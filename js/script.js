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
        new LocationActions();
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
        this.audioToggle = document.getElementById("audioToggle");
        this.audioToggleLabel = document.getElementById("audioToggleLabel");

        const saved = localStorage.getItem("weddingAtmosphere");
        this.selected = saved === "silence" ? "silent" : saved;

        if (!this.welcome || !this.hero || !this.startButton || !this.cards.length) {
            return;
        }

        this.bind();
        this.restoreSelection();
        this.updateButton();
        this.updateAudioToggle();
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

            window.setTimeout(() => {
                this.welcome.hidden = true;
                this.hero.classList.add("show", "hero-show");
                this.hero.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 700);
        });

        if (this.audioToggle && this.audio) {
            this.audioToggle.addEventListener("click", () => this.toggleAudio());
            this.audio.addEventListener("play", () => this.updateAudioToggle());
            this.audio.addEventListener("pause", () => this.updateAudioToggle());
        }
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
            this.hideAudioToggle();
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
        this.showAudioToggle();

        this.audio.play()
            .then(() => {
                this.fadeIn();
                this.updateAudioToggle();
            })
            .catch(error => {
                console.warn("Не удалось запустить аудио:", error);
                this.updateAudioToggle();
            });
    }

    toggleAudio() {
        if (!this.audio || this.selected === "silent") return;

        if (this.audio.paused) {
            if (!this.audio.getAttribute("src")) {
                this.startAtmosphere();
                return;
            }

            this.audio.play()
                .then(() => this.updateAudioToggle())
                .catch(error => console.warn("Не удалось продолжить аудио:", error));
        } else {
            this.audio.pause();
        }
    }

    showAudioToggle() {
        if (!this.audioToggle) return;
        this.audioToggle.hidden = false;
        requestAnimationFrame(() => this.audioToggle.classList.add("visible"));
    }

    hideAudioToggle() {
        if (!this.audioToggle) return;
        this.audioToggle.classList.remove("visible", "playing");
        this.audioToggle.hidden = true;
    }

    updateAudioToggle() {
        if (!this.audioToggle || !this.audio) return;

        const isPlaying = !this.audio.paused && Boolean(this.audio.currentSrc);
        this.audioToggle.classList.toggle("playing", isPlaying);
        this.audioToggle.setAttribute("aria-pressed", String(isPlaying));
        this.audioToggle.setAttribute(
            "aria-label",
            isPlaying ? "Поставить атмосферу на паузу" : "Продолжить атмосферу"
        );

        if (this.audioToggleLabel) {
            this.audioToggleLabel.textContent = isPlaying ? "Атмосфера" : "Продолжить";
        }
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

        const originalButtonContent = this.button ? this.button.innerHTML : "";

        if (this.button) {
            this.button.disabled = true;
            this.button.innerHTML = "<span>Отправляем...</span>";
        }

        window.setTimeout(() => {
            if (this.message) {
                this.message.textContent = "Спасибо! Мы получили Ваш ответ 🤍";
                this.message.classList.add("visible");
            }

            if (this.button) {
                this.button.disabled = false;
                this.button.innerHTML = originalButtonContent;
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
        this.scrollThreshold = 7;
        this.ticking = false;

        if (!this.header || !this.burger || !this.menu) return;

        this.bind();
    }

    bind() {
        this.burger.addEventListener("click", () => {
            const opened = this.menu.classList.toggle("active");
            this.burger.classList.toggle("active", opened);
            this.burger.setAttribute("aria-expanded", String(opened));

            if (opened) {
                this.header.classList.remove("hide");
            }
        });

        this.menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => this.closeMenu());
        });

        window.addEventListener("scroll", () => this.requestScrollUpdate(), { passive: true });
    }

    closeMenu() {
        this.burger.classList.remove("active");
        this.menu.classList.remove("active");
        this.burger.setAttribute("aria-expanded", "false");
    }

    requestScrollUpdate() {
        if (this.ticking) return;

        this.ticking = true;
        window.requestAnimationFrame(() => {
            this.onScroll();
            this.ticking = false;
        });
    }

    onScroll() {
        const currentScroll = Math.max(0, window.scrollY);
        const difference = currentScroll - this.lastScroll;

        if (this.menu.classList.contains("active") || currentScroll < 90) {
            this.header.classList.remove("hide");
            this.lastScroll = currentScroll;
            return;
        }

        if (Math.abs(difference) < this.scrollThreshold) {
            return;
        }

        if (difference > 0) {
            this.header.classList.add("hide");
            this.closeMenu();
        } else {
            this.header.classList.remove("hide");
        }

        this.lastScroll = currentScroll;
    }
}

/* ==========================================================
   LOCATION ACTIONS
========================================================== */

class LocationActions {
    constructor() {
        this.toggle = document.getElementById("locationAddressToggle");
        this.actions = document.getElementById("locationActions");

        if (!this.toggle || !this.actions) return;

        this.bind();
    }

    bind() {
        this.toggle.addEventListener("click", () => this.setOpen(this.actions.hidden));

        document.addEventListener("click", event => {
            if (this.actions.hidden) return;
            if (this.toggle.contains(event.target) || this.actions.contains(event.target)) return;
            this.setOpen(false);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") this.setOpen(false);
        });
    }

    setOpen(opened) {
        this.actions.hidden = !opened;
        this.toggle.classList.toggle("active", opened);
        this.toggle.setAttribute("aria-expanded", String(opened));
    }
}

/* ==========================================================
   COPY ADDRESS
========================================================== */

class CopyAddress {
    constructor() {
        this.button = document.getElementById("copyAddress");
        this.status = document.getElementById("copyStatus");
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

        this.button.textContent = "Скопировано ✓";
        if (this.status) this.status.textContent = "Адрес скопирован";

        window.setTimeout(() => {
            this.button.textContent = this.originalText;
            if (this.status) this.status.textContent = "";
        }, 2000);
    }
}
