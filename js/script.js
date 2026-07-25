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

        this.preloader();

        this.smoothScroll();

        this.reveal();

        this.leaf();

 	new RSVPForm();
	new Countdown();
	new MusicPlayer();
	new Gallery();
	new Navigation();
    },

    cache() {

        this.preloaderElement =
            document.getElementById("preloader");

        this.sections =
            document.querySelectorAll("section, footer");

        this.leafElement =
            document.querySelector("#hero .leaf");

    },

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

    },

    /* ==========================================================
       SMOOTH SCROLL
    ========================================================== */

    smoothScroll() {

        document
            .querySelectorAll('a[href^="#"]')
            .forEach(link => {

                link.addEventListener("click", e => {

                    const id =
                        link.getAttribute("href");

                    const target =
                        document.querySelector(id);

                    if (!target) return;

                    e.preventDefault();

                    target.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                });

            });

    },

    /* ==========================================================
       REVEAL
    ========================================================== */

    reveal() {

        const observer =
            new IntersectionObserver(

                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting)
                            return;

                        entry.target.classList.add("active");

                    });

                },

                {

                    threshold:0.15

                }

            );

        this.sections.forEach(section => {

            section.classList.add("reveal");

            observer.observe(section);

        });

    },

/* =======================================
REVEAL
======================================= */

const reveals=document.querySelectorAll(".reveal");

const revealObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{

threshold:.18

});

reveals.forEach(section=>{

revealObserver.observe(section);

});


    /* ==========================================================
       LEAF
    ========================================================== */

    leaf() {

        if (!this.leafElement) return;

        let angle = 0;

        const animate = () => {

            angle += 0.02;

            const x =
                Math.cos(angle) * 12;

            const y =
                Math.sin(angle) * 8;

            this.leafElement.style.translate =
                `${x}px ${y}px`;

            requestAnimationFrame(animate);

        };

        animate();

    }

};

/* ==========================================================
   RSVP FORM
========================================================== */

class RSVPForm {

    constructor() {

        this.form = document.querySelector("form");

        if (!this.form) return;

        this.button =
            this.form.querySelector("button");

        this.bind();

    }

    bind() {

        this.form.addEventListener(

            "submit",

            (event) => {

                event.preventDefault();

                this.submit();

            }

        );

    }

    submit() {

        if (!this.validate()) return;

        this.loading();

        setTimeout(() => {

            this.success();

        },1500);

    }

    validate() {

        const fields =
        this.form.querySelectorAll(

            "input, textarea, select"

        );

        let valid = true;

        fields.forEach(field=>{

            field.style.borderColor="";

            if(field.value.trim()===""){

                field.style.borderColor="#c43d3d";

                valid=false;

            }

        });

        return valid;

    }

    loading(){

        this.button.disabled=true;

        this.button.innerHTML="Отправляем...";

    }

    success(){

        this.button.innerHTML="Спасибо ❤️";

        this.button.style.background="#4CAF50";

        this.form.reset();

    }

}

/* =======================================
RSVP
======================================= */

const rsvpForm=document.getElementById("rsvpForm");

if(rsvpForm){

rsvpForm.addEventListener("submit",(e)=>{

e.preventDefault();

document.getElementById("rsvpMessage").textContent=

"Спасибо! Мы получили Ваш ответ 🤍";

rsvpForm.reset();

});

}

/* ==========================================================
COUNTDOWN
========================================================== */

class Countdown{

    constructor(){

        this.target=new Date(

            "2026-09-12T15:00:00"

        ).getTime();

        this.days=document.getElementById("days");

        this.hours=document.getElementById("hours");

        this.minutes=document.getElementById("minutes");

        this.seconds=document.getElementById("seconds");

        if(!this.days) return;

        this.update();

        setInterval(()=>{

            this.update();

        },1000);

    }

    update(){

        const now=Date.now();

        const diff=this.target-now;

        const days=Math.floor(diff/86400000);

        const hours=Math.floor(

            diff%86400000/3600000

        );

        const minutes=Math.floor(

            diff%3600000/60000

        );

        const seconds=Math.floor(

            diff%60000/1000

        );

        this.days.textContent=

            String(days).padStart(3,"0");

        this.hours.textContent=

            String(hours).padStart(2,"0");

        this.minutes.textContent=

            String(minutes).padStart(2,"0");

        this.seconds.textContent=

            String(seconds).padStart(2,"0");

    }

}

/* ==========================================================
MUSIC
========================================================== */

class MusicPlayer{

    constructor(){

        this.audio=document.getElementById("music");

        this.button=document.getElementById("musicButton");

        if(!this.audio||!this.button) return;

        this.playing=false;

        this.button.addEventListener(

            "click",

            ()=>{

                this.toggle();

            }

        );

    }

    toggle(){

        if(this.playing){

            this.audio.pause();

            this.button.classList.remove("playing");

        }

        else{

            this.audio.play();

            this.button.classList.add("playing");

        }

        this.playing=!this.playing;

    }

}


/* =======================================
MUSIC
======================================= */

const audio = document.getElementById("backgroundAudio");

const tracks = {

    nature: "music/nature.mp3",

    music: "music/music.mp3"

};

function fadeIn(target = 0.15){

    audio.volume = 0;

    audio.play().catch(()=>{});

    const step = 0.01;

    const interval = setInterval(()=>{

        if(audio.volume >= target){

            clearInterval(interval);

        }else{

            audio.volume = Math.min(target, audio.volume + step);

        }

    },120);

}

function startSelectedAtmosphere(){

    const selected = localStorage.getItem("weddingAtmosphere");

    if(selected === "silence") return;

    if(selected === "nature"){

        audio.src = tracks.nature;

        audio.loop = true;

        fadeIn();

    }

    if(selected === "music"){

        audio.src = tracks.music;

        audio.loop = true;

        fadeIn();

    }

}

/* ==========================================================
GALLERY
========================================================== */

class Gallery{

    constructor(){

        this.images=document.querySelectorAll(

            ".gallery-grid img"

        );

        this.lightbox=

            document.getElementById("lightbox");

        this.preview=

            document.getElementById("lightboxImage");

        this.close=

            document.getElementById("closeLightbox");

        if(!this.images.length) return;

        this.bind();

    }

    bind(){

        this.images.forEach(image=>{

            image.addEventListener(

                "click",

                ()=>{

                    this.open(image.src);

                }

            );

        });

        this.close.addEventListener(

            "click",

            ()=>{

                this.hide();

            }

        );

        this.lightbox.addEventListener(

            "click",

            event=>{

                if(event.target===this.lightbox){

                    this.hide();

                }

            }

        );

    }

    open(src){

        this.preview.src=src;

        this.lightbox.classList.add("active");

    }

    hide(){

        this.lightbox.classList.remove("active");

    }

}

/* ==========================================================
MOBILE NAVIGATION
========================================================== */

class Navigation{

    constructor(){

        this.burger=document.getElementById("burger");

        this.menu=document.querySelector(".nav-menu");

        if(!this.burger||!this.menu) return;

        this.init();

    }

    init(){

        this.burger.addEventListener("click",()=>{

            this.burger.classList.toggle("active");

            this.menu.classList.toggle("active");

        });

        this.menu.querySelectorAll("a").forEach(link=>{

            link.addEventListener("click",()=>{

                this.burger.classList.remove("active");

                this.menu.classList.remove("active");

            });

        });

    }

}


/* ==========================================================
COPY ADDRESS
========================================================== */

const copyButton=document.getElementById("copy-address");

if(copyButton){

    copyButton.addEventListener("click",async()=>{

        const address=`Гостевой дом «Домики»
Республика Карачаево-Черкесия
г. Карачаевск
ул. Пушкина, д. 127`;

        try{

            await navigator.clipboard.writeText(address);

            copyButton.innerHTML="✅ Адрес скопирован";

            setTimeout(()=>{

                copyButton.innerHTML="📋 Скопировать адрес";

            },2000);

        }

        catch(e){

            console.error(e);

        }

    });

}

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

/* =======================================
WELCOME
======================================= */

const welcome=document.getElementById("welcome");

const hero=document.getElementById("hero");

const startJourney=document.getElementById("startJourney");

const atmosphereCards=document.querySelectorAll(".atmosphere-card");

let selectedAtmosphere=null;

atmosphereCards.forEach(card=>{

card.addEventListener("click",()=>{

atmosphereCards.forEach(c=>c.classList.remove("active"));

card.classList.add("active");

selectedAtmosphere=card.dataset.atmosphere;

localStorage.setItem("weddingAtmosphere",selectedAtmosphere);

startJourney.disabled=false;

});

});

const saved=localStorage.getItem("weddingAtmosphere");

if(saved){

const active=document.querySelector(`.atmosphere-card[data-atmosphere="${saved}"]`);

if(active){

active.classList.add("active");

selectedAtmosphere=saved;

startJourney.disabled=false;

}

}

startJourney.addEventListener("click",()=>{

welcome.classList.add("hide");

startSelectedAtmosphere();

setTimeout(()=>{

hero.classList.add("show");

hero.classList.add("show");

hero.classList.add("hero-show");

hero.scrollIntoView({

behavior:"smooth"

});

},700);

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

