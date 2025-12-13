import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaList, FaStepForward, FaForward, FaPause, FaLock, FaTimes } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';

import { getCurrentUser } from '../../services/authService';
import { forceIntroData } from '../../services/adminService';
import { getEpisodeIntelligence } from '../../services/analyticsService';

const STYLES = `
    .art-panel-drawer { transition: right 0.3s ease; }
    @media (max-width: 768px) {
        .art-control-rewind-10, .art-control-forward-10 { display: none !important; }
    }
    .animate-in { animation: slideInRight 0.5s ease-out forwards; }
    /* GUEST MODE */
    .art-guest-mode .art-control-progress,
    .art-guest-mode .art-control-time,
    .art-guest-mode .art-control-rewind-10,
    .art-guest-mode .art-control-forward-10,
    .art-guest-mode .art-control-skip-intro { display: none !important; }
    .art-guest-mode .art-bottom { background: linear-gradient(transparent, rgba(0,0,0,0.8)) !important; }
    /* LIVE BADGE */
    .wp-live-badge { display: flex; align-items: center; height: 100%; padding: 0 10px; cursor: default; font-weight: 700; font-size: 13px; transition: all 0.2s; }
    .wp-live-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; transition: background-color 0.3s; }
    .wp-live-badge.is-live { color: #fff; pointer-events: none; }
    .wp-live-badge.is-live .wp-live-dot { background-color: #22c55e; }
    .wp-live-badge.is-behind { color: #9ca3af; cursor: pointer; pointer-events: auto; }
    .wp-live-badge.is-behind .wp-live-dot { background-color: #9ca3af; }
    .wp-live-badge.is-behind:hover { color: #fff; }
    .wp-live-badge.is-behind:hover .wp-live-dot { background-color: #ef4444; }
`;

const WatchPartyPlayer = ({ 
    movieSlug, option, style, episodes, servers, currentEp, 
    onEpChange, onServerChange, currentServerIndex, onNextEp, hasNextEp, 
    onArtReady, isGuest = false, startTime = 0, hostCurrentTime = 0, 
    onSyncClick, isHostPaused = false, ...rest 
}) => {
    const artRef = useRef(null);
    const playerRef = useRef(null);
    const hostTimeRef = useRef(0);
    const lastPacketTimeRef = useRef(Date.now()); 
    const onSyncClickRef = useRef(null);
    const isHostPausedRef = useRef(isHostPaused);

    useEffect(() => { 
        hostTimeRef.current = hostCurrentTime;
        lastPacketTimeRef.current = Date.now(); 
    }, [hostCurrentTime]);

    useEffect(() => { onSyncClickRef.current = onSyncClick; }, [onSyncClick]);
    
    useEffect(() => { 
        isHostPausedRef.current = isHostPaused;
        if (isGuest && isHostPaused && playerRef.current) {
            playerRef.current.pause();
        }
    }, [isHostPaused, isGuest]);

    // --- STATE ---
    const [showAutoNext, setShowAutoNext] = useState(false);
    const [nextCount, setNextCount] = useState(0);
    const [showSmartSkip, setShowSmartSkip] = useState(false);
    const [user, setUser] = useState(null);
    const introDataRef = useRef(null);
    const [tempStart, setTempStart] = useState(null); 
    const isAutoNextDismissed = useRef(false);
    const isIntroDismissed = useRef(false); 
    const episodesRef = useRef(episodes);
    const onNextEpRef = useRef(onNextEp);
    const [progressWidth, setProgressWidth] = useState(100);

    useEffect(() => { episodesRef.current = episodes; }, [episodes]);
    useEffect(() => { onNextEpRef.current = onNextEp; }, [onNextEp]);

    // DATA & HELPERS
    useEffect(() => {
        setUser(getCurrentUser());
        introDataRef.current = null;
        setShowSmartSkip(false); setShowAutoNext(false);
        isAutoNextDismissed.current = false; isIntroDismissed.current = false; 
        if (movieSlug && currentEp?.slug) {
            getEpisodeIntelligence(movieSlug, currentEp.slug).then(data => { if (data) introDataRef.current = data; });
        }
    }, [movieSlug, currentEp]);

    // Admin Shortcuts
    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        const handleKeyDown = async (e) => {
            const art = playerRef.current; if (!art) return;
            if (e.altKey && e.key.toLowerCase() === 'i') { e.preventDefault(); setTempStart(art.currentTime); art.notice.show = `🚩 Start Intro: ${art.currentTime.toFixed(1)}s`; }
            if (e.altKey && e.key.toLowerCase() === 'o') { e.preventDefault(); const start = tempStart || 0; const end = art.currentTime; if (confirm(`💾 GOD MODE: Lưu Intro?`)) { try { await forceIntroData({ movie_slug: movieSlug, episode_slug: currentEp?.slug, intro_start: Math.round(start), intro_end: Math.round(end) }); art.notice.show = "✅ Intro Verified!"; introDataRef.current = { ...introDataRef.current, intro_start: start, intro_end: end }; isIntroDismissed.current = false; checkTimeUpdate(art); } catch (err) { alert(err); } } }
            if (e.altKey && e.key.toLowerCase() === 'c') { e.preventDefault(); if (confirm(`💾 GOD MODE: Lưu Auto Next?`)) { try { await forceIntroData({ movie_slug: movieSlug, episode_slug: currentEp?.slug, credits_start: Math.round(art.currentTime) }); art.notice.show = "✅ Ending Verified!"; introDataRef.current = { ...introDataRef.current, credits_start: art.currentTime }; isAutoNextDismissed.current = false; checkTimeUpdate(art); } catch (err) { alert(err); } } }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [user, tempStart, movieSlug, currentEp]);

    const handleSmartSkip = () => { const art = playerRef.current; const data = introDataRef.current; if (art && data?.intro_end) { art.currentTime = data.intro_end; art.play(); setShowSmartSkip(false); } };
    const handleManualNext = (e) => { if (e) e.stopPropagation(); if (isGuest) return alert("Chỉ chủ phòng mới được chuyển tập!"); if (hasNextEp && onNextEpRef.current) onNextEpRef.current(); };
    
    const checkTimeUpdate = (art) => {
        const currentTime = art.currentTime; const duration = art.duration; const intro = introDataRef.current;
        let shouldShowSkip = false; if (intro && intro.intro_end && !isIntroDismissed.current) { if (currentTime >= intro.intro_start && currentTime < intro.intro_end) shouldShowSkip = true; }
        setShowSmartSkip(prev => prev !== shouldShowSkip ? shouldShowSkip : prev);
        
        if (isAutoNextDismissed.current || !hasNextEp) { setShowAutoNext(false); return; }
        let isEnding = false; if (intro && intro.credits_start) { if (currentTime >= intro.credits_start) isEnding = true; }
        
        if (isEnding) { 
            setShowAutoNext(true); 
            const remaining = Math.ceil(duration - currentTime); 
            setNextCount(remaining > 0 ? remaining : 0); 
            // setProgressWidth Logic here if needed
            if (remaining <= 1 && onNextEpRef.current && !isGuest) onNextEpRef.current(); 
        } else { 
            setShowAutoNext(false); 
        }
    };

    // PLAYER INIT
    useEffect(() => {
        const art = new Artplayer({
            ...option,
            container: artRef.current,
            url: option.url,
            autoPlayback: false, autoplay: false, muted: false,
            fullscreen: true, fullscreenWeb: false,
            theme: '#dc2626',
            hotkey: !isGuest,
            mobile: { gesture: !isGuest, clickToPlay: true, lock: false },
            controls: [],
            customType: {
                m3u8: (video, url, art) => {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        art.hls = hls;
                        art.on('destroy', () => hls.destroy());
                    }
                },
            },
        });

        if (isGuest) art.template.$container.classList.add('art-guest-mode');
        if (onArtReady) onArtReady(art);

        if (!isGuest) {
            art.controls.add({ name: 'rewind-10', position: 'left', index: 10, html: renderToStaticMarkup(<MdReplay10 size={22} />), click: () => art.currentTime -= 10 });
            art.controls.add({ name: 'forward-10', position: 'left', index: 11, html: renderToStaticMarkup(<MdForward10 size={22} />), click: () => art.currentTime += 10 });
            art.controls.add({ name: 'skip-intro', position: 'right', index: 10, html: renderToStaticMarkup(<div className="p-1 text-white opacity-80 cursor-pointer art-control-skip-intro"><FaForward size={16} /></div>), click: () => art.currentTime += 85 });
        }

        if (isGuest) {
            art.controls.add({
                name: 'live-badge', position: 'right', index: 10,
                html: `<div class="wp-live-badge is-live"><div class="wp-live-dot"></div><span>TRỰC TIẾP</span></div>`,
                click: function () {
                    const timeSinceUpdate = (Date.now() - lastPacketTimeRef.current) / 1000;
                    const projectedHostTime = hostTimeRef.current + timeSinceUpdate;
                    const diff = Math.abs(art.currentTime - projectedHostTime);
                    if (diff > 3) { 
                        art.currentTime = projectedHostTime; 
                        art.play();
                        art.notice.show = `Đã đồng bộ lại với chủ phòng`;
                        if (onSyncClickRef.current) onSyncClickRef.current();
                    }
                },
                style: { display: 'flex', marginRight: '10px' }
            });
        }

        art.controls.add({ name: 'next-ep', position: 'left', index: 12, html: renderToStaticMarkup(<FaStepForward size={18} />), style: { opacity: hasNextEp ? 1 : 0.5 }, click: (art, e) => handleManualNext(e) });
        art.controls.add({ name: 'ep-list', position: 'right', index: 20, html: renderToStaticMarkup(<FaList size={16} />), click: () => togglePanel('episode-panel') });

        const togglePanel = (targetName) => {
            ['episode-panel'].forEach(name => {
                const p = art.layers[name]; if (!p) return; const drawer = p.querySelector('.art-panel-drawer');
                if (name === targetName) { if (p.style.display === 'none') { p.style.display = 'block'; setTimeout(() => drawer.style.right = '0', 10); } else { drawer.style.right = '-100%'; setTimeout(() => p.style.display = 'none', 300); } } else if (p.style.display !== 'none') { drawer.style.right = '-100%'; setTimeout(() => p.style.display = 'none', 300); }
            });
        };

        const panelClass = "art-panel-drawer absolute top-0 w-1/3 min-w-[200px] h-[calc(100%-48px)] bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col z-[200] rounded-bl-xl pointer-events-auto";
        art.layers.add({ name: 'episode-panel', html: `<div id="ep" class="${panelClass}"><div class="p-4 border-b border-white/10 flex justify-between items-center text-white font-bold text-sm uppercase"><span>Danh Sách Tập</span><span class="close-panel cursor-pointer">✕</span></div><div id="episode-content" class="flex-1 overflow-y-auto p-2 custom-scrollbar"></div></div>`, style: { display: 'none', zIndex: 999, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('episode-panel'); } });

        art.on('play', () => { if (isGuest && isHostPausedRef.current) { art.pause(); art.notice.show = "🔒 Chủ phòng đang tạm dừng phim!"; } });
        art.on('video:timeupdate', () => { checkTimeUpdate(art); });
        art.on('seeked', () => checkTimeUpdate(art));

        art.on('ready', () => {
            if (startTime > 0) {
                art.currentTime = startTime;
                art.play();
                setTimeout(() => { if (Math.abs(art.currentTime - startTime) > 3) art.currentTime = startTime; }, 1000);
            } else if (option.autoplay) {
                art.play().catch(() => art.muted = true);
            }
        });

        playerRef.current = art;
        return () => art.destroy(false);
    }, [option.url]);

    // Panel Events
    useEffect(() => {
        const art = playerRef.current; if (!art) return;
        ['episode-panel'].forEach(name => {
            const container = art.layers[name]?.querySelector('#episode-content');
            if (!container) return;
            container.innerHTML = `<div class="grid grid-cols-4 gap-1.5">${episodes.map(ep => `<div class="p-2 rounded font-bold text-[10px] text-center cursor-pointer border transition-all ${ep.slug === currentEp?.slug ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}" data-slug="${ep.slug}">${ep.name}</div>`).join('')}</div>`;
            Array.from(container.querySelectorAll('[data-slug]')).forEach(item => {
                item.onclick = (e) => {
                    e.stopPropagation(); 
                    if (isGuest) return alert("Chỉ chủ phòng mới được đổi tập!");
                    const p = art.layers[name]; p.querySelector('.art-panel-drawer').style.right = '-100%'; setTimeout(() => p.style.display = 'none', 300);
                    onEpChange(episodesRef.current.find(e => e.slug === item.getAttribute('data-slug'))); 
                };
            });
        });
    }, [episodes, currentServerIndex, currentEp, isGuest]);

    // CHECK LỆCH TIME
    useEffect(() => {
        if (!isGuest || !playerRef.current) return;
        const interval = setInterval(() => {
            const art = playerRef.current;
            if (!art.playing) return;
            const badgeEl = art.template.$container.querySelector('.wp-live-badge');
            if (badgeEl) {
                const timeSinceUpdate = (Date.now() - lastPacketTimeRef.current) / 1000;
                const projectedHostTime = hostTimeRef.current + timeSinceUpdate;
                const diff = Math.abs(art.currentTime - projectedHostTime);
                if (diff <= 5) {
                    if (!badgeEl.classList.contains('is-live')) badgeEl.className = 'wp-live-badge is-live';
                } else {
                    if (!badgeEl.classList.contains('is-behind')) badgeEl.className = 'wp-live-badge is-behind';
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isGuest]);

    return (
        <div className="relative group overflow-hidden w-full h-full" style={style}>
            <style>{STYLES}</style>
            <div ref={artRef} className="w-full h-full"></div>

            {isGuest && isHostPaused && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in pointer-events-auto cursor-not-allowed">
                    <div className="bg-[#12141a]/90 border border-white/10 px-8 py-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl transform scale-105">
                        <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-1">
                            <FaPause className="text-red-500 text-xl animate-pulse" />
                        </div>
                        <h3 className="text-white font-bold text-lg">Phim đang tạm dừng</h3>
                        <p className="text-gray-400 text-xs flex items-center gap-1.5"><FaLock size={10}/> Vui lòng chờ chủ phòng tiếp tục</p>
                    </div>
                </div>
            )}

            {showSmartSkip && (<div onClick={isGuest ? undefined : handleSmartSkip} className={`absolute bottom-24 right-4 z-[160] w-64 ${isGuest ? 'cursor-default opacity-80' : 'cursor-pointer'} group/skip animate-in pointer-events-auto`}><div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover/skip:bg-black/80 group-hover/skip:border-red-500/50"><div className="p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/skip:bg-red-600 group-hover/skip:text-white transition-colors duration-300"><FaForward size={14} className="ml-0.5" /></div><div className="flex-1 min-w-0 flex flex-col justify-center"><div className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-0.5 group-hover/skip:text-red-400 transition-colors">Giới thiệu</div><div className="text-sm text-white font-bold leading-none">{isGuest ? "Tự động bỏ qua" : "Bỏ qua ngay"}</div></div>{!isGuest && (<div onClick={(e) => { e.stopPropagation(); setShowSmartSkip(false); isIntroDismissed.current = true; }} className="p-2 text-white/30 hover:text-white transition-colors"><FaTimes size={12} /></div>)}</div><div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-red-600 w-full opacity-50"></div></div></div></div>)}
            {showAutoNext && (<div onClick={handleManualNext} className={`absolute bottom-24 right-4 z-[160] w-64 ${isGuest ? 'cursor-default' : 'cursor-pointer'} group/next animate-in pointer-events-auto`}><div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover/next:bg-black/80 group-hover/next:border-red-500/50"><div className="p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/next:bg-red-600 group-hover/next:text-white transition-colors duration-300"><FaStepForward size={14} className="ml-0.5" /></div><div className="flex-1 min-w-0 flex flex-col justify-center"><div className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-0.5 group-hover/next:text-red-400 transition-colors">Tập sau trong {nextCount}s</div><div className="text-sm text-white font-bold leading-none truncate">Tập tiếp theo</div></div>{!isGuest && (<button onClick={(e) => { e.stopPropagation(); setShowAutoNext(false); isAutoNextDismissed.current = true; }} className="p-2 text-white/30 hover:text-white transition-colors"><FaTimes size={12} /></button>)}</div><div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-red-600 transition-all duration-300 ease-linear" style={{ width: `${progressWidth}%` }}></div></div></div></div>)}
        </div>
    );
};

export default WatchPartyPlayer;