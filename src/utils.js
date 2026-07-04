export function toast (title = '', message = '', color = 'black') {
    const errorEvent = new CustomEvent("toast", {
        detail: {
            color: color,
            title: title,
            text: message
        }
    });
    document.body.dispatchEvent(errorEvent);

}