<cfsetting showdebugoutput="false">
<cfscript>
    try {
        id=structKeyExists(url,'id') ? url.id : '';
        source=application.lab.source(id,session.persona);
        cfheader(name='Content-Disposition',value='inline; filename="' & getFileFromPath(source.path) & '"');
        cfcontent(type='application/pdf',file=source.path,deletefile=false);
    } catch(any e) {
        cfheader(statuscode=403);
        writeOutput('This source is not available to the selected demo persona.');
    }
</cfscript>
