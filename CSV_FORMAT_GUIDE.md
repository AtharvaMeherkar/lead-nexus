# 📊 CSV Upload Format Guide

## Required CSV Format for Lead Import

This guide explains the exact format required for uploading leads via CSV in the Admin Panel.

---

## 📋 Column Requirements

### **Required Columns** (Must be present)

| Column Name | Description | Example | Notes |
|------------|-------------|---------|-------|
| `email` | Lead's email address | `john.doe@example.com` | Must be unique, duplicates will be skipped |
| `full_name` | Lead's full name | `John Doe` | Will be automatically formatted (Title Case) |

### **Optional Columns** (Will use defaults if missing)

| Column Name | Description | Example | Default Value |
|------------|-------------|---------|---------------|
| `job_title` | Lead's job title | `Software Engineer` | `"Unknown"` |
| `company_name` | Lead's company name | `Tech Corp Inc` | `"Unknown"` |
| `location` | Lead's location | `San Francisco, CA` | `null` (empty) |

### **Auto-Generated Column**

| Column Name | Description | How It's Generated |
|------------|-------------|-------------------|
| `domain` | Email domain | Automatically extracted from email (e.g., `example.com` from `john@example.com`) |

---

## ✅ Valid CSV Examples

### Example 1: Minimal Format (Required columns only)

```csv
email,full_name
john.doe@example.com,John Doe
jane.smith@techcorp.com,Jane Smith
bob.wilson@startup.io,Bob Wilson
```

### Example 2: Complete Format (All columns)

```csv
email,full_name,job_title,company_name,location
john.doe@example.com,John Doe,Software Engineer,Tech Corp Inc,San Francisco CA
jane.smith@techcorp.com,Jane Smith,Product Manager,Startup Labs,New York NY
bob.wilson@startup.io,Bob Wilson,CEO,Innovation Co,Seattle WA
sarah.jones@bigcorp.com,Sarah Jones,Marketing Director,Big Corp,Los Angeles CA
```

### Example 3: Mixed Format (Some optional fields missing)

```csv
email,full_name,job_title,company_name,location
alice.brown@company.com,Alice Brown,Developer,Tech Solutions,
charlie.davis@startup.io,Charlie Davis,Designer,,Austin TX
diana.miller@corp.com,Diana Miller,,Enterprise Inc,Boston MA
```

**Result:**
- Alice: location will be empty
- Charlie: company_name will be "Unknown"
- Diana: job_title will be "Unknown"

---

## 📝 Column Name Rules

1. **Case-Insensitive**: Column names are case-insensitive
   - ✅ `email`, `Email`, `EMAIL` - all work
   - ✅ `full_name`, `Full_Name`, `FULL_NAME` - all work

2. **Spaces Allowed**: Spaces in column names are allowed
   - ✅ `full name`, `job title`, `company name` - all work

3. **Underscores Preferred**: Use underscores for consistency
   - ✅ `full_name`, `job_title`, `company_name` (recommended)

---

## ⚠️ Important Notes

### 1. **Duplicate Emails**
- Duplicate emails within the CSV file are automatically removed (only first occurrence kept)
- Emails that already exist in the database are skipped (not imported)

### 2. **Data Formatting**
- **Full Name**: Automatically converted to Title Case
  - `"john doe"` → `"John Doe"`
  - `"JANE SMITH"` → `"Jane Smith"`

- **Email**: Must be valid email format
  - ✅ `user@example.com`
  - ❌ `invalid-email` (will cause error)

### 3. **Empty Values**
- Empty `job_title` or `company_name` → defaults to `"Unknown"`
- Empty `location` → stored as `null` (empty)

### 4. **Domain Extraction**
- Domain is automatically extracted from email
  - `john@example.com` → domain: `example.com`
  - `user@subdomain.company.co.uk` → domain: `subdomain.company.co.uk`

---

## 🚫 Common Errors

### Error 1: Missing Required Columns
```
CSV missing required columns: email, full_name
```
**Solution**: Ensure your CSV has both `email` and `full_name` columns.

### Error 2: Invalid CSV Format
```
Invalid CSV file
```
**Solution**: 
- Check that the file is a valid CSV
- Ensure proper comma separation
- Check for encoding issues (use UTF-8)

### Error 3: Empty CSV
```
No leads to import
```
**Solution**: Ensure your CSV has at least one data row (not just headers).

---

## 📄 Sample CSV File

Save this as `sample_leads.csv`:

```csv
email,full_name,job_title,company_name,location
john.doe@techcorp.com,John Doe,Senior Software Engineer,Tech Corp Inc,San Francisco CA
jane.smith@startup.io,Jane Smith,Product Manager,Startup Labs,New York NY
bob.wilson@enterprise.com,Bob Wilson,CEO,Enterprise Solutions,Seattle WA
alice.brown@design.co,Alice Brown,UX Designer,Design Studio,Los Angeles CA
charlie.davis@marketing.com,Charlie Davis,Marketing Director,Marketing Pro,Boston MA
diana.miller@sales.io,Diana Miller,Sales Manager,Sales Force,Austin TX
eve.johnson@hr.com,Eve Johnson,HR Director,HR Solutions,Chicago IL
frank.moore@finance.com,Frank Moore,CFO,Finance Corp,Denver CO
```

---

## 🔄 Upload Process

1. **Prepare your CSV file** with the required format
2. **Go to Admin Panel** → `/admin` route
3. **Click "Import Leads"** section
4. **Select your CSV file**
5. **Click "Upload CSV"**
6. **Wait for confirmation** message showing how many leads were imported

---

## 📊 Expected Results

After upload, you'll see:
- ✅ Success message: `"✅ X leads imported"`
- The number shows only **new leads** (duplicates and existing emails are excluded)
- Check the "Recent Leads" tab to see your imported leads

---

## 💡 Tips

1. **Use Excel/Google Sheets** to prepare your CSV:
   - Create columns: `email`, `full_name`, `job_title`, `company_name`, `location`
   - Fill in the data
   - Export as CSV (UTF-8 encoding)

2. **Validate Emails** before uploading:
   - Ensure all emails are valid format
   - Remove any duplicates in your source file

3. **Check for Existing Leads**:
   - If you're re-uploading, existing emails will be skipped
   - Only new leads will be imported

4. **Large Files**:
   - The system handles large CSV files efficiently
   - Duplicate emails are automatically filtered

---

## 🎯 Quick Reference

**Minimum Required:**
```csv
email,full_name
user@example.com,User Name
```

**Recommended (Complete):**
```csv
email,full_name,job_title,company_name,location
user@example.com,User Name,Job Title,Company Name,Location
```

---

**Need Help?** Check the Admin Panel → Recent Leads tab to verify your uploads!

