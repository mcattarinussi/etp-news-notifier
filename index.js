const AWS = require('aws-sdk');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const { S3_BUCKET_NAME } = process.env;
const NEWS_PAGE_URL = 'http://www.entetutelapesca.it/cms/it/istituzionale/amministrazione-trasparente/20info_ambientali';

const s3 = new AWS.S3();

const fetchNewsPage = () =>
    fetch(NEWS_PAGE_URL)
        .then(resp => resp.text());

const extractArticlesFromHtml = newsPageHtml => {
    const $ = cheerio.load(newsPageHtml);
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

const fetchStoredArticles = async () =>
    s3.getObject({
        Bucket: S3_BUCKET_NAME,
        Key: 'articles.json'
    })
        .promise()
        .then(({ Body }) => JSON.parse(Body.toString()))
        .catch(err => {
            if (err.code && err.code === 'NoSuchKey') {
                return null;
            }

            throw err;
        });

const uploadArticles = async articles =>
    s3.putObject({
        Body: JSON.stringify(articles),
        Bucket: S3_BUCKET_NAME,
        Key: 'articles.json'
    }).promise();


const detectNewArticles = (storedArticles, extractedArticles) => {
    const storedArticlesHrefs = storedArticles.map(({ href }) => href);
    return extractedArticles.filter(article => !storedArticlesHrefs.includes(article.href));
};

module.exports.handler = async () => {
    const storedArticles = await fetchStoredArticles();
    const extractedArticles = extractArticlesFromHtml(await fetchNewsPage());

    if (!storedArticles) {
        console.log('No stored articles found. Uploading extracted articles to S3.');
        await uploadArticles(extractedArticles);
        return;
    }

    const newArticles = detectNewArticles(storedArticles, extractedArticles);

    if (!newArticles.length) {
        console.log('No new articles found.');
        return;
    }

    console.log('Found new articles\n', JSON.stringify(newArticles, null, 4));

    // send email/sms with new articles

    console.log('Uploading updated articles to S3');
    await uploadArticles(extractedArticles);
};
