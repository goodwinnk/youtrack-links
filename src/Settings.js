function showSettingsForm() {
    const html = HtmlService.createHtmlOutputFromFile('SettingsForm')
        .setWidth(400)
        .setHeight(300);
    DocumentApp.getUi().showModalDialog(html, 'Settings');
}

function getExistingSettings() {
    Logger.log("Fetching existing settings...");
    return {
        serverUrl: scriptProperties.getProperty(SERVER_URL_KEY),
        issuesRegexp: scriptProperties.getProperty(ISSUES_REGEXP_KEY)
    };
}

function saveSettings(serverUrl, issuesRegexp) {
    scriptProperties.setProperty(SERVER_URL_KEY, serverUrl);
    scriptProperties.setProperty(ISSUES_REGEXP_KEY, issuesRegexp);

    Logger.log("Settings saved: " + serverUrl + " " + issuesRegexp);
}