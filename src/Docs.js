// noinspection JSUnusedGlobalSymbols
function onOpen() {
    DocumentApp.getUi().createAddonMenu()
        .addItem('Update Issues Links', 'updateIssues')
        .addItem('Settings', 'showSettingsForm')
        .addToUi();

    initializeSettings();
}