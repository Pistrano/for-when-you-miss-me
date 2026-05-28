/* =============================================
   NOSSO CANTINHO 💚 — script.js v3
   ============================================= */

/* ── ELEMENTOS ─────────────────────── */
const musicMessage   = document.getElementById('music-message');
const volume         = document.getElementById('volume');
const topSong        = document.getElementById('top-song');
const diasPassados   = document.getElementById('dias-passados');
const memoryPopup    = document.getElementById('memory-popup');
const saudadeBtn     = document.getElementById('saudade-btn');
const saudadePopup   = document.getElementById('saudade-popup');
const dailyMessage   = document.getElementById('daily-message');
const memoryPhoto    = document.getElementById('memory-photo');
const memoryMessage  = document.getElementById('memory-message');
const welcomeScreen  = document.getElementById('welcome-screen');
const enterBtn       = document.getElementById('enter-btn');
const playlist       = document.getElementById('playlist');
const audio          = document.getElementById('audio');
const background     = document.getElementById('background-blur');
const playBtn        = document.getElementById('play');
const nextBtn        = document.getElementById('next');
const prevBtn        = document.getElementById('prev');
const shuffleBtn     = document.getElementById('shuffle');
const repeatBtn      = document.getElementById('repeat');
const progress       = document.getElementById('progress');
const cover          = document.getElementById('cover');
const titleEl        = document.getElementById('title');
const artistEl       = document.getElementById('artist');
const contador       = document.getElementById('contador');
const letterModal    = document.getElementById('letter-modal');
const openLetter     = document.getElementById('open-letter');
const closeLetter    = document.getElementById('close-letter');
const searchInput    = document.getElementById('search-input');
const timeCurrent    = document.getElementById('time-current');
const timeTotal      = document.getElementById('time-total');
const heartsContainer = document.getElementById('hearts-container');

let musicas      = [];
let musicaAtual  = 0;
let tocando      = false;
let modoAleatorio = false;
let modoRepetir  = false;

/* ── DATAS ─────────────────────────── */
const DATA_IDA    = new Date('2026-05-26T00:00:00');
const DATA_VOLTA  = new Date('2026-07-11T00:00:00');

/* ── FORMATAR TEMPO ────────────────── */
function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/* ── BUSCAR MÚSICAS ────────────────── */
fetch('db.json')
    .then(r => r.json())
    .then(data => {
        musicas = data;
        renderPlaylist(musicas);
        atualizarTopSong();

        // Retomar última música
        const saved = localStorage.getItem('ultimaMusica');
        if (saved !== null) {
            const idx = parseInt(saved);
            if (!isNaN(idx) && idx < musicas.length) {
                musicaAtual = idx;
                const m = musicas[idx];
                titleEl.textContent  = m.titulo;
                artistEl.textContent = m.artista;
                cover.src = `covers/${m.capa}`;
                audio.src = `musics/${m.arquivo}`;
                musicMessage.textContent = m.mensagem || '';
                background.style.backgroundImage = `url(covers/${m.capa})`;
                atualizarCardAtivo();
            }
        }
    });

/* ── RENDERIZAR PLAYLIST ───────────── */
function renderPlaylist(lista) {
    playlist.innerHTML = '';
    lista.forEach((musica, index) => {
        const realIndex = musicas.indexOf(musica);
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="covers/${musica.capa}" alt="${musica.titulo}" loading="lazy">
            <h3>${musica.titulo}</h3>
            <p>${musica.artista}</p>
        `;
        card.addEventListener('click', () => {
            carregarMusica(realIndex);
        });
        playlist.appendChild(card);
    });
    if (lista.length === 0) {
        playlist.innerHTML = '<p style="color:#666;padding:20px;grid-column:1/-1">nenhuma música encontrada 🥺</p>';
    }
    atualizarCardAtivo();
}

/* ── BUSCA (título + artista) ──────── */
searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) { renderPlaylist(musicas); return; }
    const filtradas = musicas.filter(m =>
        m.titulo.toLowerCase().includes(q) ||
        m.artista.toLowerCase().includes(q)
    );
    renderPlaylist(filtradas);
});

/* ── CARREGAR MÚSICA ───────────────── */
function carregarMusica(index) {

    function trocarMusica() {
        musicaAtual = index;
        const musica = musicas[index];

        audio.src    = `musics/${musica.arquivo}`;
        cover.src    = `covers/${musica.capa}`;
        background.style.backgroundImage = `url(covers/${musica.capa})`;
        titleEl.textContent  = musica.titulo;
        artistEl.textContent = musica.artista;
        musicMessage.textContent = musica.mensagem || '';

        // Salvar no localStorage
        localStorage.setItem('ultimaMusica', index);

        // Media Session (lockscreen)
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title:  musica.titulo,
                artist: musica.artista,
                album:  'For When You Miss Me 💚',
                artwork: [{ src: `covers/${musica.capa}`, sizes: '512x512', type: 'image/jpeg' }]
            });
            navigator.mediaSession.setActionHandler('play',          () => audio.play());
            navigator.mediaSession.setActionHandler('pause',         () => audio.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => prevBtn.click());
            navigator.mediaSession.setActionHandler('nexttrack',     () => nextBtn.click());
        }

        mostrarMemoria(musica);
        salvarHistorico(musica.titulo);

        audio.volume = 0;
        audio.play();

        const fadeIn = setInterval(() => {
            if (audio.volume < 0.95) {
                audio.volume = Math.min(audio.volume + 0.05, volume.value / 100);
            } else {
                audio.volume = volume.value / 100;
                clearInterval(fadeIn);
            }
        }, 40);

        tocando = true;
        playBtn.innerHTML = '❚❚';
        syncVisuals();
        atualizarCardAtivo();
    }

    // Crossfade
    if (audio.src && !audio.paused) {
        const fadeOut = setInterval(() => {
            if (audio.volume > 0.05) {
                audio.volume -= 0.05;
            } else {
                clearInterval(fadeOut);
                trocarMusica();
            }
        }, 40);
    } else {
        trocarMusica();
    }
}

/* ── PLAY / PAUSE ──────────────────── */
playBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(25);
    if (!audio.src) return;
    if (tocando) {
        audio.pause();
        playBtn.innerHTML = '▶';
    } else {
        audio.play();
        playBtn.innerHTML = '❚❚';
    }
    tocando = !tocando;
    syncVisuals();
});

/* ── SHUFFLE ───────────────────────── */
shuffleBtn.addEventListener('click', () => {
    modoAleatorio = !modoAleatorio;
    shuffleBtn.classList.toggle('active', modoAleatorio);
});

/* ── REPEAT ────────────────────────── */
repeatBtn.addEventListener('click', () => {
    modoRepetir = !modoRepetir;
    repeatBtn.classList.toggle('active', modoRepetir);
    audio.loop = modoRepetir;
});

/* ── NEXT ──────────────────────────── */
nextBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    tocarProxima();
});

/* ── PREV ──────────────────────────── */
prevBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    if (audio.currentTime > 3) {
        audio.currentTime = 0; return;
    }
    musicaAtual = (musicaAtual - 1 + musicas.length) % musicas.length;
    carregarMusica(musicaAtual);
});

/* ── ENDED ─────────────────────────── */
audio.addEventListener('ended', () => {
    if (!modoRepetir) tocarProxima();
});

/* ── PRÓXIMA ───────────────────────── */
function tocarProxima() {
    if (modoAleatorio) {
        musicaAtual = Math.floor(Math.random() * musicas.length);
    } else {
        musicaAtual = (musicaAtual + 1) % musicas.length;
    }
    carregarMusica(musicaAtual);
}

/* ── CARD ATIVO ────────────────────── */
function atualizarCardAtivo() {
    document.querySelectorAll('.card').forEach((card, i) => {
        // match against real index since filtered list may differ
        const img = card.querySelector('img');
        const isActive = img && musicas[musicaAtual] &&
            img.src.includes(musicas[musicaAtual].capa);
        card.classList.toggle('active', isActive);
    });
}

/* ── PROGRESS + TEMPO ──────────────── */
audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / audio.duration) * 100 || 0;
    progress.value = pct;
    progress.style.setProperty('--progress', `${pct}%`);
    timeCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
});

progress.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

/* ── WELCOME ───────────────────────── */
enterBtn.addEventListener('click', () => {
    welcomeScreen.style.opacity = '0';
    setTimeout(() => welcomeScreen.style.display = 'none', 600);
});

/* ── CONTADOR FALTAM ───────────────── */
function atualizarContador() {
    const agora = new Date();
    const diff  = DATA_VOLTA - agora;

    if (diff <= 0) {
        contador.innerHTML = '💚 ele voltou!';
        return;
    }
    const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    contador.innerHTML = `✈️ faltam ${dias}d • ${horas}h • ${mins}min`;
}

atualizarContador();
setInterval(atualizarContador, 1000);

/* ── CONTADOR DIAS PASSADOS ────────── */
function atualizarDiasPassados() {
    const agora = new Date();
    const diff  = agora - DATA_IDA;
    const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (dias <= 0) {
        diasPassados.innerHTML = '💚 hoje ele foi';
    } else {
        diasPassados.innerHTML = `🥺 já faz ${dias} dia${dias === 1 ? '' : 's'}`;
    }
}

atualizarDiasPassados();
setInterval(atualizarDiasPassados, 60000);

/* ── CARTA ─────────────────────────── */
openLetter.addEventListener('click',  () => letterModal.classList.add('active'));
closeLetter.addEventListener('click', () => letterModal.classList.remove('active'));
letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) letterModal.classList.remove('active');
});

/* ── MODO SAUDADE ──────────────────── */
function ativarModoSaudade() {
    const hora = new Date().getHours();
    document.body.classList.toggle('saudade-mode', hora >= 18 || hora <= 5);
}
ativarModoSaudade();
setInterval(ativarModoSaudade, 60000);

/* ── BOTÃO SAUDADE ─────────────────── */
saudadeBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

    document.body.classList.add('saudade-mode');

    saudadePopup.classList.add('show');
    setTimeout(() => saudadePopup.classList.remove('show'), 3500);

    // Lançar corações 💚
    lancarCoracoes();

    // Tocar Still With You
    const idx = musicas.findIndex(m => m.titulo.toLowerCase().includes('still with you'));
    if (idx !== -1) carregarMusica(idx);
});

/* ── CORAÇÕES FLUTUANTES ───────────── */
function lancarCoracoes() {
    const emojis = ['💚', '🫶', '💚', '💚', '🌿', '💚'];
    for (let i = 0; i < 18; i++) {
        setTimeout(() => {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            heart.style.left  = `${10 + Math.random() * 80}vw`;
            heart.style.fontSize = `${16 + Math.random() * 22}px`;
            heart.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
            heart.style.animationDelay   = `${Math.random() * 0.4}s`;
            heartsContainer.appendChild(heart);
            heart.addEventListener('animationend', () => heart.remove());
        }, i * 80);
    }
}

/* ── MEMÓRIAS ──────────────────────── */
function mostrarMemoria(musica) {
    memoryPhoto.src = `covers/${musica.capa}`;
    memoryMessage.textContent = musica.mensagem || 'lembrei desse dia 💚';
    memoryPopup.classList.add('show');
    clearTimeout(window.memoryTimeout);
    window.memoryTimeout = setTimeout(() => memoryPopup.classList.remove('show'), 5000);
}

/* ── RETURN SCREEN ─────────────────── */
function verificarRetorno() {
    if (new Date() >= DATA_VOLTA) {
        document.getElementById('return-screen').style.display = 'flex';
        document.querySelector('.hero h1').textContent = 'Welcome Home 💚';
        document.querySelector('#daily-message').textContent = 'a distância acabou.';
    }
}
verificarRetorno();

/* ── MENSAGEM DO DIA ───────────────── */
const mensagensDoDia = [
    '💚 mais um dia perto de te abraçar',
    '✈️ a saudade ainda mora aqui, mas você também',
    '🌙 espero que hoje tenha sido leve por aí',
    '🎧 caso hoje esteja difícil, aperta o botão verdinho 💚',
    '💌 eu ainda escolho você, mesmo de longe',
    '☁️ mais um dia vencido do intercâmbio',
    '💚 tô torcendo por você daqui',
    '🫂 espero que alguma música hoje te abrace',
    '✨ menos um dia de distância',
    '🎵 mesmo longe, ainda parece pertinho',
    '🌎 onde você estiver hoje, tô pensando em você',
    '💚 você ainda é meu lugar favorito',
];

function atualizarMensagemDoDia() {
    const idx = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24)) % mensagensDoDia.length;
    dailyMessage.textContent = mensagensDoDia[idx];
}
atualizarMensagemDoDia();

/* ── HISTÓRICO / TOP SONG ──────────── */
function salvarHistorico(titulo) {
    const h = JSON.parse(localStorage.getItem('musicasOuvidas') || '{}');
    h[titulo] = (h[titulo] || 0) + 1;
    localStorage.setItem('musicasOuvidas', JSON.stringify(h));
    atualizarTopSong();
}

function atualizarTopSong() {
    const h = JSON.parse(localStorage.getItem('musicasOuvidas') || '{}');
    const entries = Object.entries(h);
    if (!entries.length) { topSong.textContent = '🎧 ainda sem favorita'; return; }
    const [nome, vezes] = entries.sort((a, b) => b[1] - a[1])[0];
    topSong.textContent = `🎧 ${nome} (${vezes}x)`;
}

/* ── VOLUME ────────────────────────── */
volume.addEventListener('input', () => { audio.volume = volume.value / 100; });

/* ── SYNC VISUAIS ──────────────────── */
function syncVisuals() {
    playBtn.classList.toggle('tocando', tocando);
    cover.classList.toggle('tocando',  tocando);
}

audio.addEventListener('play',  () => { tocando = true;  playBtn.innerHTML = '❚❚'; syncVisuals(); });
audio.addEventListener('pause', () => { tocando = false; playBtn.innerHTML = '▶';  syncVisuals(); });

/* ── LOADING ───────────────────────── */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hide');
    }, 1800);
});

/* ── SERVICE WORKER ────────────────── */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('offline ativo 💚'))
            .catch(e => console.log('erro sw', e));
    });
}

/* ── NOTIFICAÇÃO DIÁRIA ────────────── */
async function pedirPermissaoNotificacao() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    agendarNotificacaoDiaria();
}

function agendarNotificacaoDiaria() {
    if (Notification.permission !== 'granted') return;

    // Verificar se já enviou hoje
    const hoje = new Date().toDateString();
    const ultima = localStorage.getItem('ultimaNotificacao');
    if (ultima === hoje) return;

    const idx = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24)) % mensagensDoDia.length;
    const msg = mensagensDoDia[idx];

    // Calcular ms até 9h de amanhã (ou agora se já passou)
    const agora = new Date();
    const alvo  = new Date(agora);
    alvo.setHours(9, 0, 0, 0);
    if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
    const delay = alvo - agora;

    setTimeout(() => {
        new Notification('Nosso Cantinho 💚', {
            body: msg,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
        });
        localStorage.setItem('ultimaNotificacao', new Date().toDateString());
        agendarNotificacaoDiaria(); // reagendar
    }, delay);
}

// Pedir permissão após 3s (não interromper na entrada)
setTimeout(pedirPermissaoNotificacao, 3000);
