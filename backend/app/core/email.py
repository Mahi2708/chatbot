from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USERNAME,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SMTP_FROM,
    MAIL_SERVER=settings.SMTP_SERVER,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fm = FastMail(conf)


async def send_email(
    *,
    subject: str,
    recipients: list[str],
    body: str,
    subtype: str = "plain",
):
    """
    Generic email sender
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=subtype,
    )

    await fm.send_message(message)
