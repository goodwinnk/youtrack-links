// noinspection JSUnusedGlobalSymbols
function onOpen() {
    DocumentApp.getUi().createAddonMenu()
        .addItem('Update Issues Links', 'updateIssues_')
        .addItem('Settings', 'showSettingsForm_')
        .addToUi();

    initializeSettings_();
}