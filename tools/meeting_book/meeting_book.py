# Original source - https://stackoverflow.com/q/10147455
# Posted by mahoriR, modified by community. See post 'Timeline' for change history
# Retrieved 2026-08-08, License - CC BY-SA 4.0
#
# Rewritten as an importable function: the original ran a live sendmail() at
# module import time with a hardcoded recipient, so `import meeting_book`
# alone used to fire an email. It also imported `env` instead of `dotenv`.
import smtplib
from email.mime.text import MIMEText

from app.config import get_settings


class EmailNotConfiguredError(RuntimeError):
    pass


def send_confirmation_email(to_address: str, subject: str, body: str) -> None:
    settings = get_settings()
    if not (settings.smtp_email and settings.smtp_app_password):
        raise EmailNotConfiguredError("SMTP_EMAIL / SMTP_APP_PASSWORD are not configured")

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.smtp_email
    msg["To"] = to_address

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(settings.smtp_email, settings.smtp_app_password)
        server.sendmail(settings.smtp_email, [to_address], msg.as_string())
