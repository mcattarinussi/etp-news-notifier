# ETP News Notifier

Notification service for [entetutelapesca.it - Informazioni ambientali](http://www.etpi.fvg.it/cms/it/istituzionale/amministrazione-trasparente/20info_ambientali) news. The registered email address will receive an email when a new article is available.

[ETP (Ente Tutela Pesca)](http://www.etpi.fvg.it/cms/it) is the organization that regulates sport fishing in the Friuli Venezia Giulia region (Italy). They don't provide a newsletter to subscribe to, so the only way to know if something was released is to constantly check the news page on their website. This service automates this procedure by regularly checking the website for new articles: when one is detected the configured email address will be notified with an email containing the article link.

## Deployment

The service infrastructure is deployed on AWS using the [Serverless Framework](https://github.com/serverless/serverless).

Before deploying the infrastructure you must setup the target email address in the [AWS Parameter Store](https://eu-west-1.console.aws.amazon.com/systems-manager/parameters/). The parameter must be created using the following configuration:
- Name: `/etp-news-notifier/target-email`
- Type: `String`
- Value: the email address that will receive notifications when a new article is available

Once created, you can deploy the service with: `serverless deploy`.

**Important:** the first time you deploy the service you must verify the email address by clkicking the "Confirm subscription" link included in the subscription confirmation email sent by AWS.
