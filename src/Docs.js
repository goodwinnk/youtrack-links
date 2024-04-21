// noinspection JSUnusedGlobalSymbols
function onOpen() {
    DocumentApp.getUi().createAddonMenu()
        .addItem('Update Issues Links', 'updateIssues_')
        .addItem('Settings', 'showSettingsForm_')
        .addToUi();

    initializeSettings_();
}

function noYouTrackConnectionAlert() {
    let html = HtmlService.createHtmlOutputFromFile('NoConnection')
        .setWidth(400);
    DocumentApp.getUi()
        .showModalDialog(html, 'Connection Problem');
}