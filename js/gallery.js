/**
 * THE LEAF SCULPTURE MUSEUM — 3-PAVILION ENGINE
 * Uses active Image() probing to bypass browser lazy-load deadlock on hidden slots.
 * Automatically checks .jpg, .JPG, .jpeg, and .png extensions.
 */

document.addEventListener('DOMContentLoaded', () => {
    const MAX_EXHIBITS = 800;
    const IMAGE_FOLDER = 'assets/images/';
    // Checks standard lowercase .jpg first, then common phone/camera fallbacks
    const EXTENSIONS = ['.jpg', '.JPG', '.jpeg', '.png'];

    const galleryGrid = document.getElementById('gallery-grid');
    const liveExhibitCount = document.getElementById('live-exhibit-count');

    const mountedSpecimens = []; // Stores { num, src, title, label }
    let currentLightboxPos = 0;
    
    // Default view is now Pavilion I (no more 'all' / Grand Hall)
    let activeFilterRange = '1-300'; 
    let probesCompleted = 0;

    /* ======================================================================
       1. CREATE 800 ORDERED SLOTS & PROBE IMAGES ACTIVELY
       ====================================================================== */
    function initializeMuseumWall() {
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= MAX_EXHIBITS; i++) {
            const itemSlot = document.createElement('article');
            itemSlot.className = 'gallery-item';
            itemSlot.dataset.index = i;
            itemSlot.style.display = 'none'; // Kept hidden until probe succeeds
            fragment.appendChild(itemSlot);

            // Probe image in memory so browser never deadlocks on display:none
            probeSpecimenImage(i, 0, itemSlot);
        }

        galleryGrid.appendChild(fragment);
    }

    function probeSpecimenImage(i, extIndex, itemSlot) {
        if (extIndex >= EXTENSIONS.length) {
            // None of the extensions matched for this number
            itemSlot.remove();
            checkAllProbesDone();
            return;
        }

        const candidateSrc = `${IMAGE_FOLDER}${i}${EXTENSIONS[extIndex]}`;
        const tester = new Image();

        tester.onload = () => {
            const formattedNum = String(i).padStart(3, '0');

            // --- INTELLIGENT PLAQUE NAMING SYSTEM ---
            let collectionLabel = "";
            let artTitle = "";

            if (i <= 400) {
                collectionLabel = "PAVILION I";
                artTitle = "Art Form GUAVA";
            } else if (i <= 600) {
                collectionLabel = "PAVILION II"; 
                artTitle = "Art Form HIBISCUS"; // <--- CHANGE THIS TO YOUR 2ND SUBJECT NAME
            } else {
                collectionLabel = "PAVILION III"; 
                artTitle = "Art Form NANDHIYAVATTAI"; // <--- CHANGE THIS TO YOUR 3RD SUBJECT NAME
            }
            // ----------------------------------------

            itemSlot.innerHTML = `
                <div class="image-wrapper frame">
                    <div class="art-container">
                        <img src="${candidateSrc}" 
                             alt="${artTitle} Specimen #${formattedNum}">
                    </div>
                </div>
                <div class="wall-plaque-label">
                    <span class="specimen-sub">${collectionLabel} &bull; NO. ${formattedNum}</span>
                    <p class="caption">${artTitle} #${i}</p>
                </div>
            `;

            itemSlot.dataset.mounted = 'true';
            itemSlot.dataset.src = candidateSrc;

            // Show immediately if it matches the currently active Pavilion
            if (isWithinActiveRange(i)) {
                itemSlot.style.display = 'flex';
            }

            // Store the dynamic titles for the Lightbox
            mountedSpecimens.push({ num: i, src: candidateSrc, title: artTitle, label: collectionLabel });
            mountedSpecimens.sort((a, b) => a.num - b.num);

            itemSlot.addEventListener('click', () => {
                openLightboxByNumber(i);
            });

            updateHeaderCounter();
            checkAllProbesDone();
        };

        tester.onerror = () => {
            if (extIndex === 0) {
                probeSpecimenImage(i, extIndex + 1, itemSlot);
            } else {
                probeSpecimenImage(i, extIndex + 1, itemSlot);
            }
        };

        tester.src = candidateSrc;
    }

    function isWithinActiveRange(idx) {
        if (!activeFilterRange || activeFilterRange === 'all') return true;
        const [min, max] = activeFilterRange.split('-').map(Number);
        return idx >= min && idx <= max;
    }

    function updateHeaderCounter() {
        if (liveExhibitCount) {
            liveExhibitCount.textContent = `${mountedSpecimens.length} / ${MAX_EXHIBITS} Exhibits Mounted`;
        }
    }

    function checkAllProbesDone() {
        probesCompleted++;
        if (probesCompleted === MAX_EXHIBITS && mountedSpecimens.length === 0) {
            if (liveExhibitCount) {
                liveExhibitCount.textContent = `0 / ${MAX_EXHIBITS} Exhibits Found`;
            }
            galleryGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem; background: #faf6eb; border: 2px dashed #c59b27; max-width: 680px; margin: 0 auto;">
                    <h3 style="color: #6C0000; font-family: 'Playfair Display', serif; margin-bottom: 0.8rem;">No Exhibit Images Detected Yet</h3>
                    <p style="color: #2b231d; font-size: 0.95rem; margin-bottom: 0.6rem;">
                        The museum looked for <strong><code>assets/images/1.jpg</code></strong> (up to <code>500.jpg</code>) relative to <code>index.html</code>, but could not find them.
                    </p>
                    <p style="color: #5C4B3B; font-size: 0.88rem;">
                        <strong>Quick Checklist:</strong><br>
                        1. Make sure the folder is named <code>assets</code> (all lowercase) with an <code>images</code> folder inside it.<br>
                        2. Make sure your images are named <code>1.jpg</code>, <code>2.jpg</code>, <code>3.jpg</code> (not <code>1.jpg.jpg</code>).
                    </p>
                </div>
            `;
        }
    }

    /* ======================================================================
       2. CURATORIAL WING TABS (About / Vision / Mission / Read All)
       ====================================================================== */
    const wingTabs = document.querySelectorAll('.wing-tab');
    const tablets = document.querySelectorAll('.archival-tablet');

    wingTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;

            wingTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            if (target === 'all') {
                tablets.forEach(tablet => tablet.classList.add('active'));
            } else {
                tablets.forEach(tablet => {
                    tablet.classList.toggle('active', tablet.id === target);
                });
            }
        });
    });

    /* ======================================================================
       3. PAVILION RANGE FILTERING (1-400, 401-600, 601-800)
       ====================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilterRange = btn.dataset.range;
            const mountedItems = galleryGrid.querySelectorAll('.gallery-item[data-mounted="true"]');

            mountedItems.forEach(item => {
                const idx = parseInt(item.dataset.index, 10);
                item.style.display = isWithinActiveRange(idx) ? 'flex' : 'none';
            });
        });
    });

    /* ======================================================================
       4. CURATORIAL LIGHTBOX INSPECTION VIEW
       ====================================================================== */
    const lightbox = document.getElementById('art-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCat = document.getElementById('lightbox-cat');
    const btnClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    function openLightboxByNumber(specimenNumber) {
        const pos = mountedSpecimens.findIndex(item => item.num === specimenNumber);
        if (pos === -1) return;
        currentLightboxPos = pos;
        renderLightboxSpecimen();
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function renderLightboxSpecimen() {
        const item = mountedSpecimens[currentLightboxPos];
        const formattedNum = String(item.num).padStart(3, '0');
        
        lightboxImg.src = item.src;
        lightboxImg.alt = `${item.title} Specimen #${formattedNum}`;
        lightboxCat.textContent = `${item.label} ARCHIVE &bull; NO. ${formattedNum}`;
        lightboxCaption.textContent = `${item.title} #${item.num}`;
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    btnClose.addEventListener('click', closeLightbox);
    
    btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!mountedSpecimens.length) return;
        currentLightboxPos = (currentLightboxPos - 1 + mountedSpecimens.length) % mountedSpecimens.length;
        renderLightboxSpecimen();
    });

    btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!mountedSpecimens.length) return;
        currentLightboxPos = (currentLightboxPos + 1) % mountedSpecimens.length;
        renderLightboxSpecimen();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') btnPrev.click();
        if (e.key === 'ArrowRight') btnNext.click();
    });

    // Launch the wall scanner
    initializeMuseumWall();
});
