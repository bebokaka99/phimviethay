import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaForward, FaStepForward } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';
import { FaList, FaMicrophone } from 'react-icons/fa'; 
import { FaTimes, FaMagic } from 'react-icons/fa'; // Import FaMagic (God Mode icon)

import siteLogo from '../../assets/logo.png';
import { getCurrentUser } from '../../services/authService';
import { forceIntroData } from '../../services/adminService';
import { getEpisodeIntelligence } from '../../services/analyticsService';

const STYLES = `
    .art-panel-drawer { transition: right 0.3s ease; }
    @media (max-width: 768px) { .art-control-rewind-10, .art-control-forward-10 { display: none !important; } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    .animate-in { animation: slideInRight 0.5s ease-out forwards; }
`;

const VideoPlayer = ({ movieSlug, option, style, episodes, servers, currentEp, onEpChange, onServerChange, currentServerIndex, onNextEp, hasNextEp, onArtReady }) => {
    const artRef = useRef(null);
    const playerRef = useRef(null);
    const switchTimeRef = useRef(0);
    
    // --- SỬA LỖI GOD MODE: Lấy user một lần, không thay đổi
    const user = getCurrentUser(); 
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    // -----------------------------------------------------------------

    const [showResume, setShowResume] = useState(false);
    const [resumeTime, setResumeTime] = useState(0);
    const [showAutoNext, setShowAutoNext] = useState(false);
    const [nextCount, setNextCount] = useState(0);
    const [showSmartSkip, setShowSmartSkip] = useState(false);
    
    const introDataRef = useRef(null);
    const [tempStart, setTempStart] = useState(null);
    const isAutoNextDismissed = useRef(false);
    const isIntroDismissed = useRef(false);
    const episodesRef = useRef(episodes);
    const onNextEpRef = useRef(onNextEp);

    useEffect(() => { episodesRef.current = episodes; }, [episodes]);
    useEffect(() => { onNextEpRef.current = onNextEp; }, [onNextEp]);

    // 1. Fetch Intro Data
    useEffect(() => {
        introDataRef.current = null;
        setShowSmartSkip(false); setShowAutoNext(false);
        isAutoNextDismissed.current = false; isIntroDismissed.current = false;

        if (movieSlug && currentEp?.slug) {
            getEpisodeIntelligence(movieSlug, currentEp.slug).then(data => { if (data) introDataRef.current = data; });
        }
    }, [movieSlug, currentEp]);

    // 2. God Mode Shortcuts (Chỉ chạy khi là Admin/Super Admin)
    useEffect(() => {
        if (!isAdmin) return;
        const handleKeyDown = async (e) => {
            const art = playerRef.current; if (!art) return;
            
            if (e.altKey && e.key.toLowerCase() === 'i') { 
                e.preventDefault(); setTempStart(art.currentTime); 
                art.notice.show = `🚩 Start Intro: ${art.currentTime.toFixed(1)}s`; 
            }
            if (e.altKey && e.key.toLowerCase() === 'o') { 
                e.preventDefault(); 
                const start = tempStart || 0; const end = art.currentTime;
                if (confirm(`💾 GOD MODE: Lưu Intro?\n${start.toFixed(1)}s -> ${end.toFixed(1)}s`)) {
                    try {
                        await forceIntroData({ movie_slug: movieSlug, episode_slug: currentEp?.slug, intro_start: Math.round(start), intro_end: Math.round(end) });
                        art.notice.show = "✅ Intro Verified!";
                        introDataRef.current = { ...introDataRef.current, intro_start: start, intro_end: end };
                        isIntroDismissed.current = false; checkTimeUpdate(art);
                    } catch (err) { alert(err); }
                }
            }
            if (e.altKey && e.key.toLowerCase() === 'c') { 
                e.preventDefault();
                if (confirm(`💾 GOD MODE: Lưu Auto Next?\nTại: ${art.currentTime.toFixed(1)}s`)) {
                    try {
                        await forceIntroData({ movie_slug: movieSlug, episode_slug: currentEp?.slug, credits_start: Math.round(art.currentTime) });
                        art.notice.show = "✅ Ending Verified!";
                        introDataRef.current = { ...introDataRef.current, credits_start: art.currentTime };
                        isAutoNextDismissed.current = false; checkTimeUpdate(art);
                    } catch (err) { alert(err); }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAdmin, tempStart, movieSlug, currentEp]); // Thêm isAdmin vào dependency array

    // 3. Player Logic (Giữ nguyên logic của bạn)
    const handleSmartSkip = () => {
        const art = playerRef.current; const data = introDataRef.current;
        if (art && data?.intro_end) { art.currentTime = data.intro_end; art.play(); setShowSmartSkip(false); }
    };

    const getSafeStorageKey = () => (movieSlug && currentEp?.slug) ? `art_time_v6_${movieSlug}_${currentEp.slug}` : null;
    const handleManualNext = (e) => { if (e) e.stopPropagation(); if (hasNextEp && onNextEpRef.current) onNextEpRef.current(); };

    const checkTimeUpdate = (art) => {
        const currentTime = art.currentTime; const duration = art.duration; const intro = introDataRef.current;
        
        let shouldShowSkip = false;
        if (intro && intro.intro_end && !isIntroDismissed.current) { 
            if (currentTime >= intro.intro_start && currentTime < intro.intro_end) shouldShowSkip = true; 
        }
        setShowSmartSkip(prev => prev !== shouldShowSkip ? shouldShowSkip : prev);

        if (isAutoNextDismissed.current || !hasNextEp) { setShowAutoNext(false); return; }
        
        if (intro && intro.credits_start && currentTime >= intro.credits_start) {
            setShowAutoNext(true);
            const remaining = Math.ceil(duration - currentTime);
            setNextCount(remaining > 0 ? remaining : 0);
            if (remaining <= 1 && onNextEpRef.current) onNextEpRef.current();
        } else { setShowAutoNext(false); }
    };

    useEffect(() => {
        const art = new Artplayer({
            ...option, container: artRef.current, url: option.url,
            autoPlayback: false, autoplay: false, muted: false,
            fullscreen: true, fullscreenWeb: false, theme: '#dc2626',
            mobile: { gesture: true, clickToPlay: true, lock: false },
            controls: [],
            customType: {
                m3u8: (video, url, art) => {
                    if (Hls.isSupported()) {
                        const hls = new Hls(); hls.loadSource(url); hls.attachMedia(video); art.hls = hls;
                        art.on('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = url; }
                },
            },
        });

        if (onArtReady) onArtReady(art);

        art.controls.add({ name: 'rewind-10', position: 'left', index: 10, html: renderToStaticMarkup(<MdReplay10 size={22} />), click: () => art.currentTime -= 10 });
        art.controls.add({ name: 'forward-10', position: 'left', index: 11, html: renderToStaticMarkup(<MdForward10 size={22} />), click: () => art.currentTime += 10 });
        art.controls.add({ name: 'next-ep', position: 'left', index: 12, html: renderToStaticMarkup(<FaStepForward size={18} />), style: { opacity: hasNextEp ? 1 : 0.5 }, click: (art, e) => handleManualNext(e) });
        art.controls.add({ name: 'ep-list', position: 'right', index: 20, html: renderToStaticMarkup(<FaList size={16} />), click: () => togglePanel('episode-panel') });
        art.controls.add({ name: 'server-list', position: 'right', index: 21, html: renderToStaticMarkup(<FaMicrophone size={16} />), click: () => togglePanel('server-panel') });

        const togglePanel = (targetName) => {
            ['server-panel', 'episode-panel'].forEach(name => {
                const p = art.layers[name]; if (!p) return; const drawer = p.querySelector('.art-panel-drawer');
                if (name === targetName) { 
                    if (p.style.display === 'none') { p.style.display = 'block'; setTimeout(() => drawer.style.right = '0', 10); } 
                    else { drawer.style.right = '-100%'; setTimeout(() => p.style.display = 'none', 300); } 
                } else if (p.style.display !== 'none') { drawer.style.right = '-100%'; setTimeout(() => p.style.display = 'none', 300); }
            });
        };

        const panelClass = "art-panel-drawer absolute top-0 w-1/3 min-w-[200px] h-[calc(100%-48px)] bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col z-[200] rounded-bl-xl pointer-events-auto";
        art.layers.add({ name: 'server-panel', html: `<div id="sp" class="${panelClass}"><div class="p-4 border-b border-white/10 flex justify-between items-center text-white font-bold text-sm uppercase"><span>Chọn Server</span><span class="close-panel cursor-pointer">✕</span></div><div id="server-content" class="flex-1 overflow-y-auto p-2 custom-scrollbar"></div></div>`, style: { display: 'none', zIndex: 999, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('server-panel'); } });
        art.layers.add({ name: 'episode-panel', html: `<div id="ep" class="${panelClass}"><div class="p-4 border-b border-white/10 flex justify-between items-center text-white font-bold text-sm uppercase"><span>Danh Sách Tập</span><span class="close-panel cursor-pointer">✕</span></div><div id="episode-content" class="flex-1 overflow-y-auto p-2 custom-scrollbar"></div></div>`, style: { display: 'none', zIndex: 999, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('episode-panel'); } });

        art.on('video:timeupdate', () => {
            const key = getSafeStorageKey();
            if (key && art.currentTime > 10 && (art.currentTime / art.duration) < 0.98) localStorage.setItem(key, art.currentTime);
            checkTimeUpdate(art);
        });
        art.on('seeked', () => checkTimeUpdate(art));
        
        art.on('ready', () => {
            if (switchTimeRef.current > 0) { art.currentTime = switchTimeRef.current; art.play(); switchTimeRef.current = 0; return; }
            const savedTime = parseFloat(localStorage.getItem(getSafeStorageKey()));
            if (savedTime > 10) {
                setResumeTime(savedTime); setShowResume(true);
                if (art.template.$state) art.template.$state.style.display = 'none';
            } else if (option.autoplay) art.play().catch(() => art.muted = true);
        });

        playerRef.current = art;
        return () => art.destroy(false);
    }, [option.url]);

    useEffect(() => {
        const art = playerRef.current; if (!art) return;
        ['server-panel', 'episode-panel'].forEach(name => {
            const container = art.layers[name]?.querySelector(name === 'server-panel' ? '#server-content' : '#episode-content');
            if (!container) return;
            if (name === 'server-panel') {
                container.innerHTML = servers.map((s, idx) => `<div class="p-3 mb-1 cursor-pointer rounded-lg border transition-all ${idx === currentServerIndex ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'}" data-index="${idx}">${s.server_name || `Server ${idx + 1}`}</div>`).join('');
            } else {
                container.innerHTML = `<div class="grid grid-cols-4 gap-1.5">${episodes.map(ep => `<div class="p-2 rounded font-bold text-[10px] text-center cursor-pointer border transition-all ${ep.slug === currentEp?.slug ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}" data-slug="${ep.slug}">${ep.name}</div>`).join('')}</div>`;
            }
            Array.from(container.querySelectorAll('[data-index], [data-slug]')).forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation(); 
                    const p = art.layers[name]; p.querySelector('.art-panel-drawer').style.right = '-100%'; setTimeout(() => p.style.display = 'none', 300);
                    if (name === 'server-panel') { switchTimeRef.current = art.currentTime; onServerChange(parseInt(item.getAttribute('data-index'))); } 
                    else { onEpChange(episodesRef.current.find(e => e.slug === item.getAttribute('data-slug'))); }
                };
            });
        });
    }, [episodes, currentServerIndex, currentEp]);

    const endingDuration = (playerRef.current?.duration || 0) - (introDataRef.current?.credits_start || ((playerRef.current?.duration || 0) - 90));
    const progressWidth = endingDuration > 0 ? (nextCount / endingDuration) * 100 : 0;

    return (
        <div className="relative group overflow-hidden w-full h-full" style={style}>
            <style>{STYLES}</style>
            <div ref={artRef} className="w-full h-full"></div>
            
            {/* Vị trí hiển thị nút Skip Intro */}
            {showSmartSkip && (<div onClick={handleSmartSkip} className="absolute bottom-24 right-4 z-[160] w-64 cursor-pointer group/skip animate-in pointer-events-auto"><div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover/skip:bg-black/80 group-hover/skip:border-red-500/50"><div className="p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/skip:bg-red-600 group-hover/skip:text-white transition-colors duration-300"><FaForward size={14} className="ml-0.5" /></div><div className="flex-1 min-w-0 flex flex-col justify-center"><div className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-0.5 group-hover/skip:text-red-400 transition-colors">Giới thiệu</div><div className="text-sm text-white font-bold leading-none">Bỏ qua ngay</div></div><div onClick={(e) => { e.stopPropagation(); setShowSmartSkip(false); isIntroDismissed.current = true; }} className="p-2 text-white/30 hover:text-white transition-colors"><FaTimes size={12} /></div></div><div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-red-600 w-full opacity-50"></div></div></div></div>)}
            
            {/* Vị trí hiển thị nút Auto Next */}
            {showAutoNext && (<div onClick={handleManualNext} className="absolute bottom-24 right-4 z-[160] w-64 cursor-pointer group/next animate-in pointer-events-auto"><div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover/next:bg-black/80 group-hover/next:border-red-500/50"><div className="p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/next:bg-red-600 group-hover/next:text-white transition-colors duration-300"><FaStepForward size={14} className="ml-0.5" /></div><div className="flex-1 min-w-0 flex flex-col justify-center"><div className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-0.5 group-hover/next:text-red-400 transition-colors">Tập sau trong {nextCount}s</div><div className="text-sm text-white font-bold leading-none truncate">Tập tiếp theo</div></div><button onClick={(e) => { e.stopPropagation(); setShowAutoNext(false); isAutoNextDismissed.current = true; }} className="p-2 text-white/30 hover:text-white transition-colors"><FaTimes size={12} /></button></div><div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-red-600 transition-all duration-300 ease-linear" style={{ width: `${progressWidth}%` }}></div></div></div></div>)}

            {/* Vị trí hiển thị God Mode Info */}
            {isAdmin && (
                <div className="absolute top-2 left-2 z-[200] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                     <div className="bg-red-900/90 text-white text-[10px] p-2 rounded shadow-lg backdrop-blur border border-red-500/50">
                        <p className="font-bold flex items-center gap-1 mb-1 text-red-400"><FaMagic/> GOD MODE</p>
                        <p>Alt + I: Đánh dấu Đầu</p>
                        <p>Alt + O: Chốt Intro</p>
                        <p>Alt + C: Chốt Ending</p>
                     </div>
                 </div>
            )}
            
            {/* Vị trí hiển thị nút Resume */}
            {showResume && (<div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[180] pointer-events-auto"><div className="p-8 rounded-3xl bg-white/10 border border-red-600/30 backdrop-blur-2xl shadow-2xl flex flex-col items-center max-w-[320px]"><img src={siteLogo} className="h-10 mb-4 opacity-90" alt="Logo" /><h3 className="text-white text-lg font-bold mb-1 uppercase tracking-wider">Xem tiếp?</h3><p className="text-gray-300 text-sm mb-6 text-center">Đang dừng tại <span className="text-red-500 font-mono font-bold mx-1">{new Date(resumeTime * 1000).toISOString().substr(11, 8)}</span></p><div className="flex gap-3 w-full"><button onClick={() => { setShowResume(false); playerRef.current.template.$state.style.display = ''; playerRef.current.play(); localStorage.removeItem(getSafeStorageKey()); }} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold transition-all">XEM LẠI</button><button onClick={() => { setShowResume(false); playerRef.current.template.$state.style.display = ''; playerRef.current.currentTime = resumeTime; playerRef.current.play(); }} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30">TIẾP TỤC</button></div></div></div>)}
        </div>
    );
};

export default VideoPlayer;