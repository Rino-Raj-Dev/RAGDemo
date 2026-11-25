component {
    this.name = 'CFSummit2026DocumentLabV8';
    this.sessionManagement = true;
    this.sessionTimeout = createTimeSpan(0, 2, 0, 0);
    this.applicationTimeout = createTimeSpan(1, 0, 0, 0);
    this.setClientCookies = true;
    this.sessionCookie = {httpOnly = true, sameSite = 'Strict'};
    this.serialization = {
        preserveCaseForStructKey = true,
        preserveCaseForQueryColumn = true
    };
    this.mappings['/summitservices'] = getDirectoryFromPath(getCurrentTemplatePath()) & 'services';

    boolean function onApplicationStart() {
        application.lab = new summitservices.LabService(
            getDirectoryFromPath(getCurrentTemplatePath())
        );
        return true;
    }

    void function onSessionStart() {
        session.persona = 'company-a';
        session.csrf = replace(createUUID(), '-', '', 'all');
        session.provider = {provider = 'codemax', modelName = '', apiKey = ''};
        session.lastEvidence = [];
    }

    boolean function onRequestStart(string targetPage) {
        setting showdebugoutput = false;
        setting requesttimeout = 180;
        // This is a local presenter lab. Personas simulate users; they are not a login system.
        if (!listFindNoCase('127.0.0.1,::1,0:0:0:0:0:0:0:1', cgi.remote_addr)) {
            cfheader(statuscode = 403);
            writeOutput('This presentation lab accepts local requests only.');
            return false;
        }
        if (findNoCase('/WEB-INF/', cgi.script_name)) {
            cfheader(statuscode = 403);
            return false;
        }
        cfheader(name = 'X-Content-Type-Options', value = 'nosniff');
        cfheader(name = 'Referrer-Policy', value = 'no-referrer');
        cfheader(name = 'Cache-Control', value = 'no-store');
        cfheader(
            name = 'Content-Security-Policy',
            value = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
                & "connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; "
                & "frame-ancestors 'self'"
        );
        return true;
    }
}

