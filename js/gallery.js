document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    let imageIndex = 1;
    const fileExtension = '.jpg'; 
    const folderPath = 'assets/images/';

    // Bank of 4+3 verses (Commented out for future museum incorporation)
    /*
    const verseBank = [
        {
            tamil: "இயற்கை வரையும் ஓவியம் இங்கு<br>அழியா மரபின் நிலைத்தன்மை",
            english: "Nature drafts its silent art<br>Enduring legacy remains intact"
        },
        {
            tamil: "வடிவம் மாறும் காலத்தின் ஓட்டம்<br>உயிரின் அமைப்பு மாறாது",
            english: "Forms dissolve in passing time<br>Biological design forever holds"
        },
        {
            tamil: "விதையுள் உறங்கும் பேரியற்கை ரகசியம்<br>தொடர்ச்சியின் தடையற்ற பெருவெளி",
            english: "Vast nature sleeps inside seeds<br>Continuity flows without an end"
        },
        {
            tamil: "பச்சை நரம்புகள் வரையும் மௌன சித்திரம்<br>கலையாத இயற்கையின் வடிவமைப்பு",
            english: "Green veins map life's continuity<br>Silent architecture forever holds"
        },
        {
            tamil: "ஒளியில் விரியும் உயிரின் துல்லிய கலை<br>மாறாத காலத்தின் சாட்சி",
            english: "Light reveals raw biological art<br>Nature sculpts living truth"
        },
        {
            tamil: "ஒன்றோடொன்று தழுவும் இலைகளின் மௌனம்<br>தொடர்ச்சியின் உயிர்ப்புள்ள சாசனம்",
            english: "Curving leaves shape silent space<br>Enduring legacy remains intact"
        }
    ];
    */

    function loadNextImage() {
        const img = new Image();
        const imagePath = `${folderPath}${imageIndex}${fileExtension}`;
        img.src = imagePath;

        img.onload = function() {
            const paddedNumber = imageIndex.toString().padStart(2, '0');
            const archiveTitle = `Archive # ${paddedNumber}`;
            
            // Generating matted gallery frames inside 'frame' wrapper without the verse overlay
            const itemHtml = `
                <div class="gallery-item">
                    <div class="image-wrapper frame">
                        <div class="art-container">
                            <img src="${imagePath}" alt="${archiveTitle}" loading="lazy" />
                        </div>
                    </div>
                    <p class="caption">${archiveTitle}</p>
                </div>
            `;
            
            galleryGrid.insertAdjacentHTML('beforeend', itemHtml);
            imageIndex++;
            loadNextImage(); 
        };

        img.onerror = function() {
            console.log(`Gallery up to date. Displaying ${imageIndex - 1} archives.`);
        };
    }

    loadNextImage();
});