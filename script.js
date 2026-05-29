/* =============================================
   NOSSO CANTINHO 💚 — script.js v4
   ============================================= */

/* ── ELEMENTOS ─────────────────────── */
const musicMessage    = document.getElementById('music-message');
const volumeEl        = document.getElementById('volume');
const topSongVal      = document.getElementById('top-song-val');
const diasPassadosEl  = document.getElementById('dias-passados');
const memoryPopup     = document.getElementById('memory-popup');
const saudadeBtn      = document.getElementById('saudade-btn');
const saudadePopup    = document.getElementById('saudade-popup');
const dailyMessage    = document.getElementById('daily-message');
const memoryPhoto     = document.getElementById('memory-photo');
const memoryMessage   = document.getElementById('memory-message');
const welcomeScreen   = document.getElementById('welcome-screen');
const enterBtn        = document.getElementById('enter-btn');
const playlistEl      = document.getElementById('playlist');
const audio           = document.getElementById('audio');
const background      = document.getElementById('background-blur');
const heroCover       = document.getElementById('hero-cover');
const playBtn         = document.getElementById('play');
const nextBtn         = document.getElementById('next');
const prevBtn         = document.getElementById('prev');
const shuffleBtn      = document.getElementById('shuffle');
const repeatBtn       = document.getElementById('repeat');
const progressEl      = document.getElementById('progress');
const progressFill    = document.getElementById('progress-fill');
const cover           = document.getElementById('cover');
const coverWrap       = cover ? cover.parentElement : null;
const titleEl         = document.getElementById('title');
const artistEl        = document.getElementById('artist');
const contadorEl      = document.getElementById('contador');
const letterModal     = document.getElementById('letter-modal');
const openLetter      = document.getElementById('open-letter');
const closeLetter     = document.getElementById('close-letter');
const letterOverlay   = document.getElementById('letter-overlay');
const searchInput     = document.getElementById('search-input');
const searchCount     = document.getElementById('search-count');
const timeCurrent     = document.getElementById('time-current');
const timeTotal       = document.getElementById('time-total');
const heartsContainer = document.getElementById('hearts-container');
const playHero        = document.getElementById('play-hero');
const sbDias          = document.getElementById('sb-dias');

let musicas       = [];
let musicaAtual   = 0;
let tocando       = false;
let modoAleatorio = false;
let modoRepetir   = false;

/* ── DATAS ─────────────────────────── */
const DATA_IDA   = new Date('2026-02-09T00:00:00Z'); // UTC
const DATA_VOLTA = new Date('2026-07-11T00:00:00Z'); // UTC

/* ── FORMATAR TEMPO ────────────────── */
function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/* ── CARREGAR DB ───────────────────── */
fetch('db.json')
    .then(r => r.json())
    .then(data => {
        musicas = data;
        renderPlaylist(musicas);
        atualizarTopSong();
        if (searchCount) searchCount.textContent = `${musicas.length} músicas`;

        const saved = localStorage.getItem('ultimaMusica');
        if (saved !== null) {
            const idx = parseInt(saved);
            if (!isNaN(idx) && idx < musicas.length) {
                musicaAtual = idx;
                const m = musicas[idx];
                titleEl.textContent   = m.titulo;
                artistEl.textContent  = m.artista;
                cover.src             = `covers/${m.capa}`;
                audio.src             = `musics/${m.arquivo}`;
                if (musicMessage) musicMessage.textContent = m.mensagem || '';
                background.style.backgroundImage = `url(covers/${m.capa})`;
                if (heroCover) heroCover.src = `covers/${m.capa}`;
                atualizarCardAtivo();
            }
        }
    });

/* ── RENDERIZAR PLAYLIST ───────────── */
function renderPlaylist(lista) {
    playlistEl.innerHTML = '';
    lista.forEach(musica => {
        const realIndex = musicas.indexOf(musica);
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="covers/${musica.capa}" alt="${musica.titulo}" loading="lazy">
            <h3>${musica.titulo}</h3>
            <p>${musica.artista}</p>
        `;
        card.addEventListener('click', () => carregarMusica(realIndex));
        playlistEl.appendChild(card);
    });
    if (lista.length === 0) {
        playlistEl.innerHTML = '<p style="color:#555;padding:24px;grid-column:1/-1;text-align:center">nenhuma música encontrada 🥺</p>';
    }
    atualizarCardAtivo();
}

/* ── BUSCA ─────────────────────────── */
searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    const filtradas = q
        ? musicas.filter(m => m.titulo.toLowerCase().includes(q) || m.artista.toLowerCase().includes(q))
        : musicas;
    renderPlaylist(filtradas);
    if (searchCount) searchCount.textContent = `${filtradas.length} música${filtradas.length !== 1 ? 's' : ''}`;
});

/* ── CARREGAR MÚSICA ───────────────── */
function carregarMusica(index) {
    function trocarMusica() {
        musicaAtual = index;
        const musica = musicas[index];

        audio.src   = `musics/${musica.arquivo}`;
        cover.src   = `covers/${musica.capa}`;
        if (heroCover) heroCover.src = `covers/${musica.capa}`;
        background.style.backgroundImage = `url(covers/${musica.capa})`;
        titleEl.textContent  = musica.titulo;
        artistEl.textContent = musica.artista;
        if (musicMessage) musicMessage.textContent = musica.mensagem || '';

        localStorage.setItem('ultimaMusica', index);

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title:  musica.titulo,
                artist: musica.artista,
                album:  'Nosso Cantinho 💚',
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

        const alvo = volumeEl.value / 100;
        const fadeIn = setInterval(() => {
            if (audio.volume < alvo - 0.05) {
                audio.volume = Math.min(audio.volume + 0.05, alvo);
            } else {
                audio.volume = alvo;
                clearInterval(fadeIn);
            }
        }, 40);

        tocando = true;
        playBtn.textContent = '❚❚';
        syncVisuals();
        atualizarCardAtivo();
    }

    // crossfade
    if (audio.src && !audio.paused && audio.volume > 0) {
        const fadeOut = setInterval(() => {
            if (audio.volume > 0.06) { audio.volume -= 0.06; }
            else { clearInterval(fadeOut); trocarMusica(); }
        }, 40);
    } else {
        trocarMusica();
    }
}

/* ── PLAY / PAUSE ──────────────────── */
playBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(20);
    if (!audio.src) return;
    if (tocando) { audio.pause(); } else { audio.play(); }
    tocando = !tocando;
    syncVisuals();
});

/* ── PLAY HERO BUTTON ──────────────── */
if (playHero) {
    playHero.addEventListener('click', () => {
        if (!tocando && musicas.length) carregarMusica(musicaAtual || 0);
        else if (tocando) { audio.pause(); tocando = false; syncVisuals(); }
    });
}

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

/* ── NEXT / PREV ───────────────────── */
nextBtn.addEventListener('click', () => { if (navigator.vibrate) navigator.vibrate(15); tocarProxima(); });
prevBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    musicaAtual = (musicaAtual - 1 + musicas.length) % musicas.length;
    carregarMusica(musicaAtual);
});

audio.addEventListener('ended', () => { if (!modoRepetir) tocarProxima(); });

function tocarProxima() {
    musicaAtual = modoAleatorio
        ? Math.floor(Math.random() * musicas.length)
        : (musicaAtual + 1) % musicas.length;
    carregarMusica(musicaAtual);
}

/* ── CARD ATIVO ────────────────────── */
function atualizarCardAtivo() {
    document.querySelectorAll('.card').forEach(card => {
        const img = card.querySelector('img');
        const ativo = img && musicas[musicaAtual] && img.src.includes(encodeURIComponent(musicas[musicaAtual].capa).replace(/%20/g,' '));
        card.classList.toggle('active', ativo);
    });
}

/* ── PROGRESS ──────────────────────── */
audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / audio.duration) * 100 || 0;
    progressEl.value = pct;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
});

progressEl.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (progressEl.value / 100) * audio.duration;
});

/* ── WELCOME ───────────────────────── */
enterBtn.addEventListener('click', () => {
    welcomeScreen.style.opacity = '0';
    setTimeout(() => welcomeScreen.style.display = 'none', 700);
});

/* ── CONTADOR FALTAM ───────────────── */
function atualizarContador() {
    const agora = new Date();
    const diff  = DATA_VOLTA - agora;
    if (diff <= 0) {
        if (contadorEl) contadorEl.textContent = 'voltou! 💚';
        return;
    }
    const dias  = Math.floor(diff / 864e5);
    const horas = Math.floor((diff % 864e5) / 36e5);
    const mins  = Math.floor((diff % 36e5) / 6e4);
    if (contadorEl) contadorEl.textContent = `${dias}d ${horas}h ${mins}min`;
}
atualizarContador();
setInterval(atualizarContador, 1000);

/* ── DIAS PASSADOS ─────────────────── */
function atualizarDiasPassados() {
    const _agora = new Date(); const _meia = new Date(Date.UTC(_agora.getUTCFullYear(),_agora.getUTCMonth(),_agora.getUTCDate())); const dias = Math.max(0, Math.floor((_meia - DATA_IDA) / 864e5));
    const txt  = dias === 0 ? 'hoje foi' : `${dias} dia${dias === 1 ? '' : 's'}`;
    if (diasPassadosEl) diasPassadosEl.textContent = txt;
    if (sbDias) sbDias.textContent = dias;
}
atualizarDiasPassados();
setInterval(atualizarDiasPassados, 60000);

/* ── CARTA ─────────────────────────── */
openLetter.addEventListener('click', () => letterModal.classList.add('active'));
closeLetter.addEventListener('click', () => letterModal.classList.remove('active'));
if (letterOverlay) letterOverlay.addEventListener('click', () => letterModal.classList.remove('active'));

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
    lancarCoracoes();
    const idx = musicas.findIndex(m => m.titulo.toLowerCase().includes('still with you'));
    if (idx !== -1) carregarMusica(idx);
    else if (musicas.length) carregarMusica(0);
});

/* ── CORAÇÕES ──────────────────────── */
function lancarCoracoes() {
    const emojis = ['💚','🫶','💚','💚','🌿','💚','✨'];
    for (let i = 0; i < 22; i++) {
        setTimeout(() => {
            const h = document.createElement('span');
            h.className = 'floating-heart';
            h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            h.style.left  = `${5 + Math.random() * 90}vw`;
            h.style.fontSize = `${14 + Math.random() * 24}px`;
            h.style.animationDuration = `${2 + Math.random() * 2}s`;
            h.style.animationDelay    = `${Math.random() * 0.3}s`;
            heartsContainer.appendChild(h);
            h.addEventListener('animationend', () => h.remove());
        }, i * 70);
    }
}

/* ── MEMÓRIAS ──────────────────────── */
function mostrarMemoria(musica) {
    if (!memoryPopup) return;
    memoryPhoto.src = `covers/${musica.capa}`;
    if (memoryMessage) memoryMessage.textContent = musica.mensagem || 'lembrei desse dia 💚';
    memoryPopup.classList.add('show');
    clearTimeout(window._memTimer);
    window._memTimer = setTimeout(() => memoryPopup.classList.remove('show'), 5000);
}

/* ── RETURN ────────────────────────── */
function verificarRetorno() {
    if (new Date() >= DATA_VOLTA) {
        const rs = document.getElementById('return-screen');
        if (rs) rs.style.display = 'flex';
    }
}
verificarRetorno();

/* ── MENSAGEM DO DIA ───────────────── */
const mensagensDoDia = [
    '💚 já tá quase. cada dia conta.',
    '✈️ do outro lado do mundo, mas ainda pertinho daqui',
    '🌙 espero que hoje tenha sido leve por aí',
    '🎧 caso a saudade aperte hoje, esse lugar é seu 💚',
    '💌 eu ainda escolho você, mesmo com o oceano no meio',
    '☁️ mais um dia vencido. a reta final tá chegando.',
    '💚 tô pensando em você todo dia daqui',
    '🫂 espero que alguma música hoje te abrace um pouco',
    '✨ menos um dia de distância. tô contando.',
    '🎵 mesmo longe, você ainda é minha música favorita',
    '🌎 onde você estiver hoje, eu tô torcendo por você',
    '💚 você ainda é meu lugar favorito do mundo inteiro',
    '🛬 quase lá. quase aqui. quase junto.',
    '💚 109 dias de saudade e cada um valeu',
    '🌿 você vai voltar e eu vou tá aqui do mesmo jeito',
];
function atualizarMensagemDoDia() {
    const idx = Math.floor(Date.now() / 864e5) % mensagensDoDia.length;
    if (dailyMessage) dailyMessage.textContent = mensagensDoDia[idx];
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
    if (!entries.length) { if (topSongVal) topSongVal.textContent = '—'; return; }
    const [nome] = entries.sort((a,b) => b[1]-a[1])[0];
    const curto = nome.length > 18 ? nome.slice(0,16)+'…' : nome;
    if (topSongVal) topSongVal.textContent = curto;
}

/* ── VOLUME ────────────────────────── */
volumeEl.addEventListener('input', () => { audio.volume = volumeEl.value / 100; });

/* ── SYNC VISUAIS ──────────────────── */
function syncVisuals() {
    playBtn.textContent = tocando ? '❚❚' : '▶';
    playBtn.classList.toggle('tocando', tocando);
    if (coverWrap) coverWrap.classList.toggle('tocando', tocando);
    if (playHero) playHero.querySelector('span').textContent = tocando ? '❚❚' : '▶';
}

audio.addEventListener('play',  () => { tocando = true;  syncVisuals(); });
audio.addEventListener('pause', () => { tocando = false; syncVisuals(); });

/* ── LOADING ───────────────────────── */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loading-screen').classList.add('hide'), 1800);
});

/* ── SERVICE WORKER ────────────────── */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
}

/* ── NOTIFICAÇÕES DIÁRIAS ──────────── */
async function pedirPermissaoNotificacao() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') await Notification.requestPermission();
    agendarNotificacaoDiaria();
}
function agendarNotificacaoDiaria() {
    if (Notification.permission !== 'granted') return;
    const hoje = new Date().toDateString();
    if (localStorage.getItem('ultimaNotificacao') === hoje) return;
    const idx = Math.floor(Date.now() / 864e5) % mensagensDoDia.length;
    const alvo = new Date(); alvo.setHours(9,0,0,0);
    if (alvo <= new Date()) alvo.setDate(alvo.getDate()+1);
    setTimeout(() => {
        new Notification('Nosso Cantinho 💚', {
            body: mensagensDoDia[idx],
            icon: 'icon-192.png',
        });
        localStorage.setItem('ultimaNotificacao', new Date().toDateString());
        agendarNotificacaoDiaria();
    }, alvo - new Date());
}
setTimeout(pedirPermissaoNotificacao, 3000);

/* ═══════════════════════════════════════
   DATAS ESPECIAIS
═══════════════════════════════════════ */

// Namorando desde 09/12/2025 — datas mensais até 1 ano
const DATAS_ESPECIAIS = [
    // já passadas (mostram se abrir nesse dia exato)
    { data: '2026-01-09', meses: 1,  emoji: '💚', tag: '1 mês juntos',
      titulo: 'um mês<br><em style="color:var(--green)">de você</em>',
      msg: `<span>o primeiro mês inteiro com você.</span>
            <span>ainda tava tentando acreditar que era de verdade.</span>
            <span>obrigado por cada mensagem, cada risada, cada vez que você me fez sentir especial. 💚</span>` },

    { data: '2026-02-09', meses: 2,  emoji: '💚', tag: '2 meses juntos · e você foi embora nesse dia',
      titulo: 'dois meses<br><em style="color:var(--green)">e já saudade</em>',
      msg: `<span>dois meses de namoro e você embarcou pro intercâmbio.</span>
            <span>que timing, né? mas eu nunca duvidei que a gente ia conseguir.</span>
            <span>esse dia tem dois significados: comemoramos e te despedimos. os dois doeram e os dois foram bonitos. 💚</span>` },

    { data: '2026-03-09', meses: 3,  emoji: '💚', tag: '3 meses juntos · de longe',
      titulo: 'três meses<br><em style="color:var(--green)">mesmo longe</em>',
      msg: `<span>três meses. um deles inteiro com você do outro lado do mundo.</span>
            <span>e mesmo assim você ainda me manda bom dia. ainda me conta o dia. ainda é meu namorado favorito.</span>
            <span>a distância não mudou nada do que eu sinto por você. 💚</span>` },

    { data: '2026-04-09', meses: 4,  emoji: '💚', tag: '4 meses juntos',
      titulo: 'quatro meses<br><em style="color:var(--green)">e ainda aqui</em>',
      msg: `<span>quatro meses e eu tô aqui, esperando.</span>
            <span>não tô esperando só porque preciso — tô esperando porque você vale cada dia.</span>
            <span>feliz quatro meses, meu amor. 💚</span>` },

    { data: '2026-05-09', meses: 5,  emoji: '💚', tag: '5 meses juntos',
      titulo: 'cinco meses<br><em style="color:var(--green)">quase metade do ano</em>',
      msg: `<span>cinco meses. quase metade de um ano inteiro com você.</span>
            <span>eu nem percebi a vida antes de você chegar. agora não consigo imaginar sem.</span>
            <span>logo logo a gente comemora de pertinho. tô contando os dias. 💚</span>` },

    // 6 meses — ainda longe
    { data: '2026-06-09', meses: 6,  emoji: '💚', tag: '6 meses juntos · a reta final',
      titulo: '6 meses de<br><em style="color:var(--green)">você e eu</em>',
      msg: `<span>meio ano inteiro com você.</span>
            <span>seis meses de mensagem de bom dia, de ligação tarde da noite, de saudade que dói mas também aquece — porque pelo menos significa que você importa demais.</span>
            <span>você foi embora pro intercâmbio e mesmo assim continuou sendo minha pessoa favorita do mundo. isso não é pouca coisa.</span>
            <span style="color:#c8d0c0;font-size:14px">já faltam poucos dias pra eu te abraçar de verdade. 💚</span>` },

    // dia dos namorados
    { data: '2026-06-12', meses: null, emoji: '🌹', tag: '12 de junho · dia dos namorados',
      titulo: 'feliz dia dos<br><em style="color:var(--green)">namorados</em>',
      msg: `<span>você tá lá e eu tô aqui, mas hoje é nosso do mesmo jeito.</span>
            <span>não precisei de um jantar ou de flores pra saber o quanto gosto de você — eu sinto isso toda vez que você manda uma mensagem no meio do dia só pra dizer que tá pensando em mim.</span>
            <span>esse é meu dia dos namorados favorito. mesmo de longe. mesmo com saudade.</span>
            <span style="color:#c8d0c0;font-size:14px">logo logo você volta e a gente comemora de pertinho. 💚🌹</span>` },

    // 7 meses — ele JÁ VOLTOU (volta 11/07)
    { data: '2026-07-09', meses: 7,  emoji: '🛬', tag: '7 meses juntos · e você voltou!',
      titulo: 'sete meses<br><em style="color:var(--green)">juntos de verdade</em>',
      msg: `<span>sete meses. e você tá aqui.</span>
            <span>eu sobrevivi ao intercâmbio, você sobreviveu ao intercâmbio, e a gente sobreviveu junto.</span>
            <span>agora me deixa te abraçar. de verdade. sem tela no meio. 💚</span>` },

    { data: '2026-08-09', meses: 8,  emoji: '💚', tag: '8 meses juntos',
      titulo: 'oito meses<br><em style="color:var(--green)">de nós</em>',
      msg: `<span>oito meses.</span>
            <span>já deu pra viver de tudo — de perto, de longe, separados por um oceano e reunidos de novo.</span>
            <span>cada mês com você é meu favorito. 💚</span>` },

    { data: '2026-09-09', meses: 9,  emoji: '💚', tag: '9 meses juntos',
      titulo: 'nove meses<br><em style="color:var(--green)">e contando</em>',
      msg: `<span>nove meses. três quartos de um ano.</span>
            <span>eu nem lembro mais direito como era antes de você. e não quero lembrar.</span>
            <span>obrigado por ser tão meu. 💚</span>` },

    { data: '2026-10-09', meses: 10, emoji: '🍂', tag: '10 meses juntos',
      titulo: 'dez meses<br><em style="color:var(--green)">quase lá</em>',
      msg: `<span>dez meses.</span>
            <span>já to vendo o fim do primeiro ano, e tô animado pra ver tudo que ainda vem depois.</span>
            <span>você é a melhor parte de quase todo dia. 💚🍂</span>` },

    { data: '2026-11-09', meses: 11, emoji: '💚', tag: '11 meses juntos · falta um!',
      titulo: 'onze meses<br><em style="color:var(--green)">falta só um</em>',
      msg: `<span>onze meses.</span>
            <span>daqui a trinta dias faz um ano inteiro. eu já tô comemorando antes da hora.</span>
            <span>você virou parte do meu rotina, do meu dia, dos meus planos. e eu não troco por nada. 💚</span>` },

    // 1 ANO 🎉
    { data: '2026-12-09', meses: 12, emoji: '🎉', tag: '09 de dezembro · 1 ano juntos!',
      titulo: '1 ano de<br><em style="color:var(--green)">você e eu</em>',
      msg: `<span>UM ANO.</span>
            <span>365 dias. doze meses. um intercâmbio. saudade de sobra. ligações tarde da noite. mensagens no meio do trabalho. músicas que viraram nossas.</span>
            <span>você foi pro outro lado do mundo e voltou. e eu tava aqui. e vou continuar estando.</span>
            <span>feliz aniversário de namoro, meu amor. esse é só o primeiro de muitos. 💚🎉</span>` },
];

/* ── MILESTONES NO COUNTDOWN ─────────── */
const DATA_ANIVERSARIO_6M = new Date('2026-06-09T00:00:00Z');
const DATA_NAMORADOS      = new Date('2026-06-12T00:00:00Z');
const DATA_1ANO           = new Date('2026-12-09T00:00:00Z');

/* ── TELA DE CONTAGEM REGRESSIVA ─────── */

function iniciarCountdown() {
    const screen = document.getElementById('countdown-screen');
    const agora  = new Date();
    if (agora >= DATA_VOLTA) return;

    screen.classList.add('active');
    criarParticulasCD();
    atualizarMilestones();

    function tick() {
        const now  = new Date();
        const diff = DATA_VOLTA - now;
        if (diff <= 0) { screen.classList.remove('active'); return; }
        const d = Math.floor(diff / 864e5);
        const h = Math.floor((diff % 864e5) / 36e5);
        const m = Math.floor((diff % 36e5) / 6e4);
        const s = Math.floor((diff % 6e4) / 1e3);
        document.getElementById('cd-dias').textContent  = String(d).padStart(2,'0');
        document.getElementById('cd-horas').textContent = String(h).padStart(2,'0');
        document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
        document.getElementById('cd-segs').textContent  = String(s).padStart(2,'0');
        const miniTimer = document.getElementById('cel-mini-timer');
        if (miniTimer) miniTimer.textContent = `${d} dia${d !== 1 ? 's' : ''}`;
    }
    tick();
    setInterval(tick, 1000);

    document.getElementById('cd-enter').addEventListener('click', () => {
        screen.classList.remove('active');
        verificarCelebracao();
    });
}

function atualizarMilestones() {
    const agora = new Date();

    const msAniv     = document.getElementById('ms-aniversario');
    const msAnivCount= document.getElementById('ms-aniv-count');
    const diff6m     = DATA_ANIVERSARIO_6M - agora;
    if (diff6m <= 0) {
        msAniv.classList.add('passou');
        msAnivCount.textContent = 'já passou 💚';
    } else {
        msAnivCount.textContent = `em ${Math.floor(diff6m/864e5)} dia${Math.floor(diff6m/864e5)!==1?'s':''}`;
    }

    const msNamor     = document.getElementById('ms-namorados');
    const msNamorCount= document.getElementById('ms-namor-count');
    const diffNamor   = DATA_NAMORADOS - agora;
    if (diffNamor <= 0) {
        msNamor.classList.add('passou');
        msNamorCount.textContent = 'já passou 🌹';
    } else {
        msNamorCount.textContent = `em ${Math.floor(diffNamor/864e5)} dia${Math.floor(diffNamor/864e5)!==1?'s':''}`;
    }
}

/* ── PARTÍCULAS NO COUNTDOWN ─────────── */
function criarParticulasCD() {
    const container = document.getElementById('cd-particles');
    if (!container) return;
    const emojis = ['💚','✨','🌿','💫','🫶'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('span');
        p.style.cssText = `position:absolute;font-size:${14+Math.random()*16}px;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${0.06+Math.random()*0.1};animation:particleFloat ${6+Math.random()*8}s ease-in-out infinite;animation-delay:${Math.random()*5}s;pointer-events:none;`;
        p.textContent = emojis[Math.floor(Math.random()*emojis.length)];
        container.appendChild(p);
    }
    if (!document.getElementById('particle-style')) {
        const s = document.createElement('style');
        s.id = 'particle-style';
        s.textContent = `@keyframes particleFloat{0%,100%{transform:translateY(0) rotate(0deg);}33%{transform:translateY(-18px) rotate(8deg);}66%{transform:translateY(10px) rotate(-6deg);}}`;
        document.head.appendChild(s);
    }
}

/* ── TELA DE CELEBRAÇÃO ──────────────── */
function verificarCelebracao() {
    const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

    const especial = DATAS_ESPECIAIS.find(d => d.data === hoje);
    if (!especial) return;

    const screen = document.getElementById('celebration-screen');
    document.getElementById('cel-emoji').textContent = especial.emoji;
    document.getElementById('cel-tag').textContent   = especial.tag;
    document.getElementById('cel-title').innerHTML   = especial.titulo;
    document.getElementById('cel-msg').innerHTML     = especial.msg;

    // Mini timer — só mostra se ainda não voltou
    const miniArea = document.querySelector('.cel-countdown-mini');
    const agora = new Date();
    if (agora >= DATA_VOLTA || !miniArea) {
        if (miniArea) miniArea.style.display = 'none';
    } else {
        const dias = Math.floor((DATA_VOLTA - agora) / 864e5);
        document.getElementById('cel-mini-timer').textContent = `${dias} dia${dias !== 1 ? 's' : ''}`;
    }

    screen.classList.add('active');
    setTimeout(() => lancarConfetti(), 400);

    const btn = document.getElementById('cel-enter');
    // remover listeners antigos
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => screen.classList.remove('active'));
}

/* ── CONFETTI ────────────────────────── */
function lancarConfetti() {
    const canvas = document.getElementById('cel-confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const cores = ['#1DB954','#22e05a','#a8dfc0','#f0e8dc','#dba0b0','#ffffff','#ffd700'];
    const particulas = Array.from({length: 140}, () => ({
        x: Math.random() * canvas.width, y: -10 - Math.random() * 200,
        w: 4 + Math.random() * 7, h: 10 + Math.random() * 12,
        cor: cores[Math.floor(Math.random() * cores.length)],
        vx: (Math.random() - .5) * 3, vy: 1.5 + Math.random() * 3,
        rot: Math.random() * 360, vr: (Math.random() - .5) * 6, opa: 1,
    }));

    let frame;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let vivas = 0;
        particulas.forEach(p => {
            if (p.y > canvas.height + 20) return;
            vivas++;
            p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.opa -= 0.004;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opa);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.cor;
            ctx.beginPath();
            ctx.roundRect(-p.w/2, -p.h/2, p.w, p.h, 2);
            ctx.fill();
            ctx.restore();
        });
        if (vivas > 0) frame = requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
    setTimeout(() => {
        particulas.forEach(p => { p.y = -10 - Math.random()*200; p.x = Math.random()*canvas.width; p.opa = 1; });
        if (frame) cancelAnimationFrame(frame);
        draw();
    }, 2200);
}

/* ── INICIAR FLUXO ───────────────────── */
window.addEventListener('load', () => {
    setTimeout(() => {
        const agora = new Date();
        const hoje  = agora.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
        const ehCelebracao  = DATAS_ESPECIAIS.some(d => d.data === hoje);
        const ehDepoisVolta = agora >= DATA_VOLTA;

        if (ehDepoisVolta) {
            // tela de volta já está no HTML
        } else if (ehCelebracao) {
            document.getElementById('welcome-screen').style.display = 'none';
            verificarCelebracao();
        } else {
            const origEnter = document.getElementById('enter-btn');
            if (origEnter) {
                origEnter.addEventListener('click', () => {
                    setTimeout(iniciarCountdown, 650);
                }, { once: true });
            }
        }
    }, 2000);
});
