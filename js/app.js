const KAKAO_REST_API_KEY = "";
const KAKAO_BOOK_API_URL = "https://dapi.kakao.com/v3/search/book";

const HERO_BANNERS = [
{
  badge: "MEMBERSHIP",
  title: "신규 회원\n웰컴 쿠폰 혜택",
  text: "가입만 해도 할인 쿠폰과 적립 혜택을 받아보세요.",
  image: "img/coupon.jpg"
},
{
  badge: "BOOK CURATION",
  title: "이번 주 화제의 책\n지금 만나보세요",
  text: "분야별 베스트와 MD 추천 도서를 한눈에 확인할 수 있습니다.",
  image: "img/book.webp"
},
{
  badge: "SPECIAL EVENT",
  title: "봄맞이 독서전\n특별 기획전 진행중",
  text: "인기 도서와 굿즈를 함께 즐길 수 있는 큐레이션 이벤트입니다.",
  image: "img/book3.jpg"
}
];

const SECTION_QUERY_MAP = {
best: { query: "베스트셀러", size: 5, sort: "accuracy" },
new: { query: "신간 도서", size: 5, sort: "latest" },
business: { query: "경제경영", size: 5, sort: "accuracy" },
novel: { query: "한국 소설", size: 5, sort: "accuracy" },
sale: { query: "고전 문학", size: 5, sort: "accuracy" }
};

const PICK_QUERY_MAP = {
all: { query: "추천 도서", size: 10, sort: "accuracy" },
korean: { query: "국내소설", size: 5, sort: "accuracy" },
foreign: { query: "외국소설", size: 5, sort: "accuracy" },
essay: { query: "에세이", size: 5, sort: "accuracy" },
business: { query: "경제 자기계발", size: 5, sort: "accuracy" },
humanities: { query: "인문 역사", size: 5, sort: "accuracy" },
children: { query: "어린이 도서", size: 5, sort: "accuracy" }
};

const SECTION_FALLBACK_QUERIES = {
  best: ["베스트셀러 추천", "화제의 도서"],
  business: ["경제경영 베스트셀러", "자기계발 추천 도서"],
  novel: ["한국문학 소설", "장편소설", "문학 소설 추천"],
  sale: ["할인 도서", "고전문학", "문학 특가"],
  new: ["신간 베스트", "새로 나온 책"]
};

const PICK_FALLBACK_QUERIES = {
  all: ["화제의 도서", "추천 베스트셀러"],
  korean: ["국내소설 추천", "한국문학 소설"],
  foreign: ["세계문학 소설", "해외문학 소설", "외국 문학 추천"],
  essay: ["베스트 에세이", "에세이 추천"],
  business: ["경제경영 추천", "자기계발 베스트"],
  humanities: ["인문학 추천", "역사 교양 도서"],
  children: ["어린이 베스트", "아동 도서 추천"]
};

const REVIEW_DATA = [
{
category: "큐레이션",
title: "지금 읽기 좋은 경제경영 입문서",
text: "처음 경제경영 분야를 읽는 독자라면 이론보다 사례 중심의 책부터 접근하는 구성이 좋습니다.",
footer: "추천 키워드 · 경제경영 · 입문"
},
{
category: "독자 리뷰",
title: "문학 작품은 왜 다시 읽을수록 다르게 보일까",
text: "한 번 읽을 때 놓쳤던 감정선과 문장이 다시 살아나는 경험이 문학 독서의 재미를 만듭니다.",
footer: "리뷰 요약 · 문학 · 소설"
},
{
category: "MD NOTE",
title: "자기계발 책도 결국 실행 가능한가가 중요합니다",
text: "문장이 멋진 책보다 실제로 내 하루를 바꾸게 만드는 책이 더 오래 남습니다.",
footer: "에디터 코멘트 · 자기계발"
}
];

const GIFT_DATA = [
{ title: "북마크 세트", sub: "독서 굿즈", price: 4900, image: "img/bookmark.jpg" },
{ title: "무선 독서등", sub: "데스크 소품", price: 15900, image: "img/mood.webp" },
{ title: "감성 노트", sub: "문구", price: 3800, image: "img/note.jpg" },
{ title: "펜 파우치", sub: "필기구", price: 8900, image: "img/pen.jpg" },
{ title: "독서 쿠션", sub: "라이프", price: 12900, image: "img/cousion.jpg" }
];

const BOOK_STATE = {
best: [],
new: [],
business: [],
novel: [],
sale: []
};


const SECTION_TITLE_BLACKLIST = {
  novel: ["한국소설"]
};

const PICK_TITLE_BLACKLIST = {
  foreign: ["소설 카프카(풀빛외국소설 1)"]
};
const TODAY_RECOMMEND_STATE = {
all: [],
korean: [],
foreign: [],
essay: [],
business: [],
humanities: [],
children: []
};

const heroTrack = document.getElementById("heroTrack");
const heroDots = document.getElementById("heroDots");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");
const heroPause = document.getElementById("heroPause");

const bestBooksEl = document.getElementById("bestBooks");
const newBooksEl = document.getElementById("newBooks");
const businessBooksEl = document.getElementById("businessBooks");
const novelBooksEl = document.getElementById("novelBooks");
const saleBooksEl = document.getElementById("saleBooks");

const reviewCardsEl = document.getElementById("reviewCards");
const giftItemsEl = document.getElementById("giftItems");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchSection = document.getElementById("searchSection");
const searchBooksEl = document.getElementById("searchBooks");
const searchMeta = document.getElementById("searchMeta");

const sectionButtons = document.querySelectorAll(".section-btn");
const menuBtn = document.getElementById("menuBtn");
const megaMenu = document.getElementById("megaMenu");

const pickCleanTrack = document.getElementById("pickCleanTrack");
const pickCleanDots = document.getElementById("pickCleanDots");
const pickCleanPrev = document.getElementById("pickCleanPrev");
const pickCleanNext = document.getElementById("pickCleanNext");
const pickCleanMore = document.querySelector(".pick-clean-more");
const pickCleanTabs = document.querySelectorAll("[data-pick-clean]");

let heroIndex = 0;
let heroTimer = null;
let heroPaused = false;

let currentPickCleanCategory = "all";
let currentPickCleanPage = 0;

function escapeHtml(str = "") {
return String(str)
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#39;");
}

function formatPrice(price) {
return `${Number(price || 0).toLocaleString("ko-KR")}원`;
}

function shuffleArray(arr) {
return [...arr].sort(() => Math.random() - 0.5);
}

function getFallbackBookImage(seed = "book") {
return `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/420`;
}

function getHighResImageUrl(thumbnailUrl) {
if (!thumbnailUrl) return "";

try {
  const urlObj = new URL(thumbnailUrl);
  const fname = urlObj.searchParams.get("fname");

  if (fname) {
    return decodeURIComponent(fname);
  }
} catch (error) {
  console.error("URL 파싱 에러:", error);
}

if (thumbnailUrl.includes("R120x174")) {
  return thumbnailUrl.replace("R120x174", "R500x500");
}

return thumbnailUrl;
}

function getSafePriceInfo(doc = {}) {
const rawPrice = Number(doc.price || 0);
const rawSalePrice = Number(doc.sale_price || 0);
const safePrice = rawPrice > 0 ? rawPrice : 0;
const safeSalePrice = rawSalePrice > 0 ? rawSalePrice : safePrice;
const displayPrice = safePrice > 0 ? safePrice : safeSalePrice;
const displaySalePrice = safeSalePrice > 0 ? safeSalePrice : displayPrice;

return {
rawPrice,
rawSalePrice,
price: displayPrice > 0 ? displayPrice : 0,
sale_price: displaySalePrice > 0 ? displaySalePrice : (displayPrice > 0 ? displayPrice : 0)
};
}

function normalizeKakaoBook(doc, index = 0, prefix = "book") {
  const priceInfo = getSafePriceInfo(doc);
  return {
    title: doc.title || "제목 없음",
    author: Array.isArray(doc.authors) && doc.authors.length > 0 ? doc.authors.join(", ") : "저자 미상",
    publisher: doc.publisher || "출판사 정보 없음",
    price: priceInfo.price,
    sale_price: priceInfo.sale_price,
    isbn: doc.isbn || "",
    image: getHighResImageUrl(doc.thumbnail) || getFallbackBookImage(`${prefix}-${index}`)
  };
}

function hasUsableThumbnail(doc = {}) {
  const thumbnail = String(doc.thumbnail || "").trim();
  if (!thumbnail) return false;

  return !/(noimage|no_image|noimg|book_nodata|img_no|없습니다)/i.test(thumbnail);
}

function isLowTrustBook(doc = {}, sectionKey = "") {
  const title = String(doc.title || "").trim();
  const authors = Array.isArray(doc.authors) ? doc.authors.filter(Boolean) : [];

  if (!title) return true;
  if (!hasUsableThumbnail(doc)) return true;
  if (sectionKey === "best" && /^(베스트셀러|베스트 셀러)$/i.test(title)) return true;
  if (sectionKey === "best" && authors.length === 0) return true;

  return false;
}

function dedupeBooks(docs = []) {
  const seen = new Set();

  return docs.filter((doc) => {
    const key = String(doc.isbn || doc.url || `${doc.title}-${(doc.authors || []).join(",")}`).trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isWeakMetaBook(doc = {}) {
  const title = String(doc.title || "").trim();
  const authorText = Array.isArray(doc.authors) ? doc.authors.join(", ") : String(doc.author || "");
  const publisher = String(doc.publisher || "").trim();

  if (!title) return true;
  if (/편집부|저자 미상|저자미상|작자 미상/i.test(authorText)) return true;
  if (/협회|학회|편집부/i.test(publisher) && !authorText.trim()) return true;

  return false;
}

async function collectCandidateBooks(queries = [], size = 5, sort = "accuracy", filterFn = () => true) {
  let collectedDocs = [];

  for (const query of queries) {
    for (const page of [1, 2, 3]) {
      const docs = await fetchKakaoBooks({
        query,
        size: Math.max(size * 3, 12),
        sort,
        page
      });

      const filteredDocs = docs.filter(filterFn);
      collectedDocs = dedupeBooks([...collectedDocs, ...filteredDocs]);

      if (collectedDocs.length >= size) {
        return collectedDocs.slice(0, size);
      }
    }
  }

  return collectedDocs.slice(0, size);
}

function isBlacklistedSectionBook(sectionKey = "", doc = {}) {
  const title = String(doc.title || "").trim();
  const blockedTitles = SECTION_TITLE_BLACKLIST[sectionKey] || [];
  return blockedTitles.includes(title);
}

function isBlacklistedPickBook(categoryKey = "", doc = {}) {
  const title = String(doc.title || "").trim();
  const blockedTitles = PICK_TITLE_BLACKLIST[categoryKey] || [];
  return blockedTitles.includes(title);
}

async function fetchKakaoBooks({
query,
size = 5,
sort = "accuracy",
page = 1,
target = "title"
}) {
const url = new URL(KAKAO_BOOK_API_URL);
url.searchParams.set("query", query);
url.searchParams.set("size", String(size));
url.searchParams.set("sort", sort);
url.searchParams.set("page", String(page));
url.searchParams.set("target", target);

const response = await fetch(url.toString(), {
method: "GET",
headers: {
  Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`
}
});

if (!response.ok) {
throw new Error(`카카오 API 요청 실패: ${response.status}`);
}

const data = await response.json();
return Array.isArray(data.documents) ? data.documents : [];
}

async function loadSectionBooks(sectionKey, randomPage = false) {
const config = SECTION_QUERY_MAP[sectionKey];
if (!config) return [];

try {
const primaryQueries = [config.query, ...(SECTION_FALLBACK_QUERIES[sectionKey] || [])];
const shuffledPrimary = randomPage ? shuffleArray(primaryQueries) : primaryQueries;

const selectedDocs = await collectCandidateBooks(
  shuffledPrimary,
  config.size,
  config.sort,
  (doc) => !isLowTrustBook(doc, sectionKey) && !isBlacklistedSectionBook(sectionKey, doc) && !isWeakMetaBook(doc)
);

const books = selectedDocs.map((doc, index) => normalizeKakaoBook(doc, index, sectionKey));

if (books.length > 0) {
  BOOK_STATE[sectionKey] = books;
  return books;
}

return BOOK_STATE[sectionKey] || [];
} catch (error) {
console.error(`${sectionKey} 데이터 로드 실패:`, error);
return BOOK_STATE[sectionKey] || [];
}
}


async function loadPickCategory(categoryKey) {
const config = PICK_QUERY_MAP[categoryKey];
if (!config) return [];

try {
const queries = [config.query, ...(PICK_FALLBACK_QUERIES[categoryKey] || [])];
const selectedDocs = await collectCandidateBooks(
  queries,
  config.size,
  config.sort,
  (doc) => !isBlacklistedPickBook(categoryKey, doc) && hasUsableThumbnail(doc) && !isWeakMetaBook(doc)
);

const books = selectedDocs.map((doc, index) => normalizeKakaoBook(doc, index, `pick-${categoryKey}`));
TODAY_RECOMMEND_STATE[categoryKey] = books;
return books;
} catch (error) {
console.error(`${categoryKey} 추천 도서 로드 실패:`, error);
TODAY_RECOMMEND_STATE[categoryKey] = [];
return [];
}
}

async function preloadBookData() {
await Promise.all([
loadSectionBooks("best"),
loadSectionBooks("new"),
loadSectionBooks("business"),
loadSectionBooks("novel"),
loadSectionBooks("sale"),
loadPickCategory("all"),
loadPickCategory("korean"),
loadPickCategory("foreign"),
loadPickCategory("essay"),
loadPickCategory("business"),
loadPickCategory("humanities"),
loadPickCategory("children")
]);
}

function createBookCard(book, index = 0, showRank = false) {
const detailLink = createBookDetailUrl(book);
return `
<article class="book-card">
  <a href="${detailLink}" class="book-card-link">
    <div class="book-thumb">
      <img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.title)}" />
      ${showRank ? `<span class="rank-badge">${index + 1}</span>` : ""}
    </div>
    <div class="book-info">
      <h4>${escapeHtml(book.title)}</h4>
      <p class="book-meta">${escapeHtml(book.author)}</p>
      <p class="book-meta">${escapeHtml(book.publisher || "")}</p>
      <p class="book-price">${formatPrice((book.sale_price > 0 ? book.sale_price : book.price) || 0)}</p>
    </div>
  </a>
</article>
`;
}

function renderBookGrid(targetEl, books, showRank = false) {
if (!targetEl) return;

if (!books || books.length === 0) {
targetEl.innerHTML = `<div class="empty-box">표시할 데이터가 없습니다.</div>`;
return;
}

targetEl.innerHTML = books
.map((book, index) => createBookCard(book, index, showRank))
.join("");
}

function renderReviewCards() {
reviewCardsEl.innerHTML = REVIEW_DATA.map(
(item) => `
  <article class="review-card">
    <div class="review-top">${escapeHtml(item.category)}</div>
    <div class="review-body">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.text)}</p>
    </div>
    <div class="review-footer">${escapeHtml(item.footer)}</div>
  </article>
`
).join("");
}

function renderGiftItems() {
giftItemsEl.innerHTML = GIFT_DATA.map(
(item) => `
  <article class="gift-card">
    <div class="gift-thumb">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
    </div>
    <h4>${escapeHtml(item.title)}</h4>
    <p>${escapeHtml(item.sub)}</p>
    <div class="gift-price">${formatPrice(item.price)}</div>
  </article>
`
).join("");
}

function renderHero() {
heroTrack.innerHTML = HERO_BANNERS.map(
(item, index) => `
  <div class="hero-slide ${index === heroIndex ? "active" : ""}">
    <div class="hero-copy">
      <span>${escapeHtml(item.badge)}</span>
      <h1>${escapeHtml(item.title).replaceAll("\n", "<br />")}</h1>
      <p>${escapeHtml(item.text)}</p>
      <a href="#">이벤트 보기</a>
    </div>
    <div class="hero-visual-card">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.badge)}" />
    </div>
  </div>
`
).join("");

heroDots.innerHTML = HERO_BANNERS.map(
(_, index) => `
  <button
    class="hero-dot ${index === heroIndex ? "active" : ""}"
    data-hero-dot="${index}"
    type="button"
  ></button>
`
).join("");

document.querySelectorAll("[data-hero-dot]").forEach((dot) => {
dot.addEventListener("click", () => {
  heroIndex = Number(dot.dataset.heroDot);
  renderHero();
});
});
}

function nextHero() {
heroIndex = (heroIndex + 1) % HERO_BANNERS.length;
renderHero();
}

function prevHeroSlide() {
heroIndex = (heroIndex - 1 + HERO_BANNERS.length) % HERO_BANNERS.length;
renderHero();
}

function startHeroAuto() {
stopHeroAuto();
heroTimer = setInterval(() => {
if (!heroPaused) nextHero();
}, 3500);
}

function stopHeroAuto() {
if (heroTimer) clearInterval(heroTimer);
}

function getPickBooks() {
return TODAY_RECOMMEND_STATE[currentPickCleanCategory] || TODAY_RECOMMEND_STATE.all || [];
}


function createBookDetailUrl(book) {
const params = new URLSearchParams();
const isbn = (book.isbn || "").trim();
const title = (book.title || "").trim();
const author = (book.author || "").trim();
const publisher = (book.publisher || "").trim();
const image = (book.image || "").trim();
const price = Number(book.price || 0);

if (isbn) {
params.set("isbn", isbn);
}

if (title) {
params.set("query", title);
}

if (author) {
params.set("author", author);
}

if (publisher) {
params.set("publisher", publisher);
}

if (image) {
params.set("image", image);
}

if (price > 0) {
params.set("price", String(price));
params.set("sale_price", String(price));
}

return `detail.html?${params.toString()}`;
}

function getVisiblePickBooks() {
const books = getPickBooks();

if (currentPickCleanCategory !== "all") {
return books.slice(0, 5);
}

const pageSize = 5;
const start = currentPickCleanPage * pageSize;
return books.slice(start, start + pageSize);
}

function getPickPageCount() {
const books = getPickBooks();

if (currentPickCleanCategory !== "all") {
return 1;
}

return Math.max(1, Math.ceil(books.length / 5));
}

function updatePickControls() {
const isAll = currentPickCleanCategory === "all";

if (pickCleanPrev) {
pickCleanPrev.style.visibility = isAll ? "visible" : "hidden";
}

if (pickCleanNext) {
pickCleanNext.style.visibility = isAll ? "visible" : "hidden";
}

if (pickCleanMore) {
pickCleanMore.style.visibility = isAll ? "visible" : "hidden";
}

if (pickCleanDots) {
pickCleanDots.style.display = isAll ? "flex" : "none";
}
}

function renderPickClean() {
const visibleBooks = getVisiblePickBooks();
const pageCount = getPickPageCount();

if (!visibleBooks || visibleBooks.length === 0) {
pickCleanTrack.innerHTML = `<div class="empty-box">표시할 추천 도서가 없습니다.</div>`;
pickCleanDots.innerHTML = "";
updatePickControls();
return;
}

pickCleanTrack.innerHTML = visibleBooks.map(
(book) => {
  const detailLink = createBookDetailUrl(book);
  return `
  <article class="pick-clean-card">
    <a href="${detailLink}" class="pick-clean-link">
      <div class="pick-clean-thumb">
        <img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.title)}" />
      </div>
      <div class="pick-clean-title">${escapeHtml(book.title)}</div>
      <div class="pick-clean-author">${escapeHtml(book.author)}</div>
    </a>
  </article>
`;
}
).join("");

if (currentPickCleanCategory === "all") {
pickCleanDots.innerHTML = Array.from({ length: pageCount }, (_, index) => `
  <button
    type="button"
    class="pick-clean-dot ${index === currentPickCleanPage ? "active" : ""}"
    data-pick-dot="${index}"
    aria-label="${index + 1}번 추천 도서 페이지"
  ></button>
`).join("");

document.querySelectorAll("[data-pick-dot]").forEach((dot) => {
  dot.addEventListener("click", () => {
    currentPickCleanPage = Number(dot.dataset.pickDot);
    renderPickClean();
  });
});
} else {
pickCleanDots.innerHTML = "";
}

updatePickControls();
}

async function renderSearchResults(keyword) {
try {
searchSection.classList.remove("hidden");
searchMeta.textContent = `"${keyword}" 검색 중...`;

const docs = await fetchKakaoBooks({
  query: keyword,
  size: 15,
  sort: "accuracy",
  page: 1,
  target: "title"
});

const result = docs.map((doc, index) => normalizeKakaoBook(doc, index, `search-${keyword}`));
searchMeta.textContent = `"${keyword}" 검색 결과 ${result.length}건`;

if (result.length === 0) {
  searchBooksEl.innerHTML = `<div class="empty-box">검색 결과가 없습니다.</div>`;
  searchSection.scrollIntoView({ behavior: "smooth", block: "start" });
  return;
}

renderBookGrid(searchBooksEl, result);
searchSection.scrollIntoView({ behavior: "smooth", block: "start" });
} catch (error) {
console.error("검색 실패:", error);
searchSection.classList.remove("hidden");
searchMeta.textContent = `"${keyword}" 검색 결과를 불러오지 못했습니다.`;
searchBooksEl.innerHTML = `<div class="empty-box">검색 중 오류가 발생했습니다.</div>`;
searchSection.scrollIntoView({ behavior: "smooth", block: "start" });
}
}

async function refreshSection(sectionKey) {
if (sectionKey === "gift") {
renderGiftItems();
return;
}

const books = await loadSectionBooks(sectionKey, true);

if (sectionKey === "best") {
renderBookGrid(bestBooksEl, books, true);
} else if (sectionKey === "new") {
renderBookGrid(newBooksEl, books);
} else if (sectionKey === "business") {
renderBookGrid(businessBooksEl, books);
} else if (sectionKey === "novel") {
renderBookGrid(novelBooksEl, books);
} else if (sectionKey === "sale") {
renderBookGrid(saleBooksEl, books);
}
}

function bindEvents() {
heroPrev.addEventListener("click", prevHeroSlide);
heroNext.addEventListener("click", nextHero);

heroPause.addEventListener("click", () => {
heroPaused = !heroPaused;
heroPause.textContent = heroPaused ? "재생" : "정지";
});

searchForm.addEventListener("submit", async (e) => {
e.preventDefault();
const keyword = searchInput.value.trim();

if (!keyword) {
  searchInput.focus();
  return;
}

await renderSearchResults(keyword);
});

sectionButtons.forEach((button) => {
button.addEventListener("click", async () => {
  const { section } = button.dataset;
  button.disabled = true;
  try {
    await refreshSection(section);
  } finally {
    button.disabled = false;
  }
});
});

if (menuBtn && megaMenu) {
menuBtn.addEventListener("click", () => {
  megaMenu.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!megaMenu.contains(e.target) && !menuBtn.contains(e.target)) {
    megaMenu.classList.remove("open");
  }
});
}

if (pickCleanPrev) {
pickCleanPrev.addEventListener("click", () => {
  if (currentPickCleanCategory !== "all") return;

  const pageCount = getPickPageCount();
  currentPickCleanPage = (currentPickCleanPage - 1 + pageCount) % pageCount;
  renderPickClean();
});
}

if (pickCleanNext) {
pickCleanNext.addEventListener("click", () => {
  if (currentPickCleanCategory !== "all") return;

  const pageCount = getPickPageCount();
  currentPickCleanPage = (currentPickCleanPage + 1) % pageCount;
  renderPickClean();
});
}

if (pickCleanMore) {
pickCleanMore.addEventListener("click", () => {
  if (currentPickCleanCategory !== "all") return;

  const pageCount = getPickPageCount();
  currentPickCleanPage = (currentPickCleanPage + 1) % pageCount;
  renderPickClean();
});
}

pickCleanTabs.forEach((tab) => {
tab.addEventListener("click", async () => {
  currentPickCleanCategory = tab.dataset.pickClean;
  currentPickCleanPage = 0;

  pickCleanTabs.forEach((btn) => btn.classList.remove("active"));
  tab.classList.add("active");

  if (!TODAY_RECOMMEND_STATE[currentPickCleanCategory] || TODAY_RECOMMEND_STATE[currentPickCleanCategory].length === 0) {
    await loadPickCategory(currentPickCleanCategory);
  }

  renderPickClean();
});
});
}

async function init() {
renderHero();
startHeroAuto();

renderReviewCards();
renderGiftItems();

renderBookGrid(bestBooksEl, [], true);
renderBookGrid(newBooksEl, []);
renderBookGrid(businessBooksEl, []);
renderBookGrid(novelBooksEl, []);
renderBookGrid(saleBooksEl, []);

if (pickCleanTrack) {
pickCleanTrack.innerHTML = `<div class="empty-box">추천 도서를 불러오는 중입니다.</div>`;
}

await preloadBookData();

renderBookGrid(bestBooksEl, BOOK_STATE.best, true);
renderBookGrid(newBooksEl, BOOK_STATE.new);
renderBookGrid(businessBooksEl, BOOK_STATE.business);
renderBookGrid(novelBooksEl, BOOK_STATE.novel);
renderBookGrid(saleBooksEl, BOOK_STATE.sale);

renderPickClean();
bindEvents();
}

init();
