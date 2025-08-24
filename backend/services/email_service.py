import os
from datetime import datetime
from typing import Dict, Any, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

class EmailService:
    def __init__(self):
        # Email configuration - in production, use environment variables
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', 'your-email@gmail.com')
        self.smtp_password = os.getenv('SMTP_PASSWORD', 'your-app-password')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@leadnexus.com')
        self.from_name = os.getenv('FROM_NAME', 'Lead Nexus')
        
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send an email with HTML and text content"""
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False
    
    def get_welcome_email_template(self, user_name: str, user_role: str) -> Dict[str, str]:
        """Generate welcome email template"""
        subject = f"Welcome to Lead Nexus, {user_name}!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Lead Nexus</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to Lead Nexus!</h1>
                    <p>Your journey to better lead management starts now</p>
                </div>
                <div class="content">
                    <h2>Hello {user_name},</h2>
                    <p>Welcome to Lead Nexus! We're excited to have you on board as a <strong>{user_role.title()}</strong>.</p>
                    
                    <h3>What's next?</h3>
                    <ul>
                        <li>Complete your profile setup</li>
                        <li>Explore our marketplace</li>
                        <li>Start connecting with leads</li>
                    </ul>
                    
                    <a href="http://localhost:5173/dashboard" class="button">Get Started</a>
                    
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    
                    <p>Best regards,<br>The Lead Nexus Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 Lead Nexus. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to Lead Nexus, {user_name}!
        
        We're excited to have you on board as a {user_role.title()}.
        
        What's next?
        - Complete your profile setup
        - Explore our marketplace
        - Start connecting with leads
        
        Get started: http://localhost:5173/dashboard
        
        If you have any questions, feel free to reach out to our support team.
        
        Best regards,
        The Lead Nexus Team
        
        © 2024 Lead Nexus. All rights reserved.
        """
        
        return {
            'subject': subject,
            'html': html_content,
            'text': text_content
        }
    
    def get_lead_purchase_email_template(self, buyer_name: str, lead_title: str, purchase_amount: float, lead_details: Dict[str, Any]) -> Dict[str, str]:
        """Generate lead purchase confirmation email"""
        subject = f"Lead Purchase Confirmation - {lead_title}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lead Purchase Confirmation</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .lead-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }}
                .button {{ display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Lead Purchase Confirmed!</h1>
                    <p>Your lead is ready for action</p>
                </div>
                <div class="content">
                    <h2>Hello {buyer_name},</h2>
                    <p>Your lead purchase has been successfully processed!</p>
                    
                    <div class="lead-details">
                        <h3>Lead Details:</h3>
                        <p><strong>Title:</strong> {lead_title}</p>
                        <p><strong>Company:</strong> {lead_details.get('company_name', 'N/A')}</p>
                        <p><strong>Contact:</strong> {lead_details.get('contact_name', 'N/A')}</p>
                        <p><strong>Email:</strong> {lead_details.get('email', 'N/A')}</p>
                        <p><strong>Phone:</strong> {lead_details.get('phone', 'N/A')}</p>
                        <p><strong>Amount Paid:</strong> ${purchase_amount:.2f}</p>
                    </div>
                    
                    <a href="http://localhost:5173/orders" class="button">View Order Details</a>
                    
                    <p>Start reaching out to your new lead and make the most of this opportunity!</p>
                    
                    <p>Best regards,<br>The Lead Nexus Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 Lead Nexus. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Lead Purchase Confirmation - {lead_title}
        
        Hello {buyer_name},
        
        Your lead purchase has been successfully processed!
        
        Lead Details:
        - Title: {lead_title}
        - Company: {lead_details.get('company_name', 'N/A')}
        - Contact: {lead_details.get('contact_name', 'N/A')}
        - Email: {lead_details.get('email', 'N/A')}
        - Phone: {lead_details.get('phone', 'N/A')}
        - Amount Paid: ${purchase_amount:.2f}
        
        View Order Details: http://localhost:5173/orders
        
        Start reaching out to your new lead and make the most of this opportunity!
        
        Best regards,
        The Lead Nexus Team
        
        © 2024 Lead Nexus. All rights reserved.
        """
        
        return {
            'subject': subject,
            'html': html_content,
            'text': text_content
        }
    
    def get_lead_approval_email_template(self, vendor_name: str, lead_title: str, status: str, notes: str = None) -> Dict[str, str]:
        """Generate lead approval/rejection email"""
        is_approved = status.lower() == 'approved'
        subject = f"Lead {status.title()} - {lead_title}"
        
        status_color = "#28a745" if is_approved else "#dc3545"
        status_icon = "✅" if is_approved else "❌"
        status_gradient = "linear-gradient(135deg, #28a745 0%, #20c997 100%)" if is_approved else "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lead {status.title()}</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: {status_gradient}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .status-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid {status_color}; }}
                .button {{ display: inline-block; background: {status_color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{status_icon} Lead {status.title()}!</h1>
                    <p>Your lead has been reviewed</p>
                </div>
                <div class="content">
                    <h2>Hello {vendor_name},</h2>
                    <p>Your lead has been reviewed by our team.</p>
                    
                    <div class="status-box">
                        <h3>Lead: {lead_title}</h3>
                        <p><strong>Status:</strong> {status.title()}</p>
                        {f'<p><strong>Notes:</strong> {notes}</p>' if notes else ''}
                    </div>
                    
                    <a href="http://localhost:5173/dashboard/vendor" class="button">View Dashboard</a>
                    
                    <p>Thank you for using Lead Nexus!</p>
                    
                    <p>Best regards,<br>The Lead Nexus Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 Lead Nexus. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Lead {status.title()} - {lead_title}
        
        Hello {vendor_name},
        
        Your lead has been reviewed by our team.
        
        Lead: {lead_title}
        Status: {status.title()}
        {f'Notes: {notes}' if notes else ''}
        
        View Dashboard: http://localhost:5173/dashboard/vendor
        
        Thank you for using Lead Nexus!
        
        Best regards,
        The Lead Nexus Team
        
        © 2024 Lead Nexus. All rights reserved.
        """
        
        return {
            'subject': subject,
            'html': html_content,
            'text': text_content
        }

# Global email service instance
email_service = EmailService()
