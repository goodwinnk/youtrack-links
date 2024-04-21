const SERVER_URL_KEY = "SERVER_URL_KEY";
const ISSUES_REGEXP_KEY = "ISSUES_REGEXP_KEY";
const CHECK_ISSUES_STATUS = "CHECK_ISSUES_STATUS";
const API_TOKEN = "API_TOKEN";

const scriptUserProperties = PropertiesService.getUserProperties();

function showSettingsForm_(showNeedToReRunMessage) {
    let htmlTemplate = HtmlService.createTemplateFromFile('SettingsForm');
    htmlTemplate.showNeedToReRunMessage = showNeedToReRunMessage || false;

    const html = htmlTemplate
        .evaluate()
        .setWidth(400)
        .setHeight(500);
    DocumentApp.getUi().showModalDialog(html, 'YouTrack Links Settings');
}

function initializeSettings_() {
    if (!scriptUserProperties.getProperty(SERVER_URL_KEY)) {
        scriptUserProperties.setProperty(SERVER_URL_KEY, "https://youtrack.jetbrains.com");
    }

    if (!scriptUserProperties.getProperty(ISSUES_REGEXP_KEY)) {
        scriptUserProperties.setProperty(ISSUES_REGEXP_KEY, "[A-Z]{2,10}");
    }

    if (!scriptUserProperties.getProperty(CHECK_ISSUES_STATUS)) {
        scriptUserProperties.setProperty(CHECK_ISSUES_STATUS, "false");
    }
}

const FAKE_TOKEN_NOT_CHANGED = "--------"

// noinspection JSUnusedGlobalSymbols
function getExistingSettings() {
    return {
        serverUrl: scriptUserProperties.getProperty(SERVER_URL_KEY),
        issuesRegexp: scriptUserProperties.getProperty(ISSUES_REGEXP_KEY),
        checkIssuesStatus: scriptUserProperties.getProperty(CHECK_ISSUES_STATUS) === "true",
        apiToken: FAKE_TOKEN_NOT_CHANGED
    };
}

// noinspection JSUnusedGlobalSymbols
function saveSettings(serverUrl, issuesRegexp, checkIssueStatus, token) {
    scriptUserProperties.setProperty(SERVER_URL_KEY, serverUrl);
    scriptUserProperties.setProperty(ISSUES_REGEXP_KEY, issuesRegexp);
    scriptUserProperties.setProperty(CHECK_ISSUES_STATUS, checkIssueStatus ? "true" : "false");

    if (token && token !== FAKE_TOKEN_NOT_CHANGED) {
        scriptUserProperties.setProperty(API_TOKEN, token);
    }
}