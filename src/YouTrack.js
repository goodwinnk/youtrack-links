const SERVER_URL_KEY = "SERVER_URL_KEY";
const ISSUES_REGEXP_KEY = "ISSUES_REGEXP_KEY";
const CHECK_ISSUES_STATUS = "CHECK_ISSUES_STATUS";
const API_TOKEN = "API_TOKEN";

const scriptProperties = PropertiesService.getScriptProperties();

// noinspection JSUnusedGlobalSymbols
function onOpen() {
    DocumentApp.getUi().createAddonMenu()
        .addItem('Update Issues Links', 'updateIssues')
        .addItem('Settings', 'showSettingsForm')
        .addToUi();


    if (!scriptProperties.getProperty(SERVER_URL_KEY)) {
        scriptProperties.setProperty(SERVER_URL_KEY, "https://youtrack.jetbrains.com");
    }

    if (!scriptProperties.getProperty(ISSUES_REGEXP_KEY)) {
        scriptProperties.setProperty(ISSUES_REGEXP_KEY, "[A-Z]{2,10}");
    }

    if (!scriptProperties.getProperty(CHECK_ISSUES_STATUS)) {
        scriptProperties.setProperty(CHECK_ISSUES_STATUS, "true");
    }
}

function updateIssues() {
    const issueLinkBase = scriptProperties.getProperty(SERVER_URL_KEY) + "/issue/";
    const issuesKey = scriptProperties.getProperty(ISSUES_REGEXP_KEY);
    const checkStatus = scriptProperties.getProperty(CHECK_ISSUES_STATUS);

    const issueRegex = issuesKey + "-\\d{1,10}";
    const body = DocumentApp.getActiveDocument().getBody();

    /** @type {Array<URLFetchRequest>} */
    const requests = []; // For storing fetch requests
    const issueElements = []; // To track issue elements for later processing

    // Prepare list of elements and places for butch processing
    let issueElement = body.findText(issueRegex);
    while (issueElement != null) {
        const issueText = issueElement.getElement().asText();
        const startOffset = issueElement.getStartOffset();
        const endOffset = issueElement.getEndOffsetInclusive();
        const issueId = issueText.getText().substring(startOffset, endOffset + 1);

        const url = `${scriptProperties.getProperty(SERVER_URL_KEY)}/api/issues/${encodeURIComponent(issueId)}?fields=resolved`;
        /** @type {URLFetchRequest} */
        let issueRequest = {"url": url, "muteHttpExceptions": true};

        requests.push(issueRequest);
        issueElements.push({issueElement, startOffset, endOffset, issueId});

        issueElement = body.findText(issueRegex, issueElement);
    }

    if (checkStatus === "true") {
        if (requests.length > 0) {
            // Execute all the requests in parallel
            const responses = UrlFetchApp.fetchAll(requests);

            responses.forEach((response, index) => {
                const {issueElement, startOffset, endOffset, issueId} = issueElements[index];
                const issueStatus = isPresentAndResolved(response);

                if (issueStatus === IssuesResponse.RESOLVED || issueStatus === IssuesResponse.UNRESOLVED) {
                    const issueText = issueElement.getElement().asText();

                    const urlText = issueLinkBase + issueId;
                    issueText.setLinkUrl(startOffset, endOffset, urlText);

                    if (issueStatus === IssuesResponse.RESOLVED) {
                        issueText.setStrikethrough(startOffset, endOffset, true);
                    } else if ((issueStatus === IssuesResponse.UNRESOLVED)) {
                        issueText.setStrikethrough(startOffset, endOffset, false);
                    }
                }
            });
        }
    } else {
        for (let {issueElement, startOffset, endOffset, issueId} of issueElements) {
            const issueText = issueElement.getElement().asText();

            const urlText = issueLinkBase + issueId;
            issueText.setLinkUrl(startOffset, endOffset, urlText);
        }
    }
}

const IssuesResponse = {
    ERROR_REQUEST: 0,
    ERROR_UNKNOWN: 1,
    ERROR_ABSENT_OR_NO_PERMISSIONS: 2,
    RESOLVED: 3,
    UNRESOLVED: 4
}

/**
 * @param {HTTPResponse} response
 * @returns {number}
 */
function isPresentAndResolved(response) {
    const responseCode = response.getResponseCode();
    if (!(responseCode >= 200 && responseCode < 300)) {
        if (responseCode === 404) {
            return IssuesResponse.ERROR_ABSENT_OR_NO_PERMISSIONS;
        }

        return IssuesResponse.ERROR_REQUEST;
    }

    const json = response.getContentText();
    const data = JSON.parse(json);

    // noinspection JSUnresolvedReference
    let resolved = data.resolved;
    if (resolved === undefined) {
        return IssuesResponse.ERROR_UNKNOWN;
    }

    if (resolved !== null) {
        return IssuesResponse.RESOLVED;
    }

    return IssuesResponse.UNRESOLVED;
}