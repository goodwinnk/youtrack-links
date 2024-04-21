// noinspection JSUnusedGlobalSymbols
function onOpen() {
    DocumentApp.getUi().createAddonMenu()
        .addItem('Update Issues Links', 'updateIssues_')
        .addItem('Settings', 'showSettingsForm_')
        .addToUi();

    initializeSettings_();
}

function customAlert(title, message) {
    let htmlTemplate = HtmlService.createTemplateFromFile('CustomAlert');
    htmlTemplate.messages = message.split('\n');

    let html = htmlTemplate
        .evaluate()
        .setWidth(400);

    DocumentApp.getUi()
        .showModalDialog(html, title);
}