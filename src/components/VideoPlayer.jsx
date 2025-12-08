import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaMicrophone, FaList, FaStepForward, FaForward, FaTimes, FaRedo, FaPlay } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';

import siteLogo from '../assets/logo.png';

// --- CSS GIAO DIỆN ---
const STYLES = `
    .art-panel-drawer { 
        transition: right 0.3s ease; 
        pointer-events: auto !important; /* QUAN TRỌNG: Cho phép tương tác click */
    }
    @media (max-width: 768px) {
        .art-control-rewind-10, .art-control-forward-10 { display: none !important; }
    }
`;

const VideoPlayer = ({ movieSlug, option, style, episodes, servers, currentEp, onEpChange, onServerChange, currentServerIndex, onNextEp, hasNextEp, ...rest }) => {
    const artRef = useRef(null);
    const playerRef = useRef(null);
    const switchTimeRef = useRef(0);
    const autoNextTimer = useRef(null);

    const [showResume, setShowResume] = useState(false);
    const [resumeTime, setResumeTime] = useState(0);
    const [showAutoNext, setShowAutoNext] = useState(false);
    const [nextCount, setNextCount] = useState(90);

    const episodesRef = useRef(episodes);
    useEffect(() => { episodesRef.current = episodes; }, [episodes]);

    const getSafeStorageKey = () => {
        if (!movieSlug || !currentEp?.slug) return null;
        return `art_time_v6_${movieSlug}_${currentEp.slug}`;
    };

    useEffect(() => {
        const art = new Artplayer({
            ...option,
            container: artRef.current,
            url: option.url,
            autoPlayback: false, autoplay: false, muted: false,
            fullscreen: true,
            fullscreenWeb: false,
            theme: '#dc2626',
            mobile: { gesture: true, clickToPlay: true, lock: false },
            controls: [],
            customType: {
                m3u8: function (video, url, art) {
                    if (Hls.isSupported()) {
                        if (art.hls) art.hls.destroy();
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        art.hls = hls;
                        art.on('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                    }
                },
            },
        });

        // Add Controls
        art.controls.add({ name: 'rewind-10', position: 'left', index: 10, html: renderToStaticMarkup(<MdReplay10 size={22} />), click: () => art.currentTime -= 10 });
        art.controls.add({ name: 'forward-10', position: 'left', index: 11, html: renderToStaticMarkup(<MdForward10 size={22} />), click: () => art.currentTime += 10 });
        art.controls.add({ name: 'next-ep', position: 'left', index: 12, html: renderToStaticMarkup(<FaStepForward size={18} />), style: { opacity: hasNextEp ? 1 : 0.5 }, click: () => hasNextEp && onNextEp && onNextEp() });
        art.controls.add({ name: 'skip-intro', position: 'right', index: 10, html: renderToStaticMarkup(<div className="text-white opacity-80 cursor-pointer"><FaForward size={16} /></div>), click: () => art.currentTime += 85 });
        art.controls.add({ name: 'ep-list', position: 'right', index: 20, html: renderToStaticMarkup(<FaList size={16} />), click: () => togglePanel('episode-panel') });
        art.controls.add({ name: 'server-list', position: 'right', index: 21, html: renderToStaticMarkup(<FaMicrophone size={16} />), click: () => togglePanel('server-panel') });

        const togglePanel = (targetName) => {
            ['server-panel', 'episode-panel'].forEach(name => {
                const p = art.layers[name];
                if (!p) return;
                const drawer = p.querySelector('.art-panel-drawer');
                if (name === targetName) {
                    if (p.style.display === 'none') {
                        p.style.display = 'block';
                        setTimeout(() => drawer.style.right = '0', 10);
                    } else {
                        drawer.style.right = '-100%';
                        setTimeout(() => p.style.display = 'none', 300);
                    }
                } else if (p.style.display !== 'none') {
                    drawer.style.right = '-100%';
                    setTimeout(() => p.style.display = 'none', 300);
                }
            });
        };

        const panelClass = "art-panel-drawer absolute top-0 w-1/3 min-w-[200px] h-[calc(100%-48px)] bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col z-[200] rounded-bl-xl";
        
        // Gán pointer-events: none cho wrapper (art.layers) nhưng auto cho drawer bên trong
        art.layers.add({ name: 'server-panel', html: `<div id="sp" class="${panelClass}"><div class="p-4 border-b border-white/10 flex justify-between items-center text-white font-bold text-sm uppercase"><span>Chọn Server</span><span class="close-panel cursor-pointer">✕</span></div><div id="server-content" class="flex-1 overflow-y-auto p-2 custom-scrollbar"></div></div>`, style: { display: 'none', zIndex: 300, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('server-panel'); } });
        art.layers.add({ name: 'episode-panel', html: `<div id="ep" class="${panelClass}"><div class="p-4 border-b border-white/10 flex justify-between items-center text-white font-bold text-sm uppercase"><span>Danh Sách Tập</span><span class="close-panel cursor-pointer">✕</span></div><div id="episode-content" class="flex-1 overflow-y-auto p-2 custom-scrollbar"></div></div>`, style: { display: 'none', zIndex: 300, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('episode-panel'); } });

        art.on('video:timeupdate', () => {
            const key = getSafeStorageKey();
            if (key && art.currentTime > 10 && (art.currentTime / art.duration) < 0.98) localStorage.setItem(key, art.currentTime);

            if (hasNextEp && art.duration - art.currentTime <= 90 && art.currentTime > 0) {
                setShowAutoNext(true);
                setNextCount(Math.ceil(art.duration - art.currentTime));
            }
        });

        art.on('ready', () => {
            if (switchTimeRef.current > 0) { art.currentTime = switchTimeRef.current; art.play(); switchTimeRef.current = 0; return; }
            const savedTime = parseFloat(localStorage.getItem(getSafeStorageKey()));
            if (savedTime > 10) {
                setResumeTime(savedTime);
                setShowResume(true);
                if (art.template.$state) art.template.$state.style.display = 'none';
            } else if (option.autoplay) art.play().catch(() => art.muted = true);
        });

        playerRef.current = art;
        return () => art.destroy(false);
    }, [option.url]);

    useEffect(() => {
        const art = playerRef.current;
        if (!art) return;
        ['server-panel', 'episode-panel'].forEach(name => {
            const container = art.layers[name].querySelector(name === 'server-panel' ? '#server-content' : '#episode-content');
            if (!container) return;
            if (name === 'server-panel') {
                container.innerHTML = servers.map((s, idx) => `<div class="p-3 mb-1 cursor-pointer rounded-lg border transition-all ${idx === currentServerIndex ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'}" data-index="${idx}">${s.server_name || `Server ${idx + 1}`}</div>`).join('');
            } else {
                container.innerHTML = `<div class="grid grid-cols-4 gap-1.5">${episodes.map(ep => `<div class="p-2 rounded font-bold text-[10px] text-center cursor-pointer border transition-all ${ep.slug === currentEp?.slug ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}" data-slug="${ep.slug}">${ep.name}</div>`).join('')}</div>`;
            }

            Array.from(container.querySelectorAll('[data-index], [data-slug]')).forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation(); // FIX: Chặn sự kiện click lan ra Video Player gây Pause
                    
                    const p = art.layers[name];
                    const drawer = p.querySelector('.art-panel-drawer');
                    drawer.style.right = '-100%';
                    setTimeout(() => p.style.display = 'none', 300);

                    if (name === 'server-panel') {
                        switchTimeRef.current = art.currentTime;
                        onServerChange(parseInt(item.getAttribute('data-index')));
                    } else {
                        onEpChange(episodesRef.current.find(e => e.slug === item.getAttribute('data-slug')));
                    }
                };
            });
        });
    }, [episodes, currentServerIndex, currentEp]);

    return (
        <div className="relative group overflow-hidden w-full h-full" style={style}>
            <style>{STYLES}</style>
            <div ref={artRef} className="w-full h-full"></div>

            {/* POPUPS GIỮ NGUYÊN UI ĐÃ ƯNG Ý */}
            {showResume && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[180] pointer-events-auto">
                    <div className="p-8 rounded-3xl bg-white/10 border border-red-600/30 backdrop-blur-2xl shadow-2xl flex flex-col items-center max-w-[320px]">
                        <img src={siteLogo} className="h-10 mb-4 opacity-90" alt="Logo" />
                        <h3 className="text-white text-lg font-bold mb-1">Tiếp tục xem?</h3>
                        <p className="text-gray-300 text-sm mb-6 text-center">Đang dừng tại <span className="text-red-500 font-mono font-bold tracking-wider">{new Date(resumeTime * 1000).toISOString().substr(11, 8)}</span></p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => { setShowResume(false); playerRef.current.template.$state.style.display = ''; playerRef.current.play(); localStorage.removeItem(getSafeStorageKey()); }} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all">XEM LẠI</button>
                            <button onClick={() => { setShowResume(false); playerRef.current.template.$state.style.display = ''; playerRef.current.currentTime = resumeTime; playerRef.current.play(); }} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/30">XEM TIẾP</button>
                        </div>
                    </div>
                </div>
            )}

            {showAutoNext && (
                <div className="absolute bottom-16 right-4 z-[100] w-80 bg-white/10 backdrop-blur-xl border border-red-600/40 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500">
                    <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 flex-shrink-0">
                            <FaStepForward size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-white/50 uppercase font-black tracking-widest">Tập tiếp theo trong {nextCount}s</div>
                            <div className="text-sm text-white font-bold truncate leading-tight">Chuyển sang tập phim mới...</div>
                        </div>
                        <button onClick={() => setShowAutoNext(false)} className="p-1 text-white/50 hover:text-white transition-colors">
                            <FaTimes size={14} />
                        </button>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full">
                        <div className="h-full bg-red-600 transition-all duration-1000 ease-linear" style={{ width: `${(nextCount / 90) * 100}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;