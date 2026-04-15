// Best-effort anti-framing guard for static hosting without response-header control.
if (window.top !== window.self) {
    try {
        window.top.location = window.self.location.href;
    } catch {
        window.self.location = window.self.location.href;
    }
}
