import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("EMAIL_API_KEY")
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "onboarding@resend.dev")

def send_verification_email(to_email: str, token: str):
    """
    Sends a verification email using Resend.
    """
    verify_url = f"http://localhost:3000/verify-email?token={token}"
    
    subject = "Verify your Blossom Retreat Account"
    html_content = f"""
    <p>Welcome to Blossom Retreat Platform!</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="{verify_url}">Verify Email</a>
    <p>Or copy this link: {verify_url}</p>
    """

    try:
        if not resend.api_key:
            print(f"[MOCK EMAIL] To: {to_email} | Subject: {subject} | Link: {verify_url}")
            return {"id": "mock-id"}

        params = {
            "from": EMAIL_SENDER,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }

        email = resend.Emails.send(params)
        print(f"Email sent to {to_email}: {email}")
        return email

    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        # Don't crash the app if email fails, but log it
        return None
