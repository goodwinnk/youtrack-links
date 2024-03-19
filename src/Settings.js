function showSettingsForm() {
    const html = HtmlService.createHtmlOutputFromFile('SettingsForm')
        .setWidth(400)
        .setHeight(500);
    DocumentApp.getUi().showModalDialog(html, 'YouTrack Links Settings');
}

const FAKE_TOKEN_NOT_CHANGED = "--------"

function getExistingSettings() {
    return {
        serverUrl: scriptProperties.getProperty(SERVER_URL_KEY),
        issuesRegexp: scriptProperties.getProperty(ISSUES_REGEXP_KEY),
        checkIssuesStatus: scriptProperties.getProperty(CHECK_ISSUES_STATUS) === "true",
        apiToken: FAKE_TOKEN_NOT_CHANGED
    };
}

function saveSettings(serverUrl, issuesRegexp, checkIssueStatus, token) {
    scriptProperties.setProperty(SERVER_URL_KEY, serverUrl);
    scriptProperties.setProperty(ISSUES_REGEXP_KEY, issuesRegexp);
    scriptProperties.setProperty(CHECK_ISSUES_STATUS, checkIssueStatus ? "true" : "false");

    if (token && token !== FAKE_TOKEN_NOT_CHANGED) {
        scriptProperties.setProperty(API_TOKEN, token);
    }
}