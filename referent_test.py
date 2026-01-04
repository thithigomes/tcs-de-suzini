import requests
import sys
import json
from datetime import datetime

class ReferentAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.referent_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_referent_login(self):
        """Test referent login"""
        success, response = self.run_test(
            "Referent Login",
            "POST",
            "auth/login",
            200,
            data={"email": "referent@tcssuzini.fr", "password": "referent123"}
        )
        if success and 'token' in response:
            self.referent_token = response['token']
            print(f"   Referent role: {response.get('user', {}).get('role')}")
            return True
        return False

    def test_referent_get_all_users(self):
        """Test referent getting all users"""
        if not self.referent_token:
            print("❌ No referent token available")
            return False
        
        success, response = self.run_test(
            "Referent Get All Users",
            "GET",
            "referent/users",
            200,
            token=self.referent_token
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} users")
            # Store a test user ID for further testing
            if response:
                self.test_user_id = response[0]['id']
        return success

    def test_referent_toggle_license(self):
        """Test referent toggling user license status"""
        if not self.referent_token or not self.test_user_id:
            print("❌ No referent token or test user ID available")
            return False
        
        success, response = self.run_test(
            "Referent Toggle User License",
            "PATCH",
            f"referent/users/{self.test_user_id}/toggle-license",
            200,
            token=self.referent_token
        )
        if success:
            print(f"   License status changed to: {response.get('est_licencie')}")
        return success

    def test_forgot_password(self):
        """Test forgot password functionality"""
        success, response = self.run_test(
            "Forgot Password",
            "POST",
            "auth/forgot-password",
            200,
            data={"email": "admin@tcssuzini.fr"}
        )
        if success:
            print(f"   Message: {response.get('message')}")
        return success

    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        success, response = self.run_test(
            "Reset Password (Invalid Token)",
            "POST",
            "auth/reset-password",
            400,  # Expecting bad request
            data={"token": "invalid_token", "new_password": "newpass123"}
        )
        return success

def main():
    print("🏐 Testing Referent & Password Reset APIs...")
    tester = ReferentAPITester()

    # Test sequence
    tests = [
        ("Referent Login", tester.test_referent_login),
        ("Referent Get All Users", tester.test_referent_get_all_users),
        ("Referent Toggle License", tester.test_referent_toggle_license),
        ("Forgot Password", tester.test_forgot_password),
        ("Reset Password Invalid Token", tester.test_reset_password_invalid_token),
    ]

    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            tester.failed_tests.append({
                "test": test_name,
                "error": str(e)
            })

    # Print results
    print(f"\n📊 Referent API Test Results:")
    print(f"   Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")

    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())