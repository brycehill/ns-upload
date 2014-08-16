/**
 * Maps mime types to NetSuite types
 * See SuiteScriptDev&RefGuide.pdf :: Chapter 77 Supported File Types
 * For more information
 */


var map = {
    'text/html': 'HTML',
    'application/javascript': 'JAVASCRIPT',
    'text/plain': 'PLAINTEXT',
    'text/css': 'STYLESHEET'
}

module.exports = get
function get(mime) {
    if (map[mime]) return map[mime]
}
