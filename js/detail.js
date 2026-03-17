
const KAKAO_REST_API_KEY = "88f92f21a2d5eb50a1c4fd850224f55a";
const KAKAO_BOOK_API_URL = "https://dapi.kakao.com/v3/search/book";

const detailSearchForm = document.getElementById("detailSearchForm");
const detailSearchInput = document.getElementById("detailSearchInput");
const qtyMinus = document.getElementById("qtyMinus");
const qtyPlus = document.getElementById("qtyPlus");
const qtyValue = document.getElementById("qtyValue");

let currentBook = null;
let quantity = 1;

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

function getFallbackBookImage(seed = "detail-book") {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/1120`;
}

function getHighResImageUrl(thumbnailUrl) {
  if (!thumbnailUrl) return "";

  try {
    const urlObj = new URL(thumbnailUrl);
    const fname = urlObj.searchParams.get("fname");
    if (fname) return decodeURIComponent(fname);
  } catch (error) {
    console.error("URL 파싱 에러:", error);
  }

  if (thumbnailUrl.includes("R120x174")) {
    return thumbnailUrl.replace("R120x174", "R500x500");
  }

  return thumbnailUrl;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function normalizeText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function splitAuthors(value = "") {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitIsbnCandidates(isbn = "") {
  return String(isbn)
    .split(/[\s,|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPrimaryIsbn(isbn = "") {
  const candidates = splitIsbnCandidates(isbn);
  const isbn13 = candidates.find((item) => item.length === 13);
  return isbn13 || candidates[0] || "";
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

function normalizeBook(doc = {}) {
  const authors = Array.isArray(doc.authors) && doc.authors.length > 0 ? doc.authors : ["저자 미상"];
  const translators = Array.isArray(doc.translators) ? doc.translators : [];
  const priceInfo = getSafePriceInfo(doc);

  return {
    title: doc.title || "제목 없음",
    contents: doc.contents || "",
    url: doc.url || "#",
    isbn: doc.isbn || "정보 없음",
    primaryIsbn: getPrimaryIsbn(doc.isbn || ""),
    datetime: doc.datetime ? doc.datetime.slice(0, 10) : "출간일 정보 없음",
    authors,
    translators,
    publisher: doc.publisher || "출판사 정보 없음",
    price: priceInfo.price,
    sale_price: priceInfo.sale_price,
    status: doc.status || "판매중",
    thumbnail: doc.thumbnail || getFallbackBookImage(doc.title || "detail-book")
  };
}

async function fetchKakaoBooks({ query, size = 10, sort = "accuracy", target = "title", page = 1 }) {
  const url = new URL(KAKAO_BOOK_API_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("size", String(size));
  url.searchParams.set("sort", sort);
  url.searchParams.set("target", target);
  url.searchParams.set("page", String(page));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
  });

  if (!response.ok) {
    throw new Error(`카카오 API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.documents) ? data.documents : [];
}

function resolveDisplayThumbnail(book, imageFromQuery = "") {
  const passedImage = getHighResImageUrl(imageFromQuery || "");
  if (passedImage) return passedImage;

  const enhancedThumbnail = getHighResImageUrl(book.thumbnail || "");
  if (enhancedThumbnail) return enhancedThumbnail;

  return getFallbackBookImage(book.title || "detail-book");
}

function scoreBookDoc(doc, context = {}) {
  const normalizedDoc = normalizeBook(doc);
  const targetIsbn = getPrimaryIsbn(context.isbn || "");
  const docIsbnCandidates = splitIsbnCandidates(normalizedDoc.isbn);
  const normalizedQuery = normalizeText(context.query || "");
  const normalizedDocTitle = normalizeText(normalizedDoc.title || "");
  const normalizedAuthor = normalizeText((splitAuthors(context.author || "")[0]) || "");
  const normalizedPublisher = normalizeText(context.publisher || "");
  let score = 0;

  if (targetIsbn && docIsbnCandidates.includes(targetIsbn)) score += 1000;
  if (normalizedQuery && normalizedDocTitle === normalizedQuery) score += 300;
  if (normalizedQuery && normalizedDocTitle.includes(normalizedQuery)) score += 120;
  if (normalizedDocTitle && normalizedQuery.includes(normalizedDocTitle)) score += 80;

  const docAuthors = normalizedDoc.authors.map((name) => normalizeText(name));
  if (normalizedAuthor && docAuthors.some((name) => name === normalizedAuthor || name.includes(normalizedAuthor))) {
    score += 180;
  }

  const docPublisher = normalizeText(normalizedDoc.publisher || "");
  if (normalizedPublisher && (docPublisher === normalizedPublisher || docPublisher.includes(normalizedPublisher))) {
    score += 90;
  }

  if (normalizedDoc.sale_price > 0) score += 10;
  if (normalizedDoc.thumbnail) score += 5;

  return score;
}

function pickBestBookDoc(docs = [], context = {}) {
  if (!Array.isArray(docs) || !docs.length) return null;

  return [...docs]
    .map((doc) => ({ doc, score: scoreBookDoc(doc, context) }))
    .sort((a, b) => b.score - a.score)[0]?.doc || docs[0];
}

function buildSubtitle(book) {
  const name = book.authors[0] || "작가";
  return `${name}의 책을 찾는 독자가 한눈에 이해할 수 있도록 핵심 정보와 소개 문장을 정리한 상세 페이지입니다.`;
}

function buildMdComment(book) {
  const keywords = [book.publisher, book.authors[0], book.status].filter(Boolean).slice(0, 2).join(" · ");
  return `${book.title}은(는) 제목만 보아도 분위기가 분명하고, 상세 페이지에 배치했을 때 시선이 잘 모이는 타입의 도서입니다. ${keywords} 흐름을 좋아하는 독자에게 특히 자연스럽게 추천할 수 있습니다.`;
}

function buildTargetReader(book) {
  return `${book.title}처럼 서사와 메시지를 함께 느끼고 싶은 독자, 책 소개 문장을 천천히 읽으며 구매를 결정하는 사용자에게 잘 맞습니다.`;
}

function buildKeywordTags(book) {
  return [book.authors[0], book.publisher, "소장가치", "추천도서"].filter(Boolean).slice(0, 4).join(" · ");
}

function buildIntroParagraphs(book) {
  const safeContents = book.contents || `${book.title}은(는) 독자의 시선을 붙잡는 제목과 분위기를 가진 작품입니다.`;

  const first = `${book.title}은(는) ${safeContents} 상세 페이지 상단에서는 책의 인상과 구매 포인트가 빠르게 보이도록 구성하고, 아래 영역에서는 책의 분위기와 독자 타깃을 천천히 이해할 수 있게 내용을 채웠습니다.`;
  const second = `${book.authors.join(", ")} 저자의 이름은 신뢰 요소로 작동하고, ${book.publisher} 출판사의 정보는 전체 페이지에 안정감을 줍니다. 실제 서점 상세 페이지처럼 단순한 데이터 나열이 아니라 "왜 이 책을 읽어야 하는지"가 느껴지도록 설명 문장을 길게 이어서 배치하는 방식이 잘 어울립니다.`;
  const third = `연습용 프로젝트에서는 카카오 API로 표지, 제목, 저자, 출판사, 가격 같은 핵심 데이터를 받고, 소개 문단·MD 코멘트·추천 독자 영역은 화면 완성도를 위해 프론트에서 가공해 넣으면 페이지가 훨씬 풍성해집니다.`;

  return [first, second, third];
}

function buildAuthorDescription(book) {
  const mainAuthor = book.authors[0] || "저자 미상";
  const translatorText = book.translators.length ? ` 번역에는 ${book.translators.join(", ")}이(가) 참여했습니다.` : "";
  return `${mainAuthor}는 독자에게 선명한 인상과 주제를 전달하는 글을 쓰는 작가로 소개할 수 있습니다. 상세 페이지에서는 실제 작가 약력이 없더라도 작품의 톤, 독자 반응 포인트, 장르적 매력을 묶어서 자연스러운 소개 문단을 만들 수 있습니다.${translatorText}`;
}

function buildToc(book) {
  return [
    `${book.title}을 읽기 전에`,
    `이 책이 던지는 첫 질문`,
    `핵심 장면과 인상적인 흐름`,
    `저자의 시선이 드러나는 부분`,
    `독자가 오래 기억하게 되는 문장`,
    `다 읽고 난 뒤 이어서 읽기 좋은 책`
  ];
}

function buildReviewParagraphs(book) {
  const first = `${book.title}은(는) 첫인상에서 끝나지 않고 읽을수록 여운이 깊어지는 도서로 소개할 수 있습니다. 표지 분위기와 제목, 그리고 본문이 가진 결을 자연스럽게 연결해 보여주면 상세 페이지의 설득력이 높아집니다.`;
  const second = `특히 ${book.publisher}에서 출간된 이 책은 서점 서브페이지에서 "비슷한 취향의 독자들이 함께 보는 책" 영역과 잘 어울립니다. 가격, 적립, 배송 정보 같은 구매 요소 옆에 감성적인 소개 문장을 배치하면 실제 온라인 서점 느낌이 더 살아납니다.`;
  return [first, second];
}

function renderText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateTotalPrice() {
  const unitPrice = currentBook ? (currentBook.sale_price || currentBook.price || 0) : 0;
  const total = unitPrice * quantity;
  qtyValue.textContent = String(quantity);
  renderText("totalPrice", formatPrice(total));
}

function guessCategory(book) {
  const title = `${book.title} ${book.contents}`;
  if (/(경제|투자|돈|자산|비즈니스|마케팅)/.test(title)) return "경제경영";
  if (/(소설|이야기|장편|문학)/.test(title)) return "문학/소설";
  if (/(심리|철학|인문|역사)/.test(title)) return "인문";
  if (/(자기|습관|성장|공부)/.test(title)) return "자기계발";
  return "국내도서";
}

function createDetailUrl(book) {
  const params = new URLSearchParams();
  if (book.primaryIsbn) params.set("isbn", book.primaryIsbn);
  if (book.title) params.set("query", book.title);
  if (book.authors?.[0]) params.set("author", book.authors[0]);
  if (book.publisher) params.set("publisher", book.publisher);
  if (book.thumbnail) params.set("image", getHighResImageUrl(book.thumbnail));

  const safePrice = Number(book.price || 0) > 0 ? Number(book.price) : Number(book.sale_price || 0);
  const safeSalePrice = Number(book.sale_price || 0) > 0 ? Number(book.sale_price) : safePrice;
  if (safePrice > 0) params.set("price", String(safePrice));
  if (safeSalePrice > 0) params.set("sale_price", String(safeSalePrice));

  return `detail.html?${params.toString()}`;
}

function applyForcedValues(book, forced = {}) {
  const displayImage = forced.image ? getHighResImageUrl(forced.image) : resolveDisplayThumbnail(book, "");
  const forcedPrice = Number(forced.price || 0);
  const forcedSalePrice = Number(forced.sale_price || 0);

  book.thumbnail = displayImage;

  if (forcedPrice > 0) book.price = forcedPrice;
  if (forcedSalePrice > 0) {
    book.sale_price = forcedSalePrice;
  }

  if (!(book.price > 0) && book.sale_price > 0) {
    book.price = book.sale_price;
  }
  if (!(book.sale_price > 0) && book.price > 0) {
    book.sale_price = book.price;
  }

  return book;
}

async function fetchBookDetail() {
  const isbn = getQueryParam("isbn") || "";
  const query = getQueryParam("query") || "모건 하우절";
  const author = getQueryParam("author") || "";
  const publisher = getQueryParam("publisher") || "";
  const image = getQueryParam("image") || "";
  const forcedPrice = Number(getQueryParam("price") || 0);
  const forcedSalePrice = Number(getQueryParam("sale_price") || 0);

  detailSearchInput.value = query;

  try {
    let docs = [];
    if (isbn) {
      docs = await fetchKakaoBooks({ query: isbn, size: 10, target: "isbn" });
    }
    if (!docs.length) {
      docs = await fetchKakaoBooks({ query, size: 20, target: "title" });
    }
    if (!docs.length) {
      throw new Error("검색 결과 없음");
    }

    const bestDoc = pickBestBookDoc(docs, { isbn, query, author, publisher });
    if (!bestDoc) {
      throw new Error("일치하는 도서를 찾지 못함");
    }

    const picked = normalizeBook(bestDoc);
    applyForcedValues(picked, { image, price: forcedPrice, sale_price: forcedSalePrice });

    currentBook = picked;
    renderBookDetail(picked);

    const relatedQuery = picked.authors[0] !== "저자 미상" ? picked.authors[0] : picked.publisher;
    await renderRecommendations(relatedQuery, picked.title, picked.primaryIsbn);
  } catch (error) {
    console.error(error);
    renderFallbackState(query);
  }
}

function renderBookDetail(book) {
  document.title = `BOOK GRID - ${book.title}`;
  const bookThumbnailEl = document.getElementById("bookThumbnail");
  const finalThumbnail = resolveDisplayThumbnail(book, book.thumbnail);
  const originalThumbnail = finalThumbnail || getFallbackBookImage(book.title || "detail-book");

  bookThumbnailEl.src = originalThumbnail;
  bookThumbnailEl.alt = book.title;
  bookThumbnailEl.onerror = () => {
    bookThumbnailEl.onerror = null;
    bookThumbnailEl.src = getFallbackBookImage(book.title || "detail-book");
  };

  renderText("breadcrumbTitle", book.title);
  renderText("bookTitle", book.title);
  renderText("bookSubtitle", buildSubtitle(book));
  renderText("bookAuthors", book.authors.join(", "));
  renderText("bookPublisher", book.publisher);
  renderText("bookDate", book.datetime);
  renderText("bookIsbn", book.isbn);

  const displayPrice = Number(book.price || 0) > 0 ? Number(book.price) : Number(book.sale_price || 0);
  const displaySalePrice = Number(book.sale_price || 0) > 0 ? Number(book.sale_price) : displayPrice;

  renderText("originPrice", formatPrice(displayPrice));
  renderText("salePrice", formatPrice(displaySalePrice));
  renderText("stickySalePrice", formatPrice(displaySalePrice));

  const point = Math.floor((displaySalePrice || 0) * 0.05);
  renderText("stickyPoint", `${point.toLocaleString("ko-KR")}P`);
  renderText("discountText", displayPrice > displaySalePrice ? `정가 대비 ${formatPrice(displayPrice - displaySalePrice)} 할인` : "정가 기준 판매");
  renderText("pointText", `기본 적립 ${point.toLocaleString("ko-KR")}P 예상`);
  renderText("saleBadge", book.status || "판매중");
  renderText("mdComment", buildMdComment(book));
  renderText("targetReader", buildTargetReader(book));
  renderText("keywordTags", buildKeywordTags(book));
  renderText("categoryText", guessCategory(book));
  renderText("formatText", "종이책 · 온라인 주문 가능");
  renderText("saleStatusText", `${book.status || "판매중"} · 관심도 높은 도서`);

  const introParagraphs = buildIntroParagraphs(book);
  renderText("introParagraph1", introParagraphs[0]);
  renderText("introParagraph2", introParagraphs[1]);
  renderText("introParagraph3", introParagraphs[2]);

  const mainAuthor = book.authors[0] || "저자 미상";
  renderText("authorInitial", mainAuthor[0] || "작");
  renderText("authorNameBlock", `${mainAuthor} 저자`);
  renderText("authorDescription", buildAuthorDescription(book));

  const tocItems = buildToc(book);
  document.getElementById("tocList").innerHTML = tocItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const reviewParagraphs = buildReviewParagraphs(book);
  renderText("reviewParagraph1", reviewParagraphs[0]);
  renderText("reviewParagraph2", reviewParagraphs[1]);

  quantity = 1;
  updateTotalPrice();
}

async function renderRecommendations(query, currentTitle, currentIsbn = "") {
  try {
    const docs = await fetchKakaoBooks({ query, size: 8, sort: "accuracy", target: "title" });
    const books = docs
      .map((doc) => applyForcedValues(normalizeBook(doc), {}))
      .filter((book) => normalizeText(book.title) !== normalizeText(currentTitle))
      .filter((book) => !currentIsbn || book.primaryIsbn !== currentIsbn)
      .slice(0, 4);

    const recommendGrid = document.getElementById("recommendGrid");
    const sideMiniList = document.getElementById("sideMiniList");

    if (!books.length) {
      recommendGrid.innerHTML = `<div class="empty-box">추천 도서를 불러오지 못했습니다.</div>`;
      sideMiniList.innerHTML = `<div class="empty-box">표시할 항목이 없습니다.</div>`;
      return;
    }

    recommendGrid.innerHTML = books.map((book) => {
      const displayThumb = resolveDisplayThumbnail(book, book.thumbnail);
      const displayPrice = (book.sale_price > 0 ? book.sale_price : book.price) || 0;
      return `
      <article class="recommend-card">
        <a href="${createDetailUrl(book)}" class="recommend-link">
          <div class="thumb">
            <img src="${escapeHtml(displayThumb)}" alt="${escapeHtml(book.title)}" />
          </div>
          <h4>${escapeHtml(book.title)}</h4>
          <p>${escapeHtml(book.authors.join(", "))}</p>
          <strong>${formatPrice(displayPrice)}</strong>
        </a>
      </article>
    `;
    }).join("");

    sideMiniList.innerHTML = books.map((book, index) => {
      const displayThumb = resolveDisplayThumbnail(book, book.thumbnail);
      const displayPrice = (book.sale_price > 0 ? book.sale_price : book.price) || 0;
      return `
      <article class="mini-book-item">
        <a href="${createDetailUrl(book)}" class="mini-book-link">
          <div class="mini-book-thumb">
            <img src="${escapeHtml(displayThumb)}" alt="${escapeHtml(book.title)}" />
          </div>
          <div class="mini-book-copy">
            <span class="mini-book-tag">추천 ${index + 1}</span>
            <h4>${escapeHtml(book.title)}</h4>
            <p>${escapeHtml(book.authors.join(", "))}</p>
            <strong>${formatPrice(displayPrice)}</strong>
          </div>
        </a>
      </article>
    `;
    }).join("");
  } catch (error) {
    console.error("추천 도서 로드 실패:", error);
  }
}

function renderFallbackState(query) {
  const fallback = applyForcedValues(normalizeBook({
    title: query || "도서 상세 예시",
    contents: "카카오 API 응답이 없을 때도 레이아웃을 확인할 수 있도록 준비한 예시 데이터입니다.",
    authors: ["BOOK GRID"],
    publisher: "연습용 출판사",
    price: 18000,
    sale_price: 16200,
    status: "판매 가능",
    thumbnail: "img/book2.jpg",
    isbn: "0000000000000",
    datetime: "2026-03-17"
  }), {});

  currentBook = fallback;
  renderBookDetail(fallback);
  renderRecommendations("추천 도서", fallback.title, fallback.primaryIsbn);
}

function bindEvents() {
  detailSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const keyword = detailSearchInput.value.trim();
    if (!keyword) return;

    const url = new URL(window.location.href);
    url.searchParams.set("query", keyword);
    url.searchParams.delete("isbn");
    url.searchParams.delete("author");
    url.searchParams.delete("publisher");
    url.searchParams.delete("image");
    url.searchParams.delete("price");
    url.searchParams.delete("sale_price");
    window.location.href = url.toString();
  });

  qtyMinus.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateTotalPrice();
  });

  qtyPlus.addEventListener("click", () => {
    quantity += 1;
    updateTotalPrice();
  });
}

bindEvents();
fetchBookDetail();
