export function announce(message) {
  const status = document.querySelector('#site-status');
  if (status) status.textContent = message;
}

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(window.portfolioContent.email);
    announce('Email copied to clipboard.');
    return true;
  } catch {
    announce('Copy unavailable. Select the email address or use the email link.');
    return false;
  }
}
