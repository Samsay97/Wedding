"use strict";

/* ==========================================================
   WEDDING INVITATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const app = new WeddingApp();
    app.init();
});

class WeddingApp {
    init() {
        this.cache();
        this.preloader();
        this.smoothScroll();
        this.reveal();
        this.leaf();

        new WelcomeScene();
        new RSVPForm();
        new Countdown();
        new Gallery();
        new Navigation();
        new CopyAddress();
    }

    cache() {
        this.preloaderElement = document.getElementById("preloader");
        this.sections = document.querySelectorAll("section, footer");
        this.leafElement = document.querySelector("#hero .leaf");
    }

    /* ==========================================================
       PRELOADER
    ========================================================== */
    preloader() {
        window.addEventListener("load", () => {
            setTimeout(() => {
                if (!this.preloaderElement) return;
                this.preloaderElement.classList.add("hidden");
            }, 900);
        });
    }

    /* ==========================================================
       SMOOTH SCROLL
    ========================================================== */
    smoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", e => {
                const id = link.getAttribute("href");
                const target = document.querySelector(id);
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });
        });
    }

    /* ==========================================================
       REVEAL
    ========================================================== */
    reveal() {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("active");
                });
            },
            {
                threshold: 0.15
            }
        );

        this.sections.forEach(section => {
            section.classList.add("reveal");
            observer.observe(section);
        });
    }

    /* ==========================================================
       LEAF
    ========================================================== */
    leaf() {
        if (!this.leafElement) return;

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
}

/* ==========================================================
   WELCOME / ATMOSPHERE
========================================================== */

class WelcomeScene {
    constructor() {
        this.welcome = document.getElementById("welcome");
        this.hero = document.getElementById("hero");
        this.startButton = document.getElementById("startJourney");
        this.cards = document.querySelectorAll(".atmosphere-card");
        this.audio = document.getElementById("backgroundAudio");
        this.selected = localStorage.getItem("weddingAtmosphere") || null;

        if (!this.welcome || !this.startButton) return;

        this.hideLegacyMusicUI();
        this.bind();
        this.restoreSelection();
        this.syncStartButton();
    }

    hideLegacyMusicUI() {
        const legacyButton = document.getElementById("musicButton");
        if (legacyButton) legacyButton.style.display = "none";

        const legacyAudio = document.getElementById("music");
        if (legacyAudio) legacyAudio.remove();
    }

    bind() {
        this.cards.forEach(card => {
            card.addEventListener("click", () => {
                this.cards.forEach(item => item.classList.remove("active"));
                card.classList.add("active");

                this.selected = card.dataset.atmosphere;
                localStorage.setItem("weddingAtmosphere", this.selected);

                this.syncStartButton();
            });
        });

        this.startButton.addEventListener("click", () => {
            if (!this.selected) return;

            this.welcome.classList.add("hide");
            this.startAtmosphere();

            setTimeout(() => {
                if (this.hero) {
                    this.hero.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 700);
        });
    }

    restoreSelection() {
        if (!this.selected) return;

        const activeCard = document.querySelector(
            `.atmosphere-card[data-atmosphere="${this.selected}"]`
        );

        if (activeCard) {
            activeCard.classList.add("active");
        }
    }

    syncStartButton() {
        this.startButton.disabled = !this.selected;
    }

    startAtmosphere() {
        if (!this.audio || this.selected === "silence") {
            this.stopAudio();
            return;
        }

        const tracks = {
            nature: "music/nature.mp3",
            music: "music/music.mp3"
        };

        const src = tracks[this.selected];
        if (!src) return;

        this.audio.pause();
        this.audio.src = src;
        this.audio.loop = true;
        this.audio.volume = 0;

        const playPromise = this.audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
        }

        this.fadeAudioIn(0.15);
    }

    fadeAudioIn(targetVolume = 0.15) {
        if (!this.audio) return;

        const step = 0.01;
        const interval = setInterval(() => {
            if (!this.audio) {
                clearInterval(interval);
                return;
            }

            if (this.audio.volume >= targetVolume) {
                clearInterval(interval);
                return;
            }

            this.audio.volume = Math.min(targetVolume, this.audio.volume + step);
        }, 120);
    }

    stopAudio() {
        if (!this.audio) return;
        this.audio.pause();
        this.audio.currentTime = 0;
    }
}

/* ==========================================================
   RSVP FORM
========================================================== */

class RSVPForm {
    constructor() {
        this.form = document.getElementById("rsvpForm");
        this.message = document.getElementById("rsvpMessage");

        if (!this.form) return;

        this.button = this.form.querySelector('button[type="submit"]');
        this.bind();
    }

    bind() {
        this.form.addEventListener("submit", event => {
            event.preventDefault();
            this.submit();
        });
    }

    submit() {
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        this.loading();

        setTimeout(() => {
            this.success();
        }, 1500);
    }

    loading() {
        if (!this.button) return;
        this.button.disabled = true;
        this.button.innerHTML = "Отправляем...";
    }

    success() {
        if (this.button) {
            this.button.innerHTML = "Спасибо ❤️";
            this.button.style.background = "#4CAF50";
            this.button.disabled = false;
        }

        this.form.reset();

        if (this.message) {
            this.message.textContent = "Спасибо! Мы получили Ваш ответ 🤍";
        }
    }
}

/* ==========================================================
   COUNTDOWN
========================================================== */

class Countdown {
    constructor() {
        this.target = new Date("2026-09-05T15:30:00").getTime();

        this.days = document.getElementById("days");
        this.hours = document.getElementById("hours");
        this.minutes = document.getElementById("minutes");
        this.seconds = document.getElementById("seconds");

        if (!this.days) return;

        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = Date.now();
        const diff = Math.max(0, this.target - now);

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        this.days.textContent = String(days).padStart(3, "0");
        this.hours.textContent = String(hours).padStart(2, "0");
        this.minutes.textContent = String(minutes).padStart(2, "0");
        this.seconds.textContent = String(seconds).padStart(2, "0");
    }
}

/* ==========================================================
   GALLERY
========================================================== */

class Gallery {
    constructor() {
        this.images = document.querySelectorAll(".gallery-item img");
        this.lightbox = document.getElementById("lightbox");
        this.preview = document.getElementById("lightboxImage");
        this.close =
            document.getElementById("closeLightbox") ||
            document.getElementById("lightboxClose");

        if (!this.images.length || !this.lightbox || !this.preview || !this.close) return;

        this.bind();
    }

    bind() {
        this.images.forEach(image => {
            image.addEventListener("click", () => {
                this.open(image.src);
            });
        });

        this.close.addEventListener("click", () => this.hide());

        this.lightbox.addEventListener("click", event => {
            if (event.target === this.lightbox) {
                this.hide();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                this.hide();
            }
        });
    }

    open(src) {
        this.preview.src = src;
        this.lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    hide() {
        this.lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }
}

/* ==========================================================
   COPY ADDRESS
========================================================== */

class CopyAddress {
    constructor() {
        this.button =
            document.getElementById("copyAddress") ||
            document.getElementById("copy-address");

        if (!this.button) return;

        this.bind();
    }

    bind() {
        this.button.addEventListener("click", async () => {
            const address = `Гостевой дом «Домики»
Республика Карачаево-Черкесия
г. Карачаевск
ул. Пушкина, д. 127`;

            try {
                await navigator.clipboard.writeText(address);
                this.flash("✅ Адрес скопирован");
            } catch {
                this.fallbackCopy(address);
                this.flash("✅ Адрес скопирован");
            }
        });
    }

    fallbackCopy(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    flash(text) {
        const original = this.button.textContent;
        this.button.textContent = text;

        setTimeout(() => {
            this.button.textContent = original;
        }, 2000);
    }
}

<<<<<<< HEAD
=======
/* ==========================================================
WELCOME ATMOSPHERE
========================================================== */

const atmosphereCards = document.querySelectorAll(".atmosphere-card");

const startJourneyButton = document.getElementById("startJourney");

let selectedAtmosphere = null;

atmosphereCards.forEach(card => {

    card.addEventListener("click", () => {

        atmosphereCards.forEach(item =>
            item.classList.remove("active")
        );

        card.classList.add("active");

        selectedAtmosphere = card.dataset.atmosphere;

        localStorage.setItem(
            "weddingAtmosphere",
            selectedAtmosphere
        );

        startJourneyButton.disabled = false;

    });

});

const savedAtmosphere = localStorage.getItem("weddingAtmosphere");

if(savedAtmosphere){

    const activeCard = document.querySelector(

        `.atmosphere-card[data-atmosphere="${savedAtmosphere}"]`

    );

    if(activeCard){

        activeCard.classList.add("active");

        selectedAtmosphere = savedAtmosphere;

        startJourneyButton.disabled = false;

    }

}

>>>>>>> parent of 999f541 (Update script.js)
/* ==========================================================
   NAVIGATION
========================================================== */

class Navigation {
    constructor() {
        this.header = document.getElementById("header");
        this.burger = document.getElementById("burger");
        this.menu = document.querySelector(".nav-menu");
        this.lastScroll = window.pageYOffset;

        if (!this.header || !this.burger || !this.menu) return;

        this.bind();
    }

    bind() {
        this.burger.addEventListener("click", () => {
            this.burger.classList.toggle("active");
            this.menu.classList.toggle("active");
        });

        this.menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                this.burger.classList.remove("active");
                this.menu.classList.remove("active");
            });
        });

        window.addEventListener("scroll", () => this.onScroll(), { passive: true });
    }

    onScroll() {
        const current = window.pageYOffset;

        if (current < 120) {
            this.header.classList.remove("hide");
            this.lastScroll = current;
            return;
        }

<<<<<<< HEAD
        if (current > this.lastScroll) {
            this.header.classList.add("hide");
        } else {
            this.header.classList.remove("hide");
        }
=======
    setTimeout(() => {
        hero.classList.add("show");
        hero.classList.add("hero-show");
        hero.scrollIntoView({ behavior: "smooth" });
    }, 700);
});


/* =======================================
COPY ADDRESS
======================================= */

const copyButton=document.getElementById("copyAddress");

if(copyButton){

    copyButton.addEventListener("click",()=>{

        navigator.clipboard.writeText(

            "г. Карачаевск, ул. Пушкина, 127 (Гостевой дом Домики)"

        );

        copyButton.textContent="Адрес скопирован ✓";

        setTimeout(()=>{

            copyButton.textContent="Скопировать адрес";

        },2000);

    });

}

/* =======================================
LIGHTBOX
======================================= */

const galleryImages=document.querySelectorAll(".gallery-item img");

const lightbox=document.getElementById("lightbox");

const lightboxImage=document.getElementById("lightboxImage");

const lightboxClose=document.getElementById("lightboxClose");

galleryImages.forEach(image=>{

image.addEventListener("click",()=>{

lightboxImage.src=image.src;

lightbox.classList.add("active");

document.body.style.overflow="hidden";

});

});

function closeLightbox(){

lightbox.classList.remove("active");

document.body.style.overflow="";

}

lightboxClose.addEventListener("click",closeLightbox);

lightbox.addEventListener("click",(e)=>{

if(e.target===lightbox){

closeLightbox();

}

});

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

closeLightbox();

}

});
>>>>>>> parent of 999f541 (Update script.js)

        this.lastScroll = current;
    }
}