"""
Quick script to reinstall bcrypt with correct version.
Run this if you're getting bcrypt compatibility errors.
"""
import subprocess
import sys

print("Reinstalling bcrypt with compatible version...")
try:
    subprocess.check_call([sys.executable, "-m", "pip", "uninstall", "-y", "bcrypt"])
    subprocess.check_call([sys.executable, "-m", "pip", "install", "bcrypt>=4.0.0"])
    print("✓ bcrypt reinstalled successfully!")
except Exception as e:
    print(f"Error: {e}")
    print("Try running manually:")
    print("  pip uninstall -y bcrypt")
    print("  pip install bcrypt>=4.0.0")

