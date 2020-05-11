const cheerio = require('cheerio');
const fetch = require('node-fetch');

const NEWS_PAGE_URL = 'http://www.entetutelapesca.it/cms/it/istituzionale/amministrazione-trasparente/20info_ambientali';

const fetchNewsPage = () =>
    fetch(NEWS_PAGE_URL)
        .then(resp => resp.text());

const extractArticles = (pageHtml) => {
    const $ = cheerio.load(pageHtml);
    const articleNodes = $('#content-wrapper > .container > div p > a:nth-child(1)');

    const articles = [];

    articleNodes.each((idx, node) => {
        if (!node.attribs.href) {
            console.log('Missing href attribute for node ', idx);
            return;
        }

        const firstChildren = node.children.filter(c => c.type === 'text').shift();

        articles.push({
            href: node.attribs.href,
            nodeIndex: idx,
            title: (firstChildren && firstChildren.data) || '',
        });
    });

    return articles;
};

(async () => {
    const articles = extractArticles(await fetchNewsPage());

    console.log(articles);
})();
