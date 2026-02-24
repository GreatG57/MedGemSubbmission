import getpass
from huggingface_hub import login

print("---------------------------------------------------------")
print("PASTE YOUR TOKEN BELOW (Right-click to paste in PowerShell)")
print("Then press ENTER.")
print("---------------------------------------------------------")

# This securely grabs your input and removes hidden spaces
try:
    token = getpass.getpass("Token: ").strip()
    
    # Attempt login
    login(token=token)
    print("\n SUCCESS! You are now logged in.")
    print("You can now delete this file and run 'python main.py'")

except Exception as e:
    print(f"\n Error: {e}")