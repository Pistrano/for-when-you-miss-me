const musicMessage =
document.getElementById(
"music-message"
);

const volume =
document.getElementById(
"volume"
);

const topSong =
document.getElementById(
"top-song"
);

const memoryPopup =
document.getElementById(
"memory-popup"
);

const saudadeBtn =
document.getElementById(
"saudade-btn"
);

const saudadePopup =
document.getElementById(
"saudade-popup"
);

const dailyMessage =
document.getElementById(
"daily-message"
);

const memoryPhoto =
document.getElementById(
"memory-photo"
);

const memoryMessage =
document.getElementById(
"memory-message"
);

const welcomeScreen =
document.getElementById(
"welcome-screen"
);

const enterBtn =
document.getElementById(
"enter-btn"
);

const playlist =
document.getElementById(
"playlist"
);

const audio =
document.getElementById(
"audio"
);

const background =
document.getElementById(
"background-blur"
);

const playBtn =
document.getElementById(
"play"
);

const nextBtn =
document.getElementById(
"next"
);

const prevBtn =
document.getElementById(
"prev"
);

const shuffleBtn =
document.getElementById(
"shuffle"
);

const progress =
document.getElementById(
"progress"
);

const cover =
document.getElementById(
"cover"
);

const title =
document.getElementById(
"title"
);

const artist =
document.getElementById(
"artist"
);

const contador =
document.getElementById(
"contador"
);

const letterModal =
document.getElementById(
"letter-modal"
);

const openLetter =
document.getElementById(
"open-letter"
);

const closeLetter =
document.getElementById(
"close-letter"
);

let musicas = [];
let musicaAtual = 0;
let tocando = false;
let modoAleatorio = false;

/* =====================
   BUSCAR MÚSICAS
===================== */

fetch("db.json")
.then(res => res.json())
.then(data => {

    musicas = data;

    musicas.forEach(
    (musica, index) => {

        const card =
        document.createElement(
        "div"
        );

        card.classList.add(
        "card"
        );

        card.innerHTML = `
            <img src="covers/${musica.capa}">
            <h3>${musica.titulo}</h3>
            <p>${musica.artista}</p>
        `;

        card.addEventListener(
        "click",
        () => {

            carregarMusica(
            index
            );

            atualizarCardAtivo();
        });

        playlist.appendChild(
        card
        );
    });
});

/* =====================
   CARREGAR MÚSICA
===================== */

function carregarMusica(index){

    musicaAtual = index;

    const musica =
    musicas[index];

    /* fade out */

    audio.style.transition =
    "opacity .4s ease";

    audio.style.opacity = 0;

    setTimeout(() => {

        audio.src =
        `musics/${musica.arquivo}`;

        cover.src =
        `covers/${musica.capa}`;

        title.textContent =
        musica.titulo;

        artist.textContent =
        musica.artista;

        if(musica.mensagem){
            musicMessage.textContent =
            musica.mensagem;
            mostrarMemoria(
    musica
);
        } else {
            musicMessage.textContent = "";
        }

        /* quando carregar */

        audio.addEventListener(
        "canplay",
        () => {

            audio.play();
            salvarHistorico(
    musica.titulo
);

            audio.style.opacity = 1;

        },
        { once:true });

        /* card ativo */

        document
        .querySelectorAll(".card")
        .forEach(card =>
            card.classList
            .remove("active")
        );

        document
        .querySelectorAll(".card")
        [index]
        ?.classList
        .add("active");

    }, 350);

    tocando = true;

    playBtn.innerHTML =
    "❚❚";
}
/* =====================
   PLAY / PAUSE
===================== */

playBtn.addEventListener(
"click",
() => {

    if(!audio.src)
    return;

    if(tocando){

        audio.pause();

        playBtn.innerHTML =
        "▶";

    } else {

        audio.play();

        playBtn.innerHTML =
        "❚❚";
    }

    tocando =
    !tocando;
});

/* =====================
   SHUFFLE
===================== */

shuffleBtn.addEventListener(
"click",
() => {

    modoAleatorio =
    !modoAleatorio;

    shuffleBtn.classList.toggle(
        "active",
        modoAleatorio
    );
});

/* =====================
   NEXT
===================== */

nextBtn.addEventListener(
"click",
() => {

    tocarProxima();
});

/* =====================
   PREV
===================== */

prevBtn.addEventListener(
"click",
() => {

    musicaAtual--;

    if(
        musicaAtual < 0
    ){
        musicaAtual =
        musicas.length - 1;
    }

    carregarMusica(
    musicaAtual
    );

    atualizarCardAtivo();
});

/* =====================
   MÚSICA TERMINOU
===================== */

audio.addEventListener(
"ended",
() => {

    tocarProxima();
});

/* =====================
   PRÓXIMA MÚSICA
===================== */

function tocarProxima(){

    if(modoAleatorio){

        musicaAtual =
        Math.floor(
            Math.random()
            * musicas.length
        );

    } else {

        musicaAtual++;

        if(
            musicaAtual
            >= musicas.length
        ){
            musicaAtual = 0;
        }
    }

    carregarMusica(
    musicaAtual
    );

    atualizarCardAtivo();
}

/* =====================
   CARD ATIVO
===================== */

function atualizarCardAtivo(){

    const cards =
    document.querySelectorAll(
        ".card"
    );

    cards.forEach(
    card => {

        card.classList.remove(
        "active"
        );
    });

    cards[
    musicaAtual
    ]?.classList.add(
    "active"
    );
}

/* =====================
   PROGRESS BAR
===================== */

audio.addEventListener("timeupdate", () => {

    const percent =
    (audio.currentTime /
    audio.duration) * 100 || 0;

    progress.value = percent;

    progress.style.setProperty(
        "--progress",
        `${percent}%`
    );
});

progress.addEventListener(
"input",
() => {

    if(audio.duration){

        audio.currentTime =
        (
        progress.value
        / 100
        ) * audio.duration;
    }
});

/* =====================
   WELCOME SCREEN
===================== */

enterBtn.addEventListener(
"click",
() => {

    welcomeScreen
    .style.opacity =
    "0";

    setTimeout(() => {

        welcomeScreen
        .style.display =
        "none";

    }, 600);
});

/* =====================
   CONTADOR
===================== */

const dataVolta =
new Date(
"2026-07-11T00:00:00"
);

function atualizarContador(){

    const agora =
    new Date();

    const diferenca =
    dataVolta - agora;

    if(diferenca <= 0){

        contador.innerHTML =
        "💚 ele voltou";

        return;
    }

    const dias =
    Math.floor(
        diferenca /
        (1000 * 60 * 60 * 24)
    );

    const horas =
    Math.floor(
        (
            diferenca %
            (1000 * 60 * 60 * 24)
        ) /
        (1000 * 60 * 60)
    );

    const minutos =
    Math.floor(
        (
            diferenca %
            (1000 * 60 * 60)
        ) /
        (1000 * 60)
    );

    contador.innerHTML =
    `✈️ faltam
    ${dias} dias •
    ${horas}h •
    ${minutos}min`;
}

atualizarContador();

setInterval(
    atualizarContador,
    1000
);
/* =====================
   CARTA
===================== */

openLetter
.addEventListener(
"click",
() => {

    letterModal
    .classList.add(
    "active"
    );
});

closeLetter
.addEventListener(
"click",
() => {

    letterModal
    .classList.remove(
    "active"
    );
});
function ativarModoSaudade(){

    const hora =
    new Date().getHours();

    const body =
    document.body;

    if(hora >= 18 || hora <= 5){

        body.classList.add(
            "saudade-mode"
        );

    } else {

        body.classList.remove(
            "saudade-mode"
        );
    }
}

ativarModoSaudade();

setInterval(
    ativarModoSaudade,
    60000
);
function mostrarMemoria(
    musica
){

    memoryPhoto.src =
    `covers/${musica.capa}`;

    memoryMessage.textContent =
    musica.mensagem ||
    "lembrei desse dia 💚";

    memoryPopup.classList
    .add("show");

    clearTimeout(
        window.memoryTimeout
    );

    window.memoryTimeout =
    setTimeout(() => {

        memoryPopup
        .classList
        .remove("show");

    }, 5000);
}
function verificarRetorno(){

    const hoje =
    new Date();

    const dataRetorno =
    new Date(
        "2026-07-11"
    );

    if(
        hoje >= dataRetorno
    ){

        document
        .getElementById(
            "return-screen"
        )
        .style.display =
        "flex";

        document
        .querySelector(
            ".hero h1"
        )
        .textContent =
        "Welcome Home 💚";

        document
        .querySelector(
            ".hero-description"
        )
        .textContent =
        "a distância acabou.";
    }
}

verificarRetorno();
saudadeBtn
.addEventListener(
"click",
() => {

    /* ativa saudade mode */

    document.body
    .classList.add(
        "saudade-mode"
    );

    /* popup */

    saudadePopup
    .classList.add(
        "show"
    );

    setTimeout(() => {

        saudadePopup
        .classList.remove(
            "show"
        );

    }, 3500);

    /* procura still with you */

    const musicaSaudade =
    musicas.findIndex(
        musica =>
        musica.titulo
        .toLowerCase()
        .includes(
            "still with you"
        )
    );

    if(
        musicaSaudade !== -1
    ){

        carregarMusica(
            musicaSaudade
        );
    }
});
/* ✨ MENSAGEM DO DIA */

const mensagensDoDia = [

"💚 mais um dia perto de te abraçar",

"✈️ a saudade ainda mora aqui, mas você também",

"🌙 espero que hoje tenha sido leve por aí",

"🎧 caso hoje esteja difícil, aperta o botão verdinho 💚",

"💌 eu ainda escolho você, mesmo de longe",

"☁️ mais um dia vencido do intercâmbio",

"💚 tô torcendo por você daqui",

"🫂 espero que alguma música hoje te abrace",

"✨ menos um dia de distância",

"🎵 mesmo longe, ainda parece pertinho",

"🌎 onde você estiver hoje, tô pensando em você",

"💚 você ainda é meu lugar favorito"

];

function atualizarMensagemDoDia(){

    const hoje =
    new Date();

    const numeroDia =
    Math.floor(
        hoje.getTime() /
        (1000 * 60 * 60 * 24)
    );

    const index =
    numeroDia %
    mensagensDoDia.length;

    dailyMessage.textContent =
    mensagensDoDia[index];
}

atualizarMensagemDoDia();
/* 🎵 MAIS OUVIDA */

function salvarHistorico(
    titulo
){

    const historico =
    JSON.parse(
        localStorage.getItem(
            "musicasOuvidas"
        )
    ) || {};

    historico[titulo] =
    (historico[titulo] || 0)
    + 1;

    localStorage.setItem(
        "musicasOuvidas",
        JSON.stringify(
            historico
        )
    );

    atualizarTopSong();
}

function atualizarTopSong(){

    const historico =
    JSON.parse(
        localStorage.getItem(
            "musicasOuvidas"
        )
    ) || {};

    const entries =
    Object.entries(
        historico
    );

    if(entries.length === 0){

        topSong.textContent =
        "🎧 ainda sem favorita";

        return;
    }

    const favorita =
    entries.sort(
        (a,b) =>
        b[1] - a[1]
    )[0];

    topSong.textContent =
    `🎧 ${favorita[0]}
    (${favorita[1]}x)`;
}

atualizarTopSong();
/* 🔊 VOLUME */

volume.addEventListener(
"input",
() => {

    audio.volume =
    volume.value / 100;
});
/* ✨ LOADING */

window.addEventListener(
"load",
() => {

    setTimeout(() => {

        document
        .getElementById(
            "loading-screen"
        )
        .classList.add(
            "hide"
        );

    }, 1800);
});