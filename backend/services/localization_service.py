#!/usr/bin/env python3
"""
Localization Service
===================

Handles multi-language support for the Lead-Nexus application.
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json
import os
from pathlib import Path


class Language(Enum):
    """Supported languages."""
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    CHINESE = "zh"
    JAPANESE = "ja"
    ARABIC = "ar"
    HINDI = "hi"


@dataclass
class TranslationKey:
    """Translation key with context."""
    key: str
    context: Optional[str] = None
    plural_forms: Optional[Dict[str, str]] = None


class LocalizationService:
    """Service for handling application localization."""
    
    def __init__(self, default_language: Language = Language.ENGLISH):
        self.default_language = default_language
        self.translations = {}
        self._load_translations()
    
    def _load_translations(self) -> None:
        """Load translation files."""
        translations_dir = Path(__file__).parent.parent / "translations"
        
        if not translations_dir.exists():
            self._create_default_translations(translations_dir)
        
        for lang in Language:
            lang_file = translations_dir / f"{lang.value}.json"
            if lang_file.exists():
                with open(lang_file, 'r', encoding='utf-8') as f:
                    self.translations[lang.value] = json.load(f)
            else:
                # Fallback to English if translation file doesn't exist
                self.translations[lang.value] = self.translations.get(
                    Language.ENGLISH.value, {}
                )
    
    def _create_default_translations(self, translations_dir: Path) -> None:
        """Create default translation files."""
        translations_dir.mkdir(exist_ok=True)
        
        # English translations (base)
        en_translations = {
            "common": {
                "welcome": "Welcome to Lead-Nexus",
                "login": "Login",
                "register": "Register",
                "logout": "Logout",
                "dashboard": "Dashboard",
                "marketplace": "Marketplace",
                "profile": "Profile",
                "settings": "Settings",
                "search": "Search",
                "filter": "Filter",
                "sort": "Sort",
                "export": "Export",
                "import": "Import",
                "save": "Save",
                "cancel": "Cancel",
                "delete": "Delete",
                "edit": "Edit",
                "view": "View",
                "add": "Add",
                "remove": "Remove",
                "loading": "Loading...",
                "error": "Error",
                "success": "Success",
                "warning": "Warning",
                "info": "Information",
                "confirm": "Confirm",
                "back": "Back",
                "next": "Next",
                "previous": "Previous",
                "submit": "Submit",
                "reset": "Reset",
                "close": "Close",
                "open": "Open",
                "yes": "Yes",
                "no": "No",
                "ok": "OK"
            },
            "auth": {
                "login_title": "Sign In to Your Account",
                "register_title": "Create New Account",
                "email": "Email Address",
                "password": "Password",
                "confirm_password": "Confirm Password",
                "forgot_password": "Forgot Password?",
                "remember_me": "Remember Me",
                "login_button": "Sign In",
                "register_button": "Create Account",
                "already_have_account": "Already have an account?",
                "dont_have_account": "Don't have an account?",
                "invalid_credentials": "Invalid email or password",
                "account_created": "Account created successfully",
                "password_mismatch": "Passwords do not match",
                "email_required": "Email is required",
                "password_required": "Password is required",
                "password_min_length": "Password must be at least 6 characters"
            },
            "leads": {
                "title": "Lead Title",
                "description": "Description",
                "industry": "Industry",
                "price": "Price",
                "contact_name": "Contact Name",
                "contact_email": "Contact Email",
                "contact_phone": "Contact Phone",
                "company_name": "Company Name",
                "location": "Location",
                "status": "Status",
                "lead_score": "Lead Score",
                "upload_leads": "Upload Leads",
                "purchase_lead": "Purchase Lead",
                "add_to_cart": "Add to Cart",
                "lead_details": "Lead Details",
                "lead_quality": "Lead Quality",
                "lead_source": "Lead Source",
                "lead_status": "Lead Status",
                "available": "Available",
                "sold": "Sold",
                "pending": "Pending",
                "expired": "Expired"
            },
            "marketplace": {
                "title": "Lead Marketplace",
                "browse_leads": "Browse Available Leads",
                "filter_by_industry": "Filter by Industry",
                "filter_by_price": "Filter by Price",
                "filter_by_location": "Filter by Location",
                "sort_by": "Sort by",
                "price_low_to_high": "Price: Low to High",
                "price_high_to_low": "Price: High to Low",
                "date_newest": "Date: Newest First",
                "date_oldest": "Date: Oldest First",
                "lead_score": "Lead Score",
                "no_leads_found": "No leads found matching your criteria",
                "leads_found": "{count} leads found",
                "view_details": "View Details",
                "contact_vendor": "Contact Vendor"
            },
            "dashboard": {
                "overview": "Overview",
                "recent_activity": "Recent Activity",
                "quick_stats": "Quick Statistics",
                "total_leads": "Total Leads",
                "total_sales": "Total Sales",
                "total_revenue": "Total Revenue",
                "conversion_rate": "Conversion Rate",
                "top_performing": "Top Performing",
                "recent_orders": "Recent Orders",
                "recent_uploads": "Recent Uploads",
                "analytics": "Analytics",
                "reports": "Reports",
                "performance": "Performance",
                "trends": "Trends"
            },
            "errors": {
                "general_error": "An error occurred. Please try again.",
                "network_error": "Network error. Please check your connection.",
                "unauthorized": "You are not authorized to perform this action.",
                "not_found": "The requested resource was not found.",
                "validation_error": "Please check your input and try again.",
                "server_error": "Server error. Please try again later.",
                "timeout_error": "Request timed out. Please try again.",
                "file_too_large": "File is too large. Please choose a smaller file.",
                "invalid_file_type": "Invalid file type. Please choose a valid file.",
                "duplicate_entry": "This entry already exists."
            },
            "notifications": {
                "lead_purchased": "Lead purchased successfully",
                "lead_uploaded": "Leads uploaded successfully",
                "order_created": "Order created successfully",
                "payment_successful": "Payment processed successfully",
                "message_sent": "Message sent successfully",
                "profile_updated": "Profile updated successfully",
                "settings_saved": "Settings saved successfully"
            }
        }
        
        # Save English translations
        with open(translations_dir / "en.json", 'w', encoding='utf-8') as f:
            json.dump(en_translations, f, indent=2, ensure_ascii=False)
        
        # Create basic translations for other languages
        other_languages = {
            "es": "Spanish",
            "fr": "French", 
            "de": "German",
            "zh": "Chinese",
            "ja": "Japanese",
            "ar": "Arabic",
            "hi": "Hindi"
        }
        
        for lang_code, lang_name in other_languages.items():
            # For now, use English as fallback
            # In a real implementation, these would be properly translated
            with open(translations_dir / f"{lang_code}.json", 'w', encoding='utf-8') as f:
                json.dump(en_translations, f, indent=2, ensure_ascii=False)
    
    def get_text(self, key: str, language: Language = None, **kwargs) -> str:
        """
        Get translated text for a given key.
        
        Args:
            key: Translation key (e.g., "common.welcome")
            language: Target language
            **kwargs: Format parameters
            
        Returns:
            Translated text
        """
        if language is None:
            language = self.default_language
        
        # Get translation
        translation = self.translations.get(language.value, {})
        
        # Navigate nested keys (e.g., "common.welcome")
        keys = key.split('.')
        text = translation
        
        for k in keys:
            if isinstance(text, dict):
                text = text.get(k, key)
            else:
                text = key
                break
        
        # If translation not found, fallback to English
        if text == key and language != Language.ENGLISH:
            return self.get_text(key, Language.ENGLISH, **kwargs)
        
        # Format the text with provided parameters
        if kwargs:
            try:
                text = text.format(**kwargs)
            except (KeyError, ValueError):
                pass
        
        return text
    
    def get_plural_text(self, key: str, count: int, language: Language = None) -> str:
        """
        Get pluralized text based on count.
        
        Args:
            key: Translation key
            count: Number for pluralization
            language: Target language
            
        Returns:
            Pluralized text
        """
        if language is None:
            language = self.default_language
        
        # Simple English pluralization rules
        if language == Language.ENGLISH:
            base_text = self.get_text(key, language)
            if count == 1:
                return base_text
            else:
                # Simple pluralization - in a real app, you'd use a proper pluralization library
                return base_text + "s"
        
        # For other languages, you'd implement proper pluralization rules
        return self.get_text(key, language)
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages with their display names."""
        return {
            lang.value: lang.name.title() for lang in Language
        }
    
    def detect_language(self, text: str) -> Language:
        """
        Detect language from text (basic implementation).
        
        Args:
            text: Text to analyze
            
        Returns:
            Detected language
        """
        # This is a basic implementation
        # In a real app, you'd use a proper language detection library
        
        # Simple heuristics for common languages
        if any(char in text for char in "áéíóúñ"):
            return Language.SPANISH
        elif any(char in text for char in "àâäéèêëïîôöùûüÿç"):
            return Language.FRENCH
        elif any(char in text for char in "äöüß"):
            return Language.GERMAN
        elif any(char in text for char in "一丁七万三上下不"):
            return Language.CHINESE
        elif any(char in text for char in "あいうえおかきくけこ"):
            return Language.JAPANESE
        elif any(char in text for char in "ا ب ت ث ج ح خ"):
            return Language.ARABIC
        elif any(char in text for char in "अ आ इ ई उ ऊ ए ऐ"):
            return Language.HINDI
        
        return Language.ENGLISH


# Global instance
localization_service = LocalizationService()
