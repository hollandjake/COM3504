/**
 * creates an error message element
 * @param {string} errorMessage
 * @returns {Element} error
 */
export function error(errorMessage) {
    return($('<div class="alert alert-warning alert-dismissible fade show modal-dialog" role="alert">\n' +
        `  <strong>Holy guacamole!</strong> ${errorMessage.replaceAll("\n", "<br>")}` +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>'));
}