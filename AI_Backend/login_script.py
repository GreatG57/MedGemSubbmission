from huggingface_hub import login

# Paste your token inside the quotes below
# Get it from: https://huggingface.co/settings/tokens
# It will start with "hf_"
my_token = ""

print("Attempting to log in...")

try:
    login(token=my_token)
    print("SUCCESS: You are logged in.")
    print("You can now run 'python main.py'")
except Exception as e:
    print(f"Error: {e}")