import React, { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaMicrophone, FaList, FaStepForward, FaForward, FaTimes } from 'react-icons/fa';
import { MdReplay10, MdForward10 } from 'react-icons/md';

import siteLogo from '../assets/logo.png';

// --- CSS GIAO DIỆN ---
const STYLES = `
    /* 1. Popup Resume */
    .resume-popup-box {
        background: rgba(20, 20, 20, 0.8); 
        backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
        padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); 
        max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.8); 
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: auto; transition: all 0.3s;
    }
    .resume-logo { height: 50px; margin-bottom: 15px; object-fit: contain; }
    .resume-title { font-size: 18px; margin-bottom: 10px; color: #fff; font-weight: 700; }
    .resume-text { font-size: 14px; margin-bottom: 20px; color: #ccc; text-align: center; }
    .resume-btn { 
        padding: 10px 20px; font-size: 14px; border-radius: 6px; cursor: pointer; font-weight: 600; 
        display: flex; align-items: center; gap: 8px; justify-content: center; flex: 1; transition: all 0.2s;
    }

    /* 2. Popup Auto Next */
    .auto-next-popup {
        position: absolute; bottom: 80px; right: 20px; z-index: 1000;
        background: rgba(30, 30, 30, 0.8); backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1); 
        padding: 10px 15px; border-radius: 8px; display: flex; align-items: center; gap: 12px;
        transform: translateX(120%); transition: transform 0.4s ease; pointer-events: auto;
    }

    /* 3. Panel Danh Sách (1/3 Màn hình & Kính mờ) */
    .art-panel-drawer {
        position: absolute; top: 0; 
        right: -100%; 
        height: calc(100% - 48px); 
        width: 33.33%;
        min-width: 180px; 
        max-width: 400px; 

        background: rgba(15, 15, 15, 0.85); 
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border-left: 1px solid rgba(255,255,255,0.1); 
        box-shadow: -5px 0 20px rgba(0,0,0,0.5);

        z-index: 200; 
        transition: right 0.3s ease; 
        display: flex; flex-direction: column; pointer-events: auto;
        border-bottom-left-radius: 12px;
    }

    .custom-scrollbar { padding-bottom: 20px; }

    /* 4. Icon Skip Intro */
    .skip-intro-btn {
        display: flex; align-items: center; justify-content: center;
        width: 30px; height: 30px;
        border-radius: 50%; transition: background 0.3s;
    }
    

    /* --- MOBILE RESPONSIVE --- */
    @media (max-width: 768px) {
        /* Chỉ ẩn nút tua 10s, HIỆN LẠI nút Volume */
        .art-control-rewind-10, .art-control-forward-10 { 
            display: none !important; 
        }
        
        .resume-popup-box { padding: 20px 15px !important; width: 85% !important; max-width: 300px !important; }
        .resume-logo { height: 30px !important; margin-bottom: 10px !important; }
        .resume-title { font-size: 15px !important; margin-bottom: 5px !important; }
        .resume-text { font-size: 12px !important; margin-bottom: 15px !important; }
        .resume-btn { padding: 8px 12px !important; font-size: 12px !important; }
        .auto-next-popup { bottom: 70px !important; right: 10px !important; padding: 8px 10px !important; }
        
        .art-panel-drawer { 
            z-index: 99999 !important; 
            min-width: 200px;
        }
    }
`;

// --- HTML TEMPLATES ---
const RESUME_POPUP_HTML = `
<div class="art-resume-popup" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px); z-index: 180; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: auto;">
    <div class="resume-popup-box">
        <img src="${siteLogo}" alt="Logo" class="resume-logo" />
        <h3 class="resume-title">Tiếp tục xem?</h3>
        <p class="resume-text">Bạn đang xem tại <span id="resume-time" style="color: #fff; font-weight: bold; background: #dc2626; padding: 2px 6px; border-radius: 4px;">00:00</span></p>
        <div style="display: flex; gap: 10px; width: 100%;">
            <button id="btn-restart" class="resume-btn" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">Xem lại</button>
            <button id="btn-resume" class="resume-btn" style="background: #dc2626; color: #fff; border: none;">Xem tiếp</button>
        </div>
    </div>
</div>
`;

const AUTO_NEXT_HTML = `
    <div class="auto-next-popup">
        <div style="display: flex; flex-direction: column;">
            <span style="font-size: 9px; color: #ccc; text-transform: uppercase;">Tự chuyển tập</span>
            <span style="font-size: 12px; color: #fff; font-weight: 700;">Tiếp theo</span>
        </div>
        <div id="btn-now-auto" style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <svg width="30" height="30" style="transform: rotate(-90deg); position: absolute;"><circle r="13" cx="15" cy="15" fill="transparent" stroke="rgba(255,255,255,0.15)" stroke-width="2"></circle><circle id="auto-next-ring" r="13" cx="15" cy="15" fill="transparent" stroke="#dc2626" stroke-width="2" stroke-dasharray="81" stroke-dashoffset="0" stroke-linecap="round"></circle></svg>
            <div style="color: #fff; font-size: 10px; z-index: 2;">${renderToStaticMarkup(<FaStepForward />)}</div>
        </div>
        <div id="btn-cancel-auto" style="position: absolute; top: -5px; left: -5px; width: 16px; height: 16px; background: #333; border-radius: 50%; color: #fff; border: 1px solid #555; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 8px;">${renderToStaticMarkup(<FaTimes />)}</div>
    </div>
`;

const createPanelHTML = (title, contentId) => `
<div class="art-panel-drawer">
    <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold; font-size: 14px; color: #fff; display: flex; justify-content: space-between; align-items: center;">
        <span>${title}</span>
        <span class="close-panel" style="cursor: pointer; opacity: 0.7; padding: 5px;">✕</span>
    </div>
    <div id="${contentId}" style="flex: 1; overflow-y: auto; padding: 10px;" class="custom-scrollbar"></div>
</div>
`;

const VideoPlayer = ({ movieSlug, option, style, episodes, servers, currentEp, onEpChange, onServerChange, currentServerIndex, onNextEp, hasNextEp, ...rest }) => {
    const artRef = useRef(null);
    const playerRef = useRef(null);
    const isAutoNextVisible = useRef(false);
    const autoNextTimer = useRef(null);
    const switchTimeRef = useRef(0);

    const episodesRef = useRef(episodes);
    const currentEpRef = useRef(currentEp);

    useEffect(() => { episodesRef.current = episodes; }, [episodes]);
    useEffect(() => { currentEpRef.current = currentEp; }, [currentEp]);

    const getSafeStorageKey = () => {
        if (!movieSlug || !currentEpRef.current || !currentEpRef.current.slug) return null;
        return `art_time_v6_${movieSlug}_${currentEpRef.current.slug}`;
    };

    const icons = {
        rewind: renderToStaticMarkup(<MdReplay10 size={22} />),
        forward: renderToStaticMarkup(<MdForward10 size={22} />),
        server: renderToStaticMarkup(<FaMicrophone size={16} />),
        list: renderToStaticMarkup(<FaList size={16} />),
        skipIntro: renderToStaticMarkup(<FaForward size={14} />),
        nextEp: renderToStaticMarkup(<FaStepForward size={18} />),
    };

    const renderServerList = () => {
        if (!servers?.length) return '<div style="color:#888; padding:20px; text-align:center; font-size:12px;">Đang tải...</div>';
        return servers.map((s, idx) => `
            <div class="server-item" data-index="${idx}" style="padding: 10px; margin-bottom: 5px; border-radius: 4px; cursor: pointer; background: ${idx === currentServerIndex ? '#dc2626' : 'rgba(255,255,255,0.05)'}; color: ${idx === currentServerIndex ? '#fff' : '#ccc'}; font-size: 13px; display: flex; justify-content: space-between; border: 1px solid ${idx === currentServerIndex ? '#dc2626' : 'transparent'};"><span>${s.server_name || `Server ${idx + 1}`}</span></div>
        `).join('');
    };

    const renderEpisodeList = () => {
        if (!episodes?.length) return '<div style="color:#888; padding:20px; text-align:center; font-size:12px;">Đang tải...</div>';
        return `
            <div class="episode-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px;">
                ${episodes.map(ep => `
                    <div class="episode-item" data-slug="${String(ep.slug)}" style="padding: 8px 4px; border-radius: 4px; cursor: pointer; text-align: center; background: ${ep.slug === currentEp?.slug ? '#dc2626' : 'rgba(255,255,255,0.05)'}; color: ${ep.slug === currentEp?.slug ? '#fff' : '#bbb'}; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px solid rgba(255,255,255,0.1);">${ep.name}</div>
                `).join('')}
            </div>
        `;
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

            // --- CẤU HÌNH MOBILE (QUAN TRỌNG) ---
            mobile: {
                gesture: true, // Cho phép vuốt tăng giảm âm lượng/độ sáng
                clickToPlay: true, // FIX LỖI: Chạm 1 lần vào video là Pause/Play luôn (không cần double click)
                lock: false,
            },

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

        art.controls.add({ name: 'rewind-10', position: 'left', index: 10, html: icons.rewind, tooltip: '-10s', style: { padding: '0 5px' }, click: () => art.currentTime -= 10 });
        art.controls.add({ name: 'forward-10', position: 'left', index: 11, html: icons.forward, tooltip: '+10s', style: { padding: '0 5px' }, click: () => art.currentTime += 10 });

        art.controls.add({ name: 'next-ep', position: 'left', index: 12, html: icons.nextEp, tooltip: 'Next Ep', style: { padding: '0 5px', opacity: hasNextEp ? 1 : 0.5 }, click: () => hasNextEp && onNextEp && onNextEp() });
        art.controls.add({ name: 'skip-intro', position: 'right', index: 10, html: `<div class="skip-intro-btn">${icons.skipIntro}</div>`, tooltip: 'Skip Intro', style: { padding: '0 5px' }, click: () => { art.currentTime += 85; art.notice.show = 'Skipped Intro'; } });

        art.controls.add({ name: 'ep-list', position: 'right', index: 20, html: icons.list, tooltip: 'List', style: { padding: '0 5px' }, click: () => togglePanel('episode-panel') });
        art.controls.add({ name: 'server-list', position: 'right', index: 21, html: icons.server, tooltip: 'Server', style: { padding: '0 5px' }, click: () => togglePanel('server-panel') });

        // --- TOGGLE PANEL LOGIC ---
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
                } else {
                    if (p.style.display !== 'none') {
                        drawer.style.right = '-100%';
                        setTimeout(() => p.style.display = 'none', 300);
                    }
                }
            });
        };

        // Init Layers
        art.layers.add({ name: 'server-panel', html: createPanelHTML('Server', 'server-content'), style: { display: 'none', zIndex: 170, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('server-panel'); } });
        art.layers.add({ name: 'episode-panel', html: createPanelHTML('Episodes', 'episode-content'), style: { display: 'none', zIndex: 170, pointerEvents: 'none', inset: 0, position: 'absolute' }, mounted: ($el) => { $el.querySelector('.close-panel').onclick = () => togglePanel('episode-panel'); } });
        art.layers.add({
            name: 'auto-next', html: AUTO_NEXT_HTML, style: { zIndex: 120, pointerEvents: 'none', width: '100%', height: '100%', position: 'absolute', inset: 0 }, mounted: ($el) => {
                $el.querySelector('#btn-cancel-auto').onclick = () => { isAutoNextVisible.current = false; $el.querySelector('.auto-next-popup').style.transform = 'translateX(120%)'; clearInterval(autoNextTimer.current); };
                $el.querySelector('#btn-now-auto').onclick = () => { if (hasNextEp && onNextEp) onNextEp(); };
            }
        });

        art.on('video:timeupdate', () => {
            const key = getSafeStorageKey();
            if (key && art.currentTime > 10 && (art.currentTime / art.duration) < 0.98) {
                localStorage.setItem(key, art.currentTime);
            }
            if (hasNextEp && art.duration > 0) {
                const remain = art.duration - art.currentTime;
                if (remain <= 90 && remain > 0 && !isAutoNextVisible.current) {
                    const layer = art.layers['auto-next'];
                    if (layer) {
                        const popup = layer.querySelector('.auto-next-popup');
                        popup.style.transform = 'translateX(0)';
                        isAutoNextVisible.current = true;
                        let count = Math.ceil(remain);
                        const ringEl = popup.querySelector('#auto-next-ring');
                        clearInterval(autoNextTimer.current);
                        autoNextTimer.current = setInterval(() => {
                            count--;
                            const offset = 81 - ((count / 90) * 81);
                            if (ringEl) ringEl.style.strokeDashoffset = -offset;
                            if (count <= 0) { clearInterval(autoNextTimer.current); if (hasNextEp && onNextEp) onNextEp(); }
                        }, 1000);
                    }
                }
            }
        });

        art.on('play', () => {
            isAutoNextVisible.current = false;
            try { art.layers['auto-next'].querySelector('.auto-next-popup').style.transform = 'translateX(120%)'; } catch (e) { }
        });

        art.on('ready', () => {
            if (switchTimeRef.current > 0) {
                art.currentTime = switchTimeRef.current;
                art.play();
                switchTimeRef.current = 0;
                return;
            }
            const key = getSafeStorageKey();
            if (!key) {
                if (option.autoplay) art.play().catch(() => { art.muted = true; art.play(); });
                return;
            }
            const savedTime = parseFloat(localStorage.getItem(key));
            try { art.layers.remove('resume-popup'); } catch (e) { }
            if (savedTime && savedTime > 10) {
                if (art.template.$state) art.template.$state.style.display = 'none';
                art.layers.add({
                    name: 'resume-popup', html: RESUME_POPUP_HTML,
                    style: { zIndex: 180, position: 'absolute', inset: 0, pointerEvents: 'none' },
                    mounted: ($el) => {
                        const d = new Date(savedTime * 1000);
                        const timeStr = d.getUTCHours() > 0 ? `${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}` : `${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
                        $el.querySelector('#resume-time').innerText = timeStr;
                        const play = (t) => {
                            if (art.template.$state) art.template.$state.style.display = '';
                            art.currentTime = t;
                            art.play().catch(() => { art.muted = true; art.play(); });
                            try { art.layers.remove('resume-popup'); } catch (e) { }
                        };
                        $el.querySelector('#btn-restart').onclick = () => { play(0); localStorage.removeItem(key); };
                        $el.querySelector('#btn-resume').onclick = () => play(savedTime);
                    }
                });
            } else if (option.autoplay) {
                art.play().catch(() => { art.muted = true; art.play(); });
            }
        });

        playerRef.current = art;
        return () => { clearInterval(autoNextTimer.current); if (art && art.destroy) art.destroy(false); };
    }, []);

    // --- CẬP NHẬT LIST ---
    useEffect(() => {
        const art = playerRef.current;
        if (!art) return;

        const updatePanel = (name, html, isServer) => {
            const panel = art.layers[name];
            if (!panel) return;
            const container = panel.querySelector('.custom-scrollbar');
            if (container) {
                container.innerHTML = html;
                const items = isServer
                    ? container.querySelectorAll('.server-item')
                    : container.querySelectorAll('.episode-item');

                Array.from(items).forEach(item => {
                    item.onclick = () => {
                        const panelEl = panel.querySelector('.art-panel-drawer');
                        panelEl.style.right = '-100%';
                        setTimeout(() => panel.style.display = 'none', 300);

                        if (isServer) {
                            switchTimeRef.current = art.currentTime;
                            const idx = parseInt(item.getAttribute('data-index'));
                            if (onServerChange) onServerChange(idx);
                        } else {
                            const slug = item.getAttribute('data-slug');
                            const ep = episodesRef.current.find(e => String(e.slug) === String(slug));
                            if (onEpChange && ep) onEpChange(ep);
                        }
                    };
                });
            }
        };

        updatePanel('server-panel', renderServerList(), true);
        updatePanel('episode-panel', renderEpisodeList(), false);
    }, [episodes, servers, currentEp, currentServerIndex]);

    useEffect(() => {
        const art = playerRef.current;
        if (!art || !option.url || art.url === option.url) return;
        isAutoNextVisible.current = false;
        clearInterval(autoNextTimer.current);
        try { art.layers['auto-next'].querySelector('.auto-next-popup').style.transform = 'translateX(120%)'; } catch (e) { }
        art.switchUrl(option.url).then(() => {
            if (switchTimeRef.current > 0) { art.currentTime = switchTimeRef.current; }
        });
    }, [option.url]);

    return (
        <>
            <style>{STYLES}</style>
            <div ref={artRef} style={style} {...rest}></div>
        </>
    );
};

export default VideoPlayer;