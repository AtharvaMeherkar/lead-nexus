import io

import pandas as pd
from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Lead


def clean_job_title(job_title: str) -> str:
    """Extract and clean all job titles from a string that may contain multiple titles.
    
    Handles formats like:
    - "CEO, CTO" → "CEO, CTO"
    - "Manager / Director" → "Manager, Director"
    - "VP | Head of Sales" → "VP, Head of Sales"
    - "Senior Developer, Tech Lead" → "Senior Developer, Tech Lead"
    
    Returns all job titles separated by commas.
    """
    if pd.isna(job_title) or not job_title:
        return "Unknown"
    
    job_title = str(job_title).strip()
    
    # Split by common delimiters and collect all titles
    titles = []
    found_delimiter = False
    
    for delimiter in [',', '/', '|', ';', '&']:
        if delimiter in job_title:
            # Split by this delimiter
            parts = [part.strip() for part in job_title.split(delimiter)]
            titles = [part for part in parts if part]  # Remove empty parts
            found_delimiter = True
            break
    
    # If no delimiter found, use the whole string as single title
    if not found_delimiter:
        titles = [job_title.strip()]
    
    # Clean each title (remove extra whitespace)
    cleaned_titles = [' '.join(title.split()) for title in titles if title.strip()]
    
    # Return all titles joined by comma
    if cleaned_titles:
        return ', '.join(cleaned_titles)
    else:
        return "Unknown"


async def process_leads_csv(session: AsyncSession, file: UploadFile) -> int:
    content = await file.read()
    file_extension = file.filename.lower().split('.')[-1] if file.filename else ''
    
    df = None
    
    # Detect file type and read accordingly
    try:
        # Check if it's an Excel file (.xlsx, .xls)
        # Excel files start with 'PK' (ZIP signature) or have .xlsx/.xls extension
        is_excel = file_extension in ['xlsx', 'xls'] or content.startswith(b'PK')
        
        if is_excel:
            try:
                # Try reading as Excel file (.xlsx format)
                df = pd.read_excel(
                    io.BytesIO(content),
                    engine='openpyxl',  # For .xlsx files
                    dtype=str,  # Read all as strings first
                    na_filter=False  # Don't convert empty cells to NaN
                )
            except Exception as excel_error:
                # Provide helpful error message
                if 'openpyxl' in str(excel_error).lower() or 'not supported' in str(excel_error).lower():
                    raise HTTPException(
                        status_code=400,
                        detail="Excel file format not supported. Please convert your file to .xlsx format or save as CSV. For .xls files, please convert to .xlsx first."
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid Excel file. Please ensure the file is a valid .xlsx file with columns: email, full_name. Error: {str(excel_error)[:200]}"
                    )
        
        # If not Excel, try CSV
        else:
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-8-sig']
            
            for encoding in encodings:
                try:
                    # Try reading with different separators
                    for sep in [',', ';', '\t']:
                        try:
                            df = pd.read_csv(
                                io.BytesIO(content),
                                encoding=encoding,
                                sep=sep,
                                on_bad_lines='skip',  # Skip problematic lines
                                engine='python',  # More flexible parsing
                                quotechar='"',
                                skipinitialspace=True,
                                dtype=str  # Read all as strings first to avoid type issues
                            )
                            if df is not None and len(df) > 0:
                                break
                        except Exception:
                            continue
                    if df is not None and len(df) > 0:
                        break
                except Exception:
                    continue
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not parse the file. Please ensure it's a valid CSV or Excel file (.csv, .xlsx, .xls). Error: {str(e)}"
        )
    
    if df is None or len(df) == 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid file: Could not parse the file. Please check the format. Supported formats: CSV (.csv), Excel (.xlsx, .xls)"
        )

    # Normalize column names (case-insensitive, strip whitespace)
    df.columns = df.columns.str.lower().str.strip()
    
    required_columns = {"email", "full_name"}
    if not required_columns.issubset(set(df.columns)):
        raise HTTPException(
            status_code=400, 
            detail=f"CSV missing required columns: email, full_name. Found columns: {', '.join(df.columns)}"
        )

    # Clean and process data
    df["full_name"] = df["full_name"].astype(str).str.strip().str.title()
    df["email"] = df["email"].astype(str).str.strip().str.lower()
    
    # Extract domain from email
    df["domain"] = df["email"].str.split("@").str[-1]
    
    # Clean job_title - handle multiple titles by taking the first one
    if "job_title" in df.columns:
        df["job_title"] = df["job_title"].apply(clean_job_title)
    else:
        df["job_title"] = "Unknown"
    
    # Clean company_name
    if "company_name" in df.columns:
        df["company_name"] = df["company_name"].astype(str).str.strip()
        df["company_name"] = df["company_name"].replace(["nan", "None", ""], "Unknown")
    else:
        df["company_name"] = "Unknown"
    
    # Clean location (optional field)
    if "location" in df.columns:
        df["location"] = df["location"].astype(str).str.strip()
        df["location"] = df["location"].replace(["nan", "None", ""], None)
    else:
        df["location"] = None
    
    # Remove rows with invalid emails
    df = df[df["email"].str.contains("@", na=False)]
    df = df[df["email"].str.len() > 3]  # Basic email validation
    
    # Remove duplicates based on email
    df = df.drop_duplicates(subset=["email"], keep="first")
    
    # Check for existing emails in database
    existing_emails = await session.execute(select(Lead.email))
    existing_email_set = {email.lower() for (email,) in existing_emails.all()}
    df = df[~df["email"].isin(existing_email_set)]
    
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="No new leads to import. All leads already exist in the database.")

    # Create Lead objects
    leads_to_insert = []
    for _, row in df.iterrows():
        try:
            lead = Lead(
                full_name=row.get("full_name", "").strip() or "Unknown",
                email=row.get("email", "").strip().lower(),
                job_title=row.get("job_title", "Unknown").strip() or "Unknown",
                company_name=row.get("company_name", "Unknown").strip() or "Unknown",
                location=row.get("location") if pd.notna(row.get("location")) else None,
                domain=row.get("domain", "").strip() if pd.notna(row.get("domain")) else None,
            )
            # Basic validation
            if lead.email and "@" in lead.email:
                leads_to_insert.append(lead)
        except Exception as e:
            # Skip rows that can't be processed
            continue
    
    if not leads_to_insert:
        raise HTTPException(status_code=400, detail="No valid leads found in the CSV file.")
    
    session.add_all(leads_to_insert)
    await session.commit()
    return len(leads_to_insert)


