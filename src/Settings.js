const SERVER_URL_KEY = "SERVER_URL_KEY";
const ISSUES_REGEXP_KEY = "ISSUES_REGEXP_KEY";
const CHECK_ISSUES_STATUS = "CHECK_ISSUES_STATUS";
const API_TOKEN = "API_TOKEN";

const scriptProperties = PropertiesService.getScriptProperties();

function showSettingsForm_() {
    const html = HtmlService.createTemplateFromFile('SettingsForm')
        .evaluate()
        .setWidth(400)
        .setHeight(500);
    DocumentApp.getUi().showModalDialog(html, 'YouTrack Links Settings');
}

function initializeSettings_() {
    if (!scriptProperties.getProperty(SERVER_URL_KEY)) {
        scriptProperties.setProperty(SERVER_URL_KEY, "https://youtrack.jetbrains.com");
    }

    if (!scriptProperties.getProperty(ISSUES_REGEXP_KEY)) {
        scriptProperties.setProperty(ISSUES_REGEXP_KEY, "[A-Z]{2,10}");
    }

    if (!scriptProperties.getProperty(CHECK_ISSUES_STATUS)) {
        scriptProperties.setProperty(CHECK_ISSUES_STATUS, "false");
    }
}

const FAKE_TOKEN_NOT_CHANGED = "--------"

// noinspection JSUnusedGlobalSymbols
function getExistingSettings() {
    return {
        serverUrl: scriptProperties.getProperty(SERVER_URL_KEY),
        issuesRegexp: scriptProperties.getProperty(ISSUES_REGEXP_KEY),
        checkIssuesStatus: scriptProperties.getProperty(CHECK_ISSUES_STATUS) === "true",
        apiToken: FAKE_TOKEN_NOT_CHANGED
    };
}

// noinspection JSUnusedGlobalSymbols
function saveSettings(serverUrl, issuesRegexp, checkIssueStatus, token) {
    scriptProperties.setProperty(SERVER_URL_KEY, serverUrl);
    scriptProperties.setProperty(ISSUES_REGEXP_KEY, issuesRegexp);
    scriptProperties.setProperty(CHECK_ISSUES_STATUS, checkIssueStatus ? "true" : "false");

    if (token && token !== FAKE_TOKEN_NOT_CHANGED) {
        scriptProperties.setProperty(API_TOKEN, token);
    }
}