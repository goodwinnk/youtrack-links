function updateIssues_() {
    const youtrackServer = scriptUserProperties.getProperty(SERVER_URL_KEY);
    const issuesKey = scriptUserProperties.getProperty(ISSUES_REGEXP_KEY);
    if (!youtrackServer || !issuesKey) {
        showSettingsForm_(true);
        return;
    }

    const checkStatus = scriptUserProperties.getProperty(CHECK_ISSUES_STATUS) === "true";
    const token = scriptUserProperties.getProperty(API_TOKEN);
    if (checkStatus) {
        if (checkConnection(youtrackServer, token) != null) {
            customAlert(
                "Connection Problem",
                "⚠️ Unable to check issue statuses.\nPlease check YouTrack URL and token in Settings."
            );
            return;
        }
    }

    const issueLinkBase = youtrackServer + "/issue/";

    const issueRegex = `(${issuesKey})-\\d{1,20}`;
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
        const issueKey = getSubstringBefore(issueId, "-")

        if (issueKey.length <= 0) {
            customAlert(
                "Issues Key Pattern Problem",
                "⚠️ Issues key pattern can be resolved to an empty string.\nPlease check it in Settings");
            return;
        }

        if (checkStatus) {
            const url = `${scriptUserProperties.getProperty(SERVER_URL_KEY)}/api/issues/${encodeURIComponent(issueId)}?fields=resolved`;
            /** @type {URLFetchRequest} */
            let issueRequest = {
                "url": url,
                "muteHttpExceptions": true,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            requests.push(issueRequest);
        }

        issueElements.push({issueElement, startOffset, endOffset, issueId});

        issueElement = body.findText(issueRegex, issueElement);
    }

    if (checkStatus) {
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

// noinspection JSUnusedGlobalSymbols
function checkConnection(url, token) {
    if (token === FAKE_TOKEN_NOT_CHANGED) {
        token = scriptUserProperties.getProperty(API_TOKEN);
    }

    try {
        const response = UrlFetchApp.fetch(
            `${url}/api/users/me`,
            {
                "muteHttpExceptions": true,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        let responseCode = response.getResponseCode();
        if (responseCode >= 200 && responseCode < 300) {
            return null;
        }

        if (responseCode === 404) {
            return HtmlService.createHtmlOutput(`Server ${url} was not found`).getContent();
        }

        try {
            const json = response.getContentText();
            const error = JSON.parse(json).error;
            if (error) {
                return HtmlService.createHtmlOutput(`Error: ${error}`).getContent();
            }
        } catch (error) {
            // Ignore - just show the response code
        }

        return `Error: ${responseCode}`;
    } catch (error) {
        let message = `Failed to connect to ${url}`
        return HtmlService.createHtmlOutput(message).getContent();
    }
}

function getSubstringBefore(text, str) {
    const occurrenceIndex = text.indexOf(str);
    if (occurrenceIndex === -1) {
        return text; // No hyphen found, return the entire string
    }
    return text.substring(0, occurrenceIndex);
}