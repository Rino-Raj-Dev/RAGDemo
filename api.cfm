<cfsetting showdebugoutput="false" requesttimeout="180">
<cfcontent type="application/json; charset=utf-8" reset="true">
<cfscript>
    function send(required struct body, numeric status = 200) {
        cfheader(statuscode = arguments.status);
        writeOutput(serializeJSON(arguments.body));
    }

    try {
        action = structKeyExists(url, 'action') ? url.action : 'status';
        data = {};
        if (cgi.request_method == 'POST') {
            data = deserializeJSON(toString(getHttpRequestData().content));
            if (!isStruct(data)) {
                throw(type = 'Lab.Validation', message = 'Request body must be a JSON object.');
            }
            if (!structKeyExists(data, 'csrf') || data.csrf != session.csrf) {
                send({ok = false, error = 'Session expired. Reload this page.'}, 403);
                abort;
            }
        } else if (!listFind('status,documents', action)) {
            send({ok = false, error = 'Use POST for this action.'}, 405);
            abort;
        }

        switch (action) {
            case 'status':
                send({
                    ok = true,
                    csrf = session.csrf,
                    persona = session.persona,
                    provider = application.lab.providerStatus(session.provider),
                    status = application.lab.status()
                });
                break;

            case 'documents':
                send({
                    ok = true,
                    documents = application.lab.documents(session.persona)
                });
                break;

            case 'persona':
                if (
                    !structKeyExists(data, 'persona')
                    || !listFind('company-a,company-b', data.persona)
                ) {
                    throw(type = 'Lab.Validation', message = 'Choose a valid demo persona.');
                }
                session.persona = data.persona;
                session.lastEvidence = [];
                send({ok = true, persona = session.persona});
                break;

            case 'configure':
                session.provider = application.lab.configure(data);
                session.lastEvidence = [];
                send({
                    ok = true,
                    provider = application.lab.providerStatus(session.provider)
                });
                break;

            case 'ingest':
                send({ok = true, status = application.lab.ingest()});
                break;

            case 'testConnection':
                send({
                    ok = true,
                    result = application.lab.testConnection(session.provider)
                });
                break;

            case 'query':
                result = application.lab.query(data, session.persona, session.provider);
                session.lastEvidence = result.context;
                send({ok = true, result = result});
                break;

            case 'chunks':
                send({
                    ok = true,
                    result = application.lab.inspect(data, session.persona)
                });
                break;

            case 'evaluate':
                send({
                    ok = true,
                    result = application.lab.evaluate(session.persona)
                });
                break;

            case 'native':
                send({
                    ok = true,
                    result = application.lab.nativeRag(
                        data,
                        session.persona,
                        session.provider
                    )
                });
                break;

            default:
                send({ok = false, error = 'Unknown action.'}, 404);
        }
    } catch (any e) {
        // Never return provider exceptions, secrets, raw prompts or CF debug pages.
        if (left(e.type, 4) == 'Lab.') {
            send({ok = false, error = e.message}, 400);
        } else if (action == 'ingest') {
            send({ok = false, error = 'Indexing failed: ' & e.message}, 500);
        } else {
            send({
                ok = false,
                error = 'The operation failed. Check PDF-path permissions, the AI package, '
                    & 'and provider configuration. No credentials or provider response were logged.'
            }, 500);
        }
    }
</cfscript>
