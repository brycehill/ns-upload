/**
 * A super simple sample restlet that can be used to update an existing file in
 * the file cabinet.
 */
function updateFile(data){
    var ret = { success: false },
        oldFile = nlapiLoadFile(data.path),
        updatedFile = nlapiCreateFile(data.fileName, data.fileType, data.content)

    updatedFile.setFolder(oldFile.getFolder())

    if (updatedFile && nlapiSubmitFile(updatedFile)) ret.success = true

    return ret;
}
