#!/usr/bin/env python3
"""
Python Environment Status Checker

This utility checks the status of the Python environment,
particularly focused on detecting externally-managed environments
as defined in PEP 668.
"""

import os
import sys
import site
import subprocess
from pathlib import Path


def is_externally_managed():
    """Check if the Python environment is externally managed (PEP 668)."""
    # Check for the marker file in site-packages
    site_packages = site.getsitepackages()[0]
    marker_file = os.path.join(site_packages, "EXTERNALLY-MANAGED")
    
    return os.path.isfile(marker_file)


def is_virtual_env():
    """Check if running in a virtual environment."""
    return hasattr(sys, "real_prefix") or (
        hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix
    )


def get_env_details():
    """Get detailed information about the Python environment."""
    return {
        "executable": sys.executable,
        "version": sys.version,
        "platform": sys.platform,
        "prefix": sys.prefix,
        "base_prefix": getattr(sys, "base_prefix", None),
        "site_packages": site.getsitepackages()[0],
        "user_site": site.getusersitepackages(),
        "path": sys.path,
    }


def test_pip_install():
    """Test if pip install works outside of virtual environment."""
    if is_virtual_env():
        return {"status": "skipped", "message": "Already in a virtual environment"}
    
    # Try to install a non-existent package to test the response
    cmd = [sys.executable, "-m", "pip", "install", "--dry-run", "nonexistentpackage123456789"]
    
    try:
        subprocess.run(cmd, capture_output=True, check=False, text=True)
        return {"status": "allowed", "message": "Direct pip installation appears to be allowed"}
    except subprocess.CalledProcessError as e:
        if "externally-managed-environment" in e.stderr:
            return {"status": "restricted", "message": "Externally managed environment detected"}
        return {"status": "error", "message": f"Error: {e.stderr}"}


def main():
    """Main function to display environment status."""
    print("\n=== Python Environment Status ===\n")
    
    # Check environment type
    venv_status = "Active" if is_virtual_env() else "Not Active"
    ext_managed = is_externally_managed()
    
    print(f"Virtual Environment: {venv_status}")
    print(f"Externally Managed: {'Yes' if ext_managed else 'No'}")
    
    # Print environment details
    details = get_env_details()
    print("\n=== Environment Details ===\n")
    print(f"Python Executable: {details['executable']}")
    print(f"Python Version: {' '.join(details['version'].split()[:2])}")
    print(f"System Platform: {details['platform']}")
    print(f"Site Packages: {details['site_packages']}")
    
    # Test pip install functionality
    if not is_virtual_env():
        print("\n=== Pip Install Test ===\n")
        test_result = test_pip_install()
        print(f"Direct pip install: {test_result['status']}")
        print(f"Message: {test_result['message']}")
    
    # Print summary
    print("\n=== Summary ===\n")
    if is_virtual_env():
        print("✅ Using a virtual environment - package installation is isolated and safe")
    elif ext_managed:
        print("⚠️ System Python is externally managed - use virtual environments for packages")
    else:
        print("ℹ️ System Python allows direct package installation (not recommended)")


if __name__ == "__main__":
    main()