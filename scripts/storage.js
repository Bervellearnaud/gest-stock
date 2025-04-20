const STORAGE_KEY_ARTICLES = "gestionStockArticles";

function getArticles() {
  const data = localStorage.getItem(STORAGE_KEY_ARTICLES);
  return data ? JSON.parse(data) : [];
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
}

function addArticle(article) {
  const articles = getArticles();
  articles.push(article);
  saveArticles(articles);
}

function updateArticle(updatedArticle) {
  let articles = getArticles();
  articles = articles.map((article) =>
    article.id === updatedArticle.id ? updatedArticle : article
  );
  saveArticles(articles);
}

function deleteArticle(articleId) {
  let articles = getArticles();
  articles = articles.filter((article) => article.id !== articleId);
  saveArticles(articles);
}
