// ==========================================
// QURAN COMPANION
// ==========================================


// API
const API = "https://api.alquran.cloud/v1";


// App data
let currentUser = null;
let surahs = [];
let currentSurah = null;


// Bookmarks
let bookmarks =
    JSON.parse(localStorage.getItem("quranBookmarks")) || [];


// Arabic font size
let arabicFontSize =
    Number(localStorage.getItem("arabicFontSize")) || 32;


// ==========================================
// LOGIN
// ==========================================

function login() {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value.trim();

    const message =
        document.getElementById("loginMessage");

    if (email === "" || password === "") {
        message.textContent =
            "Please enter your email and password.";
        return;
    }

    // Get the account created during signup
    const savedUser =
        JSON.parse(localStorage.getItem("quranUser"));

    if (!savedUser) {
        message.textContent =
            "No account found. Please sign up first.";
        return;
    }

    // Check email
    if (email !== savedUser.email) {
        message.textContent =
            "Incorrect email or password.";
        return;
    }

    // Check password
    if (password !== savedUser.password) {
        message.textContent =
            "Incorrect email or password.";
        return;
    }

    // Correct login
    currentUser = savedUser.name;

    startApp();
}



// ==========================================
// SIGN UP
// ==========================================

function signup() {

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value.trim();

    const confirmPassword =
        document.getElementById("signupConfirmPassword").value.trim();

    const message =
        document.getElementById("signupMessage");

    // Check for empty fields
    if (
        name === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    // Check that both passwords match
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }


    localStorage.setItem(
    "quranUser",
    JSON.stringify({
        name: name,
        email: email,
        password: password
    })
);

currentUser = name;
startApp();

    currentUser = name;

    startApp();
}



// ==========================================
// SHOW SIGNUP
// ==========================================

function showSignup() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");


    document
        .getElementById("signupPage")
        .classList.remove("hidden");
}



// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    document
        .getElementById("signupPage")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}



// ==========================================
// START APP
// ==========================================

function startApp() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");


    document
        .getElementById("signupPage")
        .classList.add("hidden");


    document
        .getElementById("app")
        .classList.remove("hidden");


    showSection("home");


    loadSurahs();

    loadJuz();

    displayBookmarks();

    applyFontSize();

}



// ==========================================
// LOGOUT
// ==========================================

function logout() {

    currentUser = null;

    document
        .getElementById("app")
        .classList.add("hidden");


    document
        .getElementById("loginPage")
        .classList.remove("hidden");

}



// ==========================================
// SECTION NAVIGATION
// ==========================================

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(function(section) {
        section.classList.add("hidden");
    });

    const selected =
        document.getElementById(sectionName);

    if (selected) {
        selected.classList.remove("hidden");
    }

    window.scrollTo(0, 0);

    if (sectionName === "bookmarks") {
        displayBookmarks();
    }

    if (sectionName === "prayer") {
        loadPrayerTimes();
    }
}



// ==========================================
// LOAD ALL SURAHS
// ==========================================

async function loadSurahs() {

    const container =
        document.getElementById("surahList");


    try {

        container.innerHTML =
            "<p>Loading all 114 Surahs...</p>";


        const response =
            await fetch(`${API}/surah`);


        const result =
            await response.json();


        if (result.code !== 200) {

            throw new Error("Unable to load Surahs.");

        }


        surahs = result.data;


        renderSurahs(surahs);


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="card">
                <h3>❌ Unable to load Quran</h3>

                <p>
                    Check your internet connection
                    and try again.
                </p>

                <button
                    type="button"
                    onclick="loadSurahs()"
                >
                    Try Again
                </button>
            </div>
        `;

    }

}



// ==========================================
// RENDER SURAHS
// ==========================================

function renderSurahs(list) {

    const container =
        document.getElementById("surahList");


    container.innerHTML = "";


    if (list.length === 0) {

        container.innerHTML =
            "<p>No Surah found.</p>";

        return;
    }


    list.forEach(function(surah) {

        const card =
            document.createElement("div");


        card.className = "surah-card";


        card.innerHTML = `

            <div>

                <h3>
                    ${surah.number}.
                    ${surah.englishName}
                </h3>

                <p>
                    ${surah.englishNameTranslation}
                </p>

                <small>
                    ${surah.revelationType}
                    •
                    ${surah.numberOfAyahs} Ayahs
                </small>

            </div>


            <div>

                <strong>
                    ${surah.name}
                </strong>

                <br><br>

                <button
                    type="button"
                    onclick="openSurah(${surah.number})"
                >
                    Read
                </button>

            </div>

        `;


        container.appendChild(card);

    });

}



// ==========================================
// SEARCH SURAHS
// ==========================================

function searchSurahs() {

    const search =
        document
            .getElementById("surahSearch")
            .value
            .toLowerCase()
            .trim();


    const filtered =
        surahs.filter(function(surah) {

            return (

                surah.englishName
                    .toLowerCase()
                    .includes(search)

                ||

                surah.englishNameTranslation
                    .toLowerCase()
                    .includes(search)

                ||

                surah.number.toString()
                    .includes(search)

            );

        });


    renderSurahs(filtered);

}



// ==========================================
// OPEN SURAH
// ==========================================

async function openSurah(number) {

    showSection("reader");


    const title =
        document.getElementById("readerTitle");

    const info =
        document.getElementById("readerInfo");

    const container =
        document.getElementById("ayahContainer");

    const surahAudio =
        document.getElementById("surahAudio");


    title.textContent =
        "Loading...";


    info.textContent =
        "";


    container.innerHTML =
        "<p>Loading Quran...</p>";


    try {

        // Arabic Quran
        const arabicResponse =
            await fetch(
                `${API}/surah/${number}/quran-uthmani`
            );


        // English translation
        const translationResponse =
            await fetch(
                `${API}/surah/${number}/en.sahih`
            );


        const arabic =
            await arabicResponse.json();


        const translation =
            await translationResponse.json();


        if (
            arabic.code !== 200 ||
            translation.code !== 200
        ) {

            throw new Error(
                "Unable to load Surah."
            );

        }


        currentSurah = arabic.data;


        // Save last reading
        localStorage.setItem(
            "lastSurah",
            number
        );


        title.textContent =
            `${arabic.data.number}. ${arabic.data.englishName}`;


        info.textContent =
            `${arabic.data.englishNameTranslation} • ` +
            `${arabic.data.numberOfAyahs} Ayahs • ` +
            `${arabic.data.revelationType}`;


        // Full Surah audio
        surahAudio.src =
            `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${number}.mp3`;


        container.innerHTML = "";


        const arabicAyahs =
            arabic.data.ayahs;

        const translationAyahs =
            translation.data.ayahs;


        arabicAyahs.forEach(function(ayah, index) {

            const translationText =
                translationAyahs[index]
                    ? translationAyahs[index].text
                    : "";


            const card =
                document.createElement("article");


            card.className =
                "card ayah-card";


            card.id =
                `ayah-${ayah.number}`;


            const isBookmarked =
                bookmarks.some(function(item) {

                    return item.number === ayah.number;

                });


            card.innerHTML = `

                <div>

                    <strong>
                        Ayah ${ayah.numberInSurah}
                    </strong>

                    <button
                        type="button"
                        onclick="toggleBookmark(
                            ${ayah.number},
                            ${number},
                            ${ayah.numberInSurah}
                        )"
                    >
                        ${isBookmarked ? "❤️ Saved" : "♡ Save"}
                    </button>

                    <button
                        type="button"
                        onclick="playAyah(${ayah.number})"
                    >
                        🔊 Play
                    </button>

                </div>


                <p
                    class="ayah-arabic"
                    data-arabic="true"
                >
                    ${ayah.text}
                </p>


                <p class="ayah-translation">
                    ${translationText}
                </p>

            `;


            container.appendChild(card);

        });


        applyFontSize();


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="card">

                <h3>❌ Something went wrong</h3>

                <p>
                    We couldn't load this Surah.
                    Check your internet connection.
                </p>

                <button
                    type="button"
                    onclick="openSurah(${number})"
                >
                    Try Again
                </button>

            </div>

        `;

    }

}



// ==========================================
// PLAY AYAH
// ==========================================

function playAyah(number) {

    const audio =
        document.getElementById("ayahAudio");


    audio.src =
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${number}.mp3`;


    audio.play();

}



// ==========================================
// BOOKMARK / UNBOOKMARK
// ==========================================

function toggleBookmark(
    globalNumber,
    surahNumber,
    ayahNumber
) {

    const existingIndex =
        bookmarks.findIndex(function(item) {

            return item.number === globalNumber;

        });


    if (existingIndex !== -1) {

        bookmarks.splice(existingIndex, 1);

    } else {

        bookmarks.push({

            number: globalNumber,

            surahNumber: surahNumber,

            ayahNumber: ayahNumber

        });

    }


    localStorage.setItem(
        "quranBookmarks",
        JSON.stringify(bookmarks)
    );


    displayBookmarks();


    if (currentSurah) {

        openSurah(currentSurah.number);

    }

}



// ==========================================
// DISPLAY BOOKMARKS
// ==========================================

function displayBookmarks() {

    const container =
        document.getElementById("bookmarkList");


    if (!container) return;


    container.innerHTML = "";


    if (bookmarks.length === 0) {

        container.innerHTML = `
            <div class="card">
                <p>
                    You haven't saved any ayahs yet.
                </p>
            </div>
        `;

        return;
    }


    bookmarks.forEach(function(bookmark, index) {

        const item =
            document.createElement("div");


        item.className =
            "card bookmark-item";


        item.innerHTML = `

            <h3>
                ❤️ Saved Ayah
            </h3>

            <p>
                Surah ${bookmark.surahNumber}
                —
                Ayah ${bookmark.ayahNumber}
            </p>


            <button
                type="button"
                onclick="openSurah(${bookmark.surahNumber})"
            >
                📖 Read
            </button>


            <button
                type="button"
                onclick="removeBookmark(${index})"
            >
                Remove
            </button>

        `;


        container.appendChild(item);

    });

}



// ==========================================
// REMOVE BOOKMARK
// ==========================================

function removeBookmark(index) {

    bookmarks.splice(index, 1);


    localStorage.setItem(
        "quranBookmarks",
        JSON.stringify(bookmarks)
    );


    displayBookmarks();

}



// ==========================================
// LOAD JUZ
// ==========================================

function loadJuz() {

    const container =
        document.getElementById("juzList");


    container.innerHTML = "";


    for (let i = 1; i <= 30; i++) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.textContent =
            `Juz ${i}`;


        button.onclick =
            function() {

                openJuz(i);

            };


        container.appendChild(button);

    }

}



// ==========================================
// OPEN JUZ
// ==========================================

async function openJuz(number) {

    showSection("reader");


    const title =
        document.getElementById("readerTitle");

    const info =
        document.getElementById("readerInfo");

    const container =
        document.getElementById("ayahContainer");


    title.textContent =
        `Juz ${number}`;


    info.textContent =
        "Loading...";


    container.innerHTML =
        "<p>Loading Juz...</p>";


    try {

        const arabicResponse =
            await fetch(
                `${API}/juz/${number}/quran-uthmani`
            );


        const translationResponse =
            await fetch(
                `${API}/juz/${number}/en.sahih`
            );


        const arabic =
            await arabicResponse.json();


        const translation =
            await translationResponse.json();


        if (
            arabic.code !== 200 ||
            translation.code !== 200
        ) {

            throw new Error(
                "Unable to load Juz."
            );

        }


        info.textContent =
            `${arabic.data.ayahs.length} Ayahs`;


        container.innerHTML = "";


        arabic.data.ayahs.forEach(
            function(ayah, index) {

                const translated =
                    translation.data.ayahs[index]
                        ? translation.data.ayahs[index].text
                        : "";


                const card =
                    document.createElement("article");


                card.className =
                    "card ayah-card";


                card.innerHTML = `

                    <strong>
                        ${ayah.surah.englishName}
                        —
                        Ayah ${ayah.numberInSurah}
                    </strong>

                    <p
                        class="ayah-arabic"
                        data-arabic="true"
                    >
                        ${ayah.text}
                    </p>

                    <p>
                        ${translated}
                    </p>

                    <button
                        type="button"
                        onclick="playAyah(${ayah.number})"
                    >
                        🔊 Play
                    </button>

                `;


                container.appendChild(card);

            }
        );


        applyFontSize();


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="card">
                <h3>❌ Unable to load Juz</h3>

                <button
                    type="button"
                    onclick="openJuz(${number})"
                >
                    Try Again
                </button>
            </div>
        `;

    }

}



// ==========================================
// RANDOM AYAH
// ==========================================

async function randomAyah() {

    const box =
        document.getElementById("randomAyahBox");


    box.innerHTML =
        "<h2>✨ Random Ayah</h2><p>Loading...</p>";


    try {

        const response =
            await fetch(
                `${API}/ayah/random/quran-uthmani`
            );


        const result =
            await response.json();


        if (result.code !== 200) {

            throw new Error(
                "Could not load random ayah."
            );

        }


        const ayah =
            result.data;


        const translationResponse =
            await fetch(
                `${API}/ayah/${ayah.number}/en.sahih`
            );


        const translation =
            await translationResponse.json();


        box.innerHTML = `

            <h2>✨ Random Ayah</h2>

            <h3>
                ${ayah.surah.englishName}
                —
                ${ayah.numberInSurah}
            </h3>

            <p
                class="ayah-arabic"
                data-arabic="true"
            >
                ${ayah.text}
            </p>

            <p>
                ${
                    translation.data
                        ? translation.data.text
                        : ""
                }
            </p>

            <button
                type="button"
                onclick="playAyah(${ayah.number})"
            >
                🔊 Listen
            </button>

        `;


        applyFontSize();


    } catch (error) {

        console.error(error);

        box.innerHTML =
            "<p>Unable to load random ayah.</p>";

    }

}



// ==========================================
// CONTINUE READING
// ==========================================

function continueReading() {

    const lastSurah =
        localStorage.getItem("lastSurah");


    if (lastSurah) {

        openSurah(Number(lastSurah));

    } else {

        openSurah(1);

    }

}



// ==========================================
// DARK MODE
// ==========================================

function toggleDarkMode() {

    document.body.classList.toggle("dark");


    const enabled =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "darkMode",
        enabled
    );

}



// ==========================================
// FONT SIZE
// ==========================================

function changeFontSize(amount) {

    arabicFontSize += amount;

    if (arabicFontSize < 20) {
        arabicFontSize = 20;
    }

    if (arabicFontSize > 60) {
        arabicFontSize = 60;
    }

    localStorage.setItem(
        "arabicFontSize",
        arabicFontSize
    );

    applyFontSize();
}
function applyFontSize() {

    const arabicTexts =
        document.querySelectorAll(
            "[data-arabic='true']"
        );

    arabicTexts.forEach(function(text) {

        text.style.fontSize =
            arabicFontSize + "px";

    });
}
// Reading Progress
function updateReadingProgress() {
    const reader = document.getElementById("reader");
    const progressFill = document.querySelector(".progress-fill");
    const progressLabel = document.querySelector(".progress-label span:last-child");

    if (!reader || !progressFill || !progressLabel) return;

    const rect = reader.getBoundingClientRect();
    const totalHeight = reader.scrollHeight - window.innerHeight;

    if (totalHeight <= 0) {
        progressFill.style.width = "0%";
        progressLabel.textContent = "0%";
        return;
    }

    const scrolled = Math.max(0, -rect.top);
    const percentage = Math.min(
        100,
        Math.round((scrolled / totalHeight) * 100)
    );

    progressFill.style.width = percentage + "%";
    progressLabel.textContent = percentage + "%";
}

window.addEventListener("scroll", updateReadingProgress);
window.addEventListener("resize", updateReadingProgress);
// ===============================
// LAGOS PRAYER TIMES
// ===============================

async function loadPrayerTimes() {
    const container = document.getElementById("prayerTimes");

    if (!container) return;

    container.innerHTML = "<p>Loading prayer times...</p>";

    try {
        const response = await fetch(
            "https://api.aladhan.com/v1/timingsByCity?city=Lagos&country=Nigeria"
        );

        if (!response.ok) {
            throw new Error("Unable to load prayer times");
        }

        const result = await response.json();
        const timings = result.data.timings;

        const prayers = [
            ["🌅", "Fajr", timings.Fajr],
            ["☀️", "Sunrise", timings.Sunrise],
            ["🕛", "Dhuhr", timings.Dhuhr],
            ["🌤️", "Asr", timings.Asr],
            ["🌇", "Maghrib", timings.Maghrib],
            ["🌙", "Isha", timings.Isha]
        ];

        container.innerHTML = "";

        prayers.forEach(function(prayer) {
            const card = document.createElement("div");

            card.className = "card prayer-time-card";

            card.innerHTML = `
                <div>
                    <h3>${prayer[0]} ${prayer[1]}</h3>
                </div>

                <strong>${prayer[2]}</strong>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Prayer times error:", error);

        container.innerHTML = `
    <p>
        ❌ Prayer times could not be loaded.
    </p>
    <p>
        Error: ${error.message}
    </p>
`;
    }
}
// ===============================
// QIBLA DIRECTION - LAGOS
// ===============================

function showQiblaDirection() {
    const info = document.getElementById("qiblaInfo");

    if (!info) return;

    info.innerHTML = `
        <div style="font-size: 70px; margin: 20px;">
            🧭
        </div>

        <h2>🕋 Qibla Direction</h2>

        <p>
            From Lagos, Nigeria
        </p>

        <h1>103°</h1>

        <p>
            Approximately 103° clockwise from North.
        </p>

        <p>
            Turn toward the Kaaba 🕋.
        </p>
    `;
}
document.addEventListener("DOMContentLoaded", function() {
    showQiblaDirection();
});
// ===============================
// QURAN JOURNEY - BOOKMARK COUNT
// ===============================

function updateJourneyStats() {
    const bookmarks = JSON.parse(
        localStorage.getItem("quranBookmarks") || "[]"
    );

    const bookmarksCount =
        document.getElementById("bookmarksCount");

    if (bookmarksCount) {
        bookmarksCount.textContent = bookmarks.length;
    }
}
document.addEventListener("DOMContentLoaded", function() {
    updateJourneyStats();
});
// ===============================
// SHOW / HIDE PASSWORD
// ===============================

function togglePassword(inputId) {
    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}
// ===============================
// PASSWORD STRENGTH
// ===============================

function checkPasswordStrength() {
    const password =
        document.getElementById("signupPassword").value;

    const strength =
        document.getElementById("passwordStrength");

    if (!strength) return;

    if (password.length === 0) {
        strength.textContent = "";
        return;
    }

    if (password.length < 6) {
        strength.textContent = "Weak ❌";
        return;
    }

    if (password.length < 10) {
        strength.textContent = "Medium ⚠️";
        return;
    }

    strength.textContent = "Strong ✅";
}
document.addEventListener("DOMContentLoaded", function() {
    const passwordInput =
        document.getElementById("signupPassword");

    if (passwordInput) {
        passwordInput.addEventListener(
            "input",
            checkPasswordStrength
        );
    }
});
// ===============================
// FORGOT PASSWORD
// ===============================

function showForgotPassword() {

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("signupPage").classList.add("hidden");
    document.getElementById("forgotPasswordPage").classList.remove("hidden");

}


function resetPassword() {

    const email =
        document.getElementById("resetEmail").value.trim();

    const newPassword =
        document.getElementById("newPassword").value.trim();

    const message =
        document.getElementById("resetMessage");

    if (email === "" || newPassword === "") {

        message.textContent =
            "Please enter your email and new password.";

        return;
    }

    const savedUser =
        JSON.parse(localStorage.getItem("quranUser"));

    if (!savedUser) {

        message.textContent =
            "No account found.";

        return;
    }

    if (email !== savedUser.email) {

        message.textContent =
            "No account found with that email.";

        return;
    }

    savedUser.password = newPassword;

    localStorage.setItem(
        "quranUser",
        JSON.stringify(savedUser)
    );

    message.textContent =
        "Password changed successfully!";

}